/**
 * Testes Unitários - Phone Normalizer Service
 * Testa normalização, validação e formatação de telefones
 */

const {
  normalizePhone,
  isPhoneValid,
  formatPhone,
  normalizePhones,
  comparePhones
} = require('../../services/phoneNormalizer');

describe('PhoneNormalizer Service', () => {
  describe('normalizePhone', () => {
    test('deve normalizar telefone brasileiro com DDD e 9 dígitos', () => {
      const result = normalizePhone('(11) 99999-9999');
      expect(result).toBe('+5511999999999');
    });

    test('deve normalizar telefone sem formatação', () => {
      const result = normalizePhone('11999999999');
      expect(result).toBe('+5511999999999');
    });

    test('deve normalizar telefone com código do país', () => {
      const result = normalizePhone('+5511999999999');
      expect(result).toBe('+5511999999999');
    });

    test('deve normalizar telefone com espaços e traços', () => {
      const result = normalizePhone('11 9 9999-9999');
      expect(result).toBe('+5511999999999');
    });

    test('deve retornar null para telefone inválido', () => {
      const result = normalizePhone('123');
      expect(result).toBeNull();
    });

    test('deve retornar null para string vazia', () => {
      const result = normalizePhone('');
      expect(result).toBeNull();
    });

    test('deve retornar null para null', () => {
      const result = normalizePhone(null);
      expect(result).toBeNull();
    });

    test('deve retornar null para undefined', () => {
      const result = normalizePhone(undefined);
      expect(result).toBeNull();
    });

    test('deve normalizar telefone fixo brasileiro', () => {
      const result = normalizePhone('(11) 3333-4444');
      expect(result).toBe('+551133334444');
    });

    test('deve normalizar telefone de outro país', () => {
      const result = normalizePhone('(212) 555-1234', 'US');
      expect(result).toBe('+12125551234');
    });
  });

  describe('isPhoneValid', () => {
    test('deve validar telefone brasileiro correto', () => {
      expect(isPhoneValid('(11) 99999-9999')).toBe(true);
      expect(isPhoneValid('11999999999')).toBe(true);
      expect(isPhoneValid('+5511999999999')).toBe(true);
    });

    test('deve invalidar telefone incorreto', () => {
      expect(isPhoneValid('123')).toBe(false);
      expect(isPhoneValid('abc')).toBe(false);
      expect(isPhoneValid('')).toBe(false);
    });

    test('deve invalidar null e undefined', () => {
      expect(isPhoneValid(null)).toBe(false);
      expect(isPhoneValid(undefined)).toBe(false);
    });
  });

  describe('formatPhone', () => {
    test('deve formatar telefone em formato nacional', () => {
      const result = formatPhone('+5511999999999', 'national');
      expect(result).toMatch(/\(11\)\s*9\s*9999[- ]9999/);
    });

    test('deve formatar telefone em formato internacional', () => {
      const result = formatPhone('+5511999999999', 'international');
      expect(result).toMatch(/\+55.*11.*9.*9999.*9999/);
    });

    test('deve retornar original se não conseguir formatar', () => {
      const invalid = 'invalid';
      const result = formatPhone(invalid);
      expect(result).toBe(invalid);
    });

    test('deve retornar null para entrada inválida', () => {
      expect(formatPhone(null)).toBeNull();
      expect(formatPhone(undefined)).toBeNull();
    });
  });

  describe('normalizePhones', () => {
    test('deve normalizar array de telefones', () => {
      const phones = [
        '(11) 99999-9999',
        '21988887777',
        '+5585966665555'
      ];
      const result = normalizePhones(phones);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toBe('+5511999999999');
      expect(result[1]).toBe('+5521988887777');
      expect(result[2]).toBe('+5585966665555');
    });

    test('deve filtrar telefones inválidos', () => {
      const phones = [
        '(11) 99999-9999',
        'invalid',
        '123',
        '21988887777'
      ];
      const result = normalizePhones(phones);
      
      expect(result).toHaveLength(2);
      expect(result).toContain('+5511999999999');
      expect(result).toContain('+5521988887777');
    });

    test('deve retornar array vazio para entrada não-array', () => {
      expect(normalizePhones(null)).toEqual([]);
      expect(normalizePhones(undefined)).toEqual([]);
      expect(normalizePhones('notarray')).toEqual([]);
    });

    test('deve retornar array vazio para array vazio', () => {
      expect(normalizePhones([])).toEqual([]);
    });
  });

  describe('comparePhones', () => {
    test('deve identificar telefones iguais com formatações diferentes', () => {
      const phone1 = '(11) 99999-9999';
      const phone2 = '11999999999';
      const phone3 = '+5511999999999';
      
      expect(comparePhones(phone1, phone2)).toBe(true);
      expect(comparePhones(phone2, phone3)).toBe(true);
      expect(comparePhones(phone1, phone3)).toBe(true);
    });

    test('deve identificar telefones diferentes', () => {
      const phone1 = '(11) 99999-9999';
      const phone2 = '(11) 88888-8888';
      
      expect(comparePhones(phone1, phone2)).toBe(false);
    });

    test('deve retornar false para telefones inválidos', () => {
      expect(comparePhones('invalid', '(11) 99999-9999')).toBe(false);
      expect(comparePhones('(11) 99999-9999', 'invalid')).toBe(false);
      expect(comparePhones('invalid', 'invalid2')).toBe(false);
    });

    test('deve retornar false para null/undefined', () => {
      expect(comparePhones(null, '(11) 99999-9999')).toBe(false);
      expect(comparePhones('(11) 99999-9999', null)).toBe(false);
      expect(comparePhones(null, null)).toBe(false);
    });
  });
});

