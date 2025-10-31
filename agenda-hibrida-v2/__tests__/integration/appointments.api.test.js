/**
 * Testes de Integração - API de Agendamentos
 * Testa endpoints REST de CRUD completo
 */

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { setupTestDatabase, clearDatabase, closeDatabase } = require('./setup');

// Criar app de teste simplificado
const createTestApp = (db) => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // GET /api/appointments - Listar agendamentos
  app.get('/api/appointments', (req, res) => {
    const sql = `
      SELECT a.*, c.name as client_name, t.name as tattoo_type_name
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN tattoo_types t ON a.tattoo_type_id = t.id
      ORDER BY a.start_time DESC
    `;

    db.all(sql, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  // GET /api/appointments/:id - Buscar agendamento por ID
  app.get('/api/appointments/:id', (req, res) => {
    const { id } = req.params;
    const sql = `
      SELECT a.*, c.name as client_name, t.name as tattoo_type_name
      FROM appointments a
      LEFT JOIN clients c ON a.client_id = c.id
      LEFT JOIN tattoo_types t ON a.tattoo_type_id = t.id
      WHERE a.id = ?
    `;

    db.get(sql, [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }
      res.json(row);
    });
  });

  // POST /api/appointments - Criar agendamento
  app.post('/api/appointments', (req, res) => {
    const { client_id, title, description, start_time, end_time, tattoo_type_id, status } = req.body;

    // Validações
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }

    if (!start_time) {
      return res.status(400).json({ error: 'Data de início é obrigatória' });
    }

    if (!end_time) {
      return res.status(400).json({ error: 'Data de fim é obrigatória' });
    }

    // Validar que data fim é depois da data início
    if (new Date(end_time) <= new Date(start_time)) {
      return res.status(400).json({ error: 'Data de fim deve ser depois da data de início' });
    }

    const sql = `
      INSERT INTO appointments (client_id, title, description, start_time, end_time, tattoo_type_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const statusValue = status || 'pending';

    db.run(sql, [client_id, title, description, start_time, end_time, tattoo_type_id, statusValue], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Buscar agendamento criado
      const selectSql = `
        SELECT a.*, c.name as client_name, t.name as tattoo_type_name
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        LEFT JOIN tattoo_types t ON a.tattoo_type_id = t.id
        WHERE a.id = ?
      `;

      db.get(selectSql, [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json(row);
      });
    });
  });

  // PUT /api/appointments/:id - Atualizar agendamento
  app.put('/api/appointments/:id', (req, res) => {
    const { id } = req.params;
    const { client_id, title, description, start_time, end_time, tattoo_type_id, status } = req.body;

    // Validações
    if (!title || title.trim().length === 0) {
      return res.status(400).json({ error: 'Título é obrigatório' });
    }

    if (end_time && start_time && new Date(end_time) <= new Date(start_time)) {
      return res.status(400).json({ error: 'Data de fim deve ser depois da data de início' });
    }

    const sql = `
      UPDATE appointments
      SET client_id = ?, title = ?, description = ?, start_time = ?, end_time = ?, tattoo_type_id = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(sql, [client_id, title, description, start_time, end_time, tattoo_type_id, status, id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      // Buscar agendamento atualizado
      const selectSql = `
        SELECT a.*, c.name as client_name, t.name as tattoo_type_name
        FROM appointments a
        LEFT JOIN clients c ON a.client_id = c.id
        LEFT JOIN tattoo_types t ON a.tattoo_type_id = t.id
        WHERE a.id = ?
      `;

      db.get(selectSql, [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(row);
      });
    });
  });

  // DELETE /api/appointments/:id - Excluir agendamento
  app.delete('/api/appointments/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM appointments WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      res.json({ message: 'Agendamento excluído com sucesso', id: parseInt(id) });
    });
  });

  return app;
};

describe('Appointments API Integration Tests', () => {
  let app;
  let db;
  let clientId;
  let tattooTypeId;

  // Setup antes de todos os testes
  beforeAll(async () => {
    db = await setupTestDatabase();
    app = createTestApp(db);
  });

  // Criar cliente e tipo de tatuagem antes de cada teste
  beforeEach(async () => {
    // Criar cliente de teste
    clientId = await new Promise((resolve) => {
      db.run(
        `INSERT INTO clients (name, email, phone) VALUES ('João Silva', 'joao@test.com', '11999999999')`,
        function() {
          resolve(this.lastID);
        }
      );
    });

    // Buscar tipo de tatuagem (já criado no setup)
    tattooTypeId = await new Promise((resolve) => {
      db.get(`SELECT id FROM tattoo_types WHERE name = 'Média'`, [], (err, row) => {
        resolve(row ? row.id : null);
      });
    });
  });

  // Limpar banco após cada teste
  afterEach(async () => {
    await clearDatabase();
  });

  // Fechar conexão após todos os testes
  afterAll(async () => {
    await closeDatabase();
  });

  describe('GET /api/appointments', () => {
    test('deve retornar lista vazia quando não há agendamentos', async () => {
      const res = await request(app).get('/api/appointments');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(0);
    });

    test('deve retornar lista de agendamentos', async () => {
      // Inserir agendamentos de teste
      await new Promise((resolve) => {
        db.run(
          `INSERT INTO appointments (client_id, title, start_time, end_time) VALUES (?, 'Tatuagem Braço', '2025-11-01 14:00:00', '2025-11-01 18:00:00')`,
          [clientId],
          resolve
        );
      });

      const res = await request(app).get('/api/appointments');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('Tatuagem Braço');
      expect(res.body[0].client_name).toBe('João Silva');
    });
  });

  describe('GET /api/appointments/:id', () => {
    test('deve retornar 404 quando agendamento não existe', async () => {
      const res = await request(app).get('/api/appointments/999');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Agendamento não encontrado');
    });

    test('deve retornar agendamento específico por ID', async () => {
      const appointmentId = await new Promise((resolve) => {
        db.run(
          `INSERT INTO appointments (client_id, title, start_time, end_time) VALUES (?, 'Tatuagem Costas', '2025-11-05 10:00:00', '2025-11-05 16:00:00')`,
          [clientId],
          function() {
            resolve(this.lastID);
          }
        );
      });

      const res = await request(app).get(`/api/appointments/${appointmentId}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(appointmentId);
      expect(res.body.title).toBe('Tatuagem Costas');
    });
  });

  describe('POST /api/appointments', () => {
    test('deve criar novo agendamento com sucesso', async () => {
      const newAppointment = {
        client_id: clientId,
        title: 'Tatuagem Perna',
        description: 'Dragão japonês',
        start_time: '2025-11-10 14:00:00',
        end_time: '2025-11-10 18:00:00',
        tattoo_type_id: tattooTypeId,
        status: 'confirmed'
      };

      const res = await request(app)
        .post('/api/appointments')
        .send(newAppointment);

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe('Tatuagem Perna');
      expect(res.body.client_name).toBe('João Silva');
      expect(res.body.status).toBe('confirmed');
    });

    test('deve retornar 400 quando título está vazio', async () => {
      const invalidAppointment = {
        client_id: clientId,
        title: '',
        start_time: '2025-11-10 14:00:00',
        end_time: '2025-11-10 18:00:00'
      };

      const res = await request(app)
        .post('/api/appointments')
        .send(invalidAppointment);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Título é obrigatório');
    });

    test('deve retornar 400 quando data de início não é fornecida', async () => {
      const invalidAppointment = {
        client_id: clientId,
        title: 'Test',
        end_time: '2025-11-10 18:00:00'
      };

      const res = await request(app)
        .post('/api/appointments')
        .send(invalidAppointment);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Data de início é obrigatória');
    });

    test('deve retornar 400 quando data fim é antes da data início', async () => {
      const invalidAppointment = {
        client_id: clientId,
        title: 'Test',
        start_time: '2025-11-10 18:00:00',
        end_time: '2025-11-10 14:00:00'
      };

      const res = await request(app)
        .post('/api/appointments')
        .send(invalidAppointment);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Data de fim deve ser depois da data de início');
    });

    test('deve criar agendamento com status padrão "pending"', async () => {
      const newAppointment = {
        client_id: clientId,
        title: 'Tatuagem Teste',
        start_time: '2025-11-10 14:00:00',
        end_time: '2025-11-10 18:00:00'
      };

      const res = await request(app)
        .post('/api/appointments')
        .send(newAppointment);

      expect(res.status).toBe(201);
      expect(res.body.status).toBe('pending');
    });
  });

  describe('PUT /api/appointments/:id', () => {
    test('deve atualizar agendamento existente', async () => {
      const appointmentId = await new Promise((resolve) => {
        db.run(
          `INSERT INTO appointments (client_id, title, start_time, end_time, status) VALUES (?, 'Old Title', '2025-11-10 14:00:00', '2025-11-10 18:00:00', 'pending')`,
          [clientId],
          function() {
            resolve(this.lastID);
          }
        );
      });

      const updatedData = {
        client_id: clientId,
        title: 'New Title',
        start_time: '2025-11-10 15:00:00',
        end_time: '2025-11-10 19:00:00',
        status: 'confirmed'
      };

      const res = await request(app)
        .put(`/api/appointments/${appointmentId}`)
        .send(updatedData);

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('New Title');
      expect(res.body.status).toBe('confirmed');
    });

    test('deve retornar 404 quando agendamento não existe', async () => {
      const res = await request(app)
        .put('/api/appointments/999')
        .send({
          title: 'Test',
          start_time: '2025-11-10 14:00:00',
          end_time: '2025-11-10 18:00:00'
        });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Agendamento não encontrado');
    });

    test('deve retornar 400 quando dados são inválidos', async () => {
      const appointmentId = await new Promise((resolve) => {
        db.run(
          `INSERT INTO appointments (client_id, title, start_time, end_time) VALUES (?, 'Test', '2025-11-10 14:00:00', '2025-11-10 18:00:00')`,
          [clientId],
          function() {
            resolve(this.lastID);
          }
        );
      });

      const res = await request(app)
        .put(`/api/appointments/${appointmentId}`)
        .send({
          title: '',
          start_time: '2025-11-10 14:00:00',
          end_time: '2025-11-10 18:00:00'
        });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Título é obrigatório');
    });
  });

  describe('DELETE /api/appointments/:id', () => {
    test('deve excluir agendamento existente', async () => {
      const appointmentId = await new Promise((resolve) => {
        db.run(
          `INSERT INTO appointments (client_id, title, start_time, end_time) VALUES (?, 'Deletar', '2025-11-10 14:00:00', '2025-11-10 18:00:00')`,
          [clientId],
          function() {
            resolve(this.lastID);
          }
        );
      });

      const res = await request(app).delete(`/api/appointments/${appointmentId}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Agendamento excluído com sucesso');

      // Verificar que foi excluído
      const checkRes = await request(app).get(`/api/appointments/${appointmentId}`);
      expect(checkRes.status).toBe(404);
    });

    test('deve retornar 404 quando agendamento não existe', async () => {
      const res = await request(app).delete('/api/appointments/999');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Agendamento não encontrado');
    });
  });
});

