/**
 * Testes de Integração - API de Clientes
 * Testa endpoints REST de CRUD completo
 */

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const { setupTestDatabase, clearDatabase, closeDatabase, getTestDatabase } = require('./setup');

// Criar app de teste simplificado
const createTestApp = (db) => {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Rota GET /api/clients - Listar todos os clientes
  app.get('/api/clients', (req, res) => {
    db.all('SELECT * FROM clients ORDER BY created_at DESC', [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(rows);
    });
  });

  // Rota GET /api/clients/:id - Buscar cliente por ID
  app.get('/api/clients/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM clients WHERE id = ?', [id], (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }
      res.json(row);
    });
  });

  // Rota POST /api/clients - Criar novo cliente
  app.post('/api/clients', (req, res) => {
    const { name, email, phone, address, notes } = req.body;

    // Validações básicas
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Normalizar telefone
    let phone_normalized = null;
    if (phone) {
      phone_normalized = phone.replace(/\D/g, '');
      if (phone_normalized.length >= 10) {
        phone_normalized = `+55${phone_normalized}`;
      }
    }

    const sql = `
      INSERT INTO clients (name, email, phone, phone_normalized, address, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [name, email, phone, phone_normalized, address, notes], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Email já cadastrado' });
        }
        return res.status(500).json({ error: err.message });
      }

      // Buscar cliente criado
      db.get('SELECT * FROM clients WHERE id = ?', [this.lastID], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(201).json(row);
      });
    });
  });

  // Rota PUT /api/clients/:id - Atualizar cliente
  app.put('/api/clients/:id', (req, res) => {
    const { id } = req.params;
    const { name, email, phone, address, notes } = req.body;

    // Validações
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Nome é obrigatório' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    // Normalizar telefone
    let phone_normalized = null;
    if (phone) {
      phone_normalized = phone.replace(/\D/g, '');
      if (phone_normalized.length >= 10) {
        phone_normalized = `+55${phone_normalized}`;
      }
    }

    const sql = `
      UPDATE clients 
      SET name = ?, email = ?, phone = ?, phone_normalized = ?, address = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    db.run(sql, [name, email, phone, phone_normalized, address, notes, id], function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(409).json({ error: 'Email já cadastrado' });
        }
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      // Buscar cliente atualizado
      db.get('SELECT * FROM clients WHERE id = ?', [id], (err, row) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json(row);
      });
    });
  });

  // Rota DELETE /api/clients/:id - Excluir cliente
  app.delete('/api/clients/:id', (req, res) => {
    const { id } = req.params;

    db.run('DELETE FROM clients WHERE id = ?', [id], function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Cliente não encontrado' });
      }

      res.json({ message: 'Cliente excluído com sucesso', id: parseInt(id) });
    });
  });

  return app;
};

describe('Clients API Integration Tests', () => {
  let app;
  let db;

  // Setup antes de todos os testes
  beforeAll(async () => {
    db = await setupTestDatabase();
    app = createTestApp(db);
  });

  // Limpar banco após cada teste
  afterEach(async () => {
    await clearDatabase();
  });

  // Fechar conexão após todos os testes
  afterAll(async () => {
    await closeDatabase();
  });

  describe('GET /api/clients', () => {
    test('deve retornar lista vazia quando não há clientes', async () => {
      const res = await request(app).get('/api/clients');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTruthy();
      expect(res.body.length).toBe(0);
    });

    test('deve retornar lista de clientes', async () => {
      // Inserir clientes de teste
      await new Promise((resolve) => {
        db.run(`INSERT INTO clients (name, email, phone) VALUES ('João Silva', 'joao@test.com', '11999999999')`, resolve);
      });
      await new Promise((resolve) => {
        db.run(`INSERT INTO clients (name, email, phone) VALUES ('Maria Santos', 'maria@test.com', '11988888888')`, resolve);
      });

      const res = await request(app).get('/api/clients');

      expect(res.status).toBe(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].name).toBeDefined();
      expect(res.body[0].email).toBeDefined();
    });
  });

  describe('GET /api/clients/:id', () => {
    test('deve retornar 404 quando cliente não existe', async () => {
      const res = await request(app).get('/api/clients/999');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Cliente não encontrado');
    });

    test('deve retornar cliente específico por ID', async () => {
      // Inserir cliente
      const clientId = await new Promise((resolve) => {
        db.run(
          `INSERT INTO clients (name, email, phone) VALUES ('João Silva', 'joao@test.com', '11999999999')`,
          function() {
            resolve(this.lastID);
          }
        );
      });

      const res = await request(app).get(`/api/clients/${clientId}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(clientId);
      expect(res.body.name).toBe('João Silva');
      expect(res.body.email).toBe('joao@test.com');
    });
  });

  describe('POST /api/clients', () => {
    test('deve criar novo cliente com sucesso', async () => {
      const newClient = {
        name: 'Pedro Oliveira',
        email: 'pedro@test.com',
        phone: '(11) 97777-7777',
        address: 'Rua Teste, 123',
        notes: 'Cliente teste'
      };

      const res = await request(app)
        .post('/api/clients')
        .send(newClient);

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.name).toBe('Pedro Oliveira');
      expect(res.body.email).toBe('pedro@test.com');
      expect(res.body.phone_normalized).toBe('+5511977777777');
    });

    test('deve retornar 400 quando nome está vazio', async () => {
      const invalidClient = {
        name: '',
        email: 'test@test.com'
      };

      const res = await request(app)
        .post('/api/clients')
        .send(invalidClient);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Nome é obrigatório');
    });

    test('deve retornar 400 quando email é inválido', async () => {
      const invalidClient = {
        name: 'João Silva',
        email: 'email-invalido'
      };

      const res = await request(app)
        .post('/api/clients')
        .send(invalidClient);

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Email inválido');
    });

    test('deve retornar 409 quando email já existe', async () => {
      // Inserir cliente primeiro
      await new Promise((resolve) => {
        db.run(`INSERT INTO clients (name, email) VALUES ('João Silva', 'joao@test.com')`, resolve);
      });

      // Tentar criar com mesmo email
      const duplicateClient = {
        name: 'Outro João',
        email: 'joao@test.com'
      };

      const res = await request(app)
        .post('/api/clients')
        .send(duplicateClient);

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Email já cadastrado');
    });
  });

  describe('PUT /api/clients/:id', () => {
    test('deve atualizar cliente existente', async () => {
      // Inserir cliente
      const clientId = await new Promise((resolve) => {
        db.run(
          `INSERT INTO clients (name, email, phone) VALUES ('João Silva', 'joao@test.com', '11999999999')`,
          function() {
            resolve(this.lastID);
          }
        );
      });

      const updatedData = {
        name: 'João Silva Updated',
        email: 'joao.updated@test.com',
        phone: '11988888888'
      };

      const res = await request(app)
        .put(`/api/clients/${clientId}`)
        .send(updatedData);

      expect(res.status).toBe(200);
      expect(res.body.name).toBe('João Silva Updated');
      expect(res.body.email).toBe('joao.updated@test.com');
    });

    test('deve retornar 404 quando cliente não existe', async () => {
      const res = await request(app)
        .put('/api/clients/999')
        .send({ name: 'Test' });

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Cliente não encontrado');
    });

    test('deve retornar 400 quando dados são inválidos', async () => {
      const clientId = await new Promise((resolve) => {
        db.run(`INSERT INTO clients (name, email) VALUES ('João', 'joao@test.com')`, function() {
          resolve(this.lastID);
        });
      });

      const res = await request(app)
        .put(`/api/clients/${clientId}`)
        .send({ name: '', email: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/clients/:id', () => {
    test('deve excluir cliente existente', async () => {
      // Inserir cliente
      const clientId = await new Promise((resolve) => {
        db.run(`INSERT INTO clients (name, email) VALUES ('João Silva', 'joao@test.com')`, function() {
          resolve(this.lastID);
        });
      });

      const res = await request(app).delete(`/api/clients/${clientId}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Cliente excluído com sucesso');
      expect(res.body.id).toBe(clientId);

      // Verificar que foi realmente excluído
      const checkRes = await request(app).get(`/api/clients/${clientId}`);
      expect(checkRes.status).toBe(404);
    });

    test('deve retornar 404 quando cliente não existe', async () => {
      const res = await request(app).delete('/api/clients/999');

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Cliente não encontrado');
    });
  });
});

