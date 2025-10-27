/**
 * Testes Unitários - Deduplication Service
 * Testa detecção de duplicatas e normalização de dados
 */

const {
  generateAppointmentHash,
  calculateNameSimilarity,
  findDuplicateClient,
  findDuplicateAppointment
} = require('../../services/dedupService');

describe('DedupService', () => {
  describe('generateAppointmentHash', () => {
    test('deve gerar hash consistente para mesmos dados', () => {
      const appointment1 = {
        client_id: 1,
        date: '2025-11-01',
        time: '14:00',
        service: 'Tatuagem Grande'
      };
      
      const appointment2 = {
        client_id: 1,
        date: '2025-11-01',
        time: '14:00',
        service: 'Tatuagem Grande'
      };
      
      const hash1 = generateAppointmentHash(appointment1);
      const hash2 = generateAppointmentHash(appointment2);
      
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(32); // MD5 hash length
    });

    test('deve gerar hashes diferentes para dados diferentes', () => {
      const appointment1 = {
        client_id: 1,
        date: '2025-11-01',
        time: '14:00',
        service: 'Tatuagem Grande'
      };
      
      const appointment2 = {
        client_id: 1,
        date: '2025-11-01',
        time: '15:00', // Horário diferente
        service: 'Tatuagem Grande'
      };
      
      const hash1 = generateAppointmentHash(appointment1);
      const hash2 = generateAppointmentHash(appointment2);
      
      expect(hash1).not.toBe(hash2);
    });

    test('deve usar client_name quando client_id não está disponível', () => {
      const appointment = {
        client_name: 'João Silva',
        date: '2025-11-01',
        time: '14:00',
        service: 'Tatuagem Média'
      };
      
      const hash = generateAppointmentHash(appointment);
      
      expect(hash).toBeDefined();
      expect(hash).toHaveLength(32);
    });

    test('deve usar title quando service não está disponível', () => {
      const appointment = {
        client_id: 1,
        date: '2025-11-01',
        time: '14:00',
        title: 'Consulta'
      };
      
      const hash = generateAppointmentHash(appointment);
      
      expect(hash).toBeDefined();
      expect(hash).toHaveLength(32);
    });

    test('deve ser case-insensitive', () => {
      const appointment1 = {
        client_name: 'João Silva',
        date: '2025-11-01',
        time: '14:00',
        service: 'Tatuagem Grande'
      };
      
      const appointment2 = {
        client_name: 'joão silva', // Lowercase
        date: '2025-11-01',
        time: '14:00',
        service: 'tatuagem grande' // Lowercase
      };
      
      const hash1 = generateAppointmentHash(appointment1);
      const hash2 = generateAppointmentHash(appointment2);
      
      expect(hash1).toBe(hash2);
    });
  });

  describe('calculateNameSimilarity', () => {
    test('deve retornar 1 para nomes idênticos', () => {
      const similarity = calculateNameSimilarity('João Silva', 'João Silva');
      expect(similarity).toBe(1);
    });

    test('deve retornar 1 para nomes idênticos case-insensitive', () => {
      const similarity = calculateNameSimilarity('João Silva', 'joão silva');
      expect(similarity).toBe(1);
    });

    test('deve retornar score alto para nomes muito similares', () => {
      const similarity = calculateNameSimilarity('João Silva Santos', 'João Silva');
      expect(similarity).toBeGreaterThan(0.5);
    });

    test('deve retornar 0 para nomes completamente diferentes', () => {
      const similarity = calculateNameSimilarity('João Silva', 'Maria Oliveira');
      expect(similarity).toBe(0);
    });

    test('deve retornar 0 para entrada inválida', () => {
      expect(calculateNameSimilarity(null, 'João Silva')).toBe(0);
      expect(calculateNameSimilarity('João Silva', null)).toBe(0);
      expect(calculateNameSimilarity(null, null)).toBe(0);
      expect(calculateNameSimilarity('', 'João Silva')).toBe(0);
    });

    test('deve ignorar espaços extras', () => {
      const similarity = calculateNameSimilarity('  João   Silva  ', 'João Silva');
      expect(similarity).toBe(1);
    });

    test('deve calcular similaridade parcial', () => {
      // 2 palavras em comum de 3 total = 2/3
      const similarity = calculateNameSimilarity('João Silva Santos', 'João Silva Oliveira');
      expect(similarity).toBeCloseTo(0.666, 2);
    });
  });

  describe('findDuplicateClient (com mock db)', () => {
    let mockDb;

    beforeEach(() => {
      mockDb = {
        get: jest.fn((query, params, callback) => {
          // Mock para simular não encontrar duplicata
          callback(null, null);
        })
      };
    });

    test('deve tentar buscar por external_id primeiro', async () => {
      const clientData = {
        external_source: 'vagaro',
        external_id: '12345',
        phone: '(11) 99999-9999',
        email: 'test@example.com',
        name: 'João Silva'
      };

      await findDuplicateClient(mockDb, clientData);

      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('external_source'),
        expect.arrayContaining(['vagaro', '12345']),
        expect.any(Function)
      );
    });

    test('deve buscar por telefone se external_id não fornecido', async () => {
      const clientData = {
        phone: '(11) 99999-9999',
        name: 'João Silva'
      };

      await findDuplicateClient(mockDb, clientData);

      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('phone_normalized'),
        expect.any(Array),
        expect.any(Function)
      );
    });

    test('deve buscar por email se telefone não fornecido', async () => {
      const clientData = {
        email: 'test@example.com',
        name: 'João Silva'
      };

      await findDuplicateClient(mockDb, clientData);

      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('email'),
        expect.arrayContaining(['test@example.com']),
        expect.any(Function)
      );
    });

    test('deve retornar null se nenhuma duplicata encontrada', async () => {
      mockDb.get = jest.fn((query, params, callback) => {
        callback(null, null);
      });

      const result = await findDuplicateClient(mockDb, {
        phone: '(11) 99999-9999'
      });

      expect(result).toBeNull();
    });

    test('deve retornar cliente encontrado', async () => {
      const existingClient = {
        id: 1,
        name: 'João Silva',
        phone: '+5511999999999'
      };

      mockDb.get = jest.fn((query, params, callback) => {
        callback(null, existingClient);
      });

      const result = await findDuplicateClient(mockDb, {
        phone: '(11) 99999-9999'
      });

      expect(result).toEqual(existingClient);
    });
  });

  describe('findDuplicateAppointment (com mock db)', () => {
    let mockDb;

    beforeEach(() => {
      mockDb = {
        get: jest.fn((query, params, callback) => {
          callback(null, null);
        })
      };
    });

    test('deve tentar buscar por google_event_id primeiro', async () => {
      const appointmentData = {
        google_event_id: 'google123',
        ical_uid: 'ical456',
        client_id: 1,
        date: '2025-11-01',
        time: '14:00'
      };

      await findDuplicateAppointment(mockDb, appointmentData);

      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('google_event_id'),
        expect.arrayContaining(['google123']),
        expect.any(Function)
      );
    });

    test('deve buscar por ical_uid se google_event_id não fornecido', async () => {
      mockDb.get = jest.fn((query, params, callback) => {
        // Primeira chamada (google_event_id) retorna null
        // Segunda chamada (ical_uid) deveria ser feita
        if (query.includes('ical_uid')) {
          callback(null, null);
        } else {
          callback(null, null);
        }
      });

      const appointmentData = {
        ical_uid: 'ical456',
        client_id: 1,
        date: '2025-11-01',
        time: '14:00'
      };

      await findDuplicateAppointment(mockDb, appointmentData);

      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('ical_uid'),
        expect.arrayContaining(['ical456']),
        expect.any(Function)
      );
    });

    test('deve buscar por external_id se IDs especiais não fornecidos', async () => {
      const appointmentData = {
        external_source: 'vagaro',
        external_id: 'ext123',
        client_id: 1,
        date: '2025-11-01',
        time: '14:00'
      };

      await findDuplicateAppointment(mockDb, appointmentData);

      expect(mockDb.get).toHaveBeenCalledWith(
        expect.stringContaining('external_source'),
        expect.arrayContaining(['vagaro', 'ext123']),
        expect.any(Function)
      );
    });

    test('deve retornar null se nenhuma duplicata encontrada', async () => {
      mockDb.get = jest.fn((query, params, callback) => {
        callback(null, null);
      });

      const result = await findDuplicateAppointment(mockDb, {
        client_id: 1,
        date: '2025-11-01',
        time: '14:00'
      });

      expect(result).toBeNull();
    });

    test('deve retornar agendamento encontrado', async () => {
      const existingAppointment = {
        id: 1,
        client_id: 1,
        date: '2025-11-01',
        time: '14:00',
        google_event_id: 'google123'
      };

      mockDb.get = jest.fn((query, params, callback) => {
        callback(null, existingAppointment);
      });

      const result = await findDuplicateAppointment(mockDb, {
        google_event_id: 'google123'
      });

      expect(result).toEqual(existingAppointment);
    });
  });
});

