/**
 * Setup para testes de integração
 * Cria banco de teste e limpa após cada teste
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs-extra');
const path = require('path');

// Usar banco em memória para cada suite de testes
let db;

/**
 * Setup do banco de teste antes de todos os testes
 * Usa banco em memória para evitar conflitos entre suites
 */
async function setupTestDatabase() {
  return new Promise((resolve, reject) => {
    // Banco em memória - cada suite terá seu próprio banco
    db = new sqlite3.Database(':memory:', (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Criar tabelas necessárias
      const schema = `
        -- Clientes
        CREATE TABLE IF NOT EXISTS clients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT UNIQUE,
          phone TEXT,
          phone_normalized TEXT,
          address TEXT,
          notes TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Agendamentos
        CREATE TABLE IF NOT EXISTS appointments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id INTEGER,
          title TEXT NOT NULL,
          description TEXT,
          start_time DATETIME NOT NULL,
          end_time DATETIME NOT NULL,
          tattoo_type_id INTEGER,
          status TEXT DEFAULT 'pending',
          google_calendar_event_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES clients(id)
        );

        -- Tipos de Tatuagem
        CREATE TABLE IF NOT EXISTS tattoo_types (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          duration INTEGER,
          price REAL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- Arquivos
        CREATE TABLE IF NOT EXISTS files (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          client_id INTEGER,
          filename TEXT NOT NULL,
          original_name TEXT,
          path TEXT NOT NULL,
          mimetype TEXT,
          size INTEGER,
          category TEXT,
          google_drive_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES clients(id)
        );

        -- Índices para performance
        CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
        CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone_normalized);
        CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
        CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(start_time);
        CREATE INDEX IF NOT EXISTS idx_files_client ON files(client_id);
      `;

      db.exec(schema, (err) => {
        if (err) {
          reject(err);
          return;
        }

        // Inserir tipos de tatuagem padrão (se ainda não existirem)
        const insertTypes = `
          INSERT OR IGNORE INTO tattoo_types (name, duration, price, description) VALUES
          ('Pequena', 120, 200, 'Tatuagem pequena (até 5cm)'),
          ('Média', 240, 400, 'Tatuagem média (5-15cm)'),
          ('Grande', 360, 800, 'Tatuagem grande (acima de 15cm)'),
          ('Sessão Completa', 480, 1200, 'Sessão completa (8h)');
        `;

        db.exec(insertTypes, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(db);
        });
      });
    });
  });
}

/**
 * Limpar todas as tabelas após cada teste (exceto tattoo_types que é estático)
 */
async function clearDatabase() {
  return new Promise((resolve, reject) => {
    const clear = `
      DELETE FROM files;
      DELETE FROM appointments;
      DELETE FROM clients;
      DELETE FROM sqlite_sequence WHERE name IN ('files', 'appointments', 'clients');
    `;

    db.exec(clear, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
}

/**
 * Fechar conexão com banco de teste
 * Como estamos usando banco em memória, apenas fecha a conexão
 */
async function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
          return;
        }
        resolve();
      });
    } else {
      resolve();
    }
  });
}

/**
 * Obter instância do banco de teste
 */
function getTestDatabase() {
  return db;
}

module.exports = {
  setupTestDatabase,
  clearDatabase,
  closeDatabase,
  getTestDatabase
};

