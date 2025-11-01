/**
 * Script para criar tabelas faltantes que causam crash no backend
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'agenda_hibrida.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Criando tabelas faltantes...\n');

// Tabela service_types
console.log('📊 Criando tabela service_types...');
db.serialize(() => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS service_types (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_name TEXT NOT NULL,
      service_category TEXT,
      service_type TEXT DEFAULT 'fixed',
      description TEXT,
      short_description TEXT,
      base_price REAL DEFAULT 0,
      min_price REAL DEFAULT 0,
      max_price REAL DEFAULT 0,
      default_duration INTEGER DEFAULT 60,
      min_duration INTEGER,
      max_duration INTEGER,
      requires_deposit BOOLEAN DEFAULT 0,
      deposit_amount REAL DEFAULT 0,
      deposit_percentage REAL DEFAULT 0,
      allows_online_booking BOOLEAN DEFAULT 1,
      requires_consultation BOOLEAN DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      is_featured BOOLEAN DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      min_advance_booking_hours INTEGER DEFAULT 24,
      max_advance_booking_days INTEGER DEFAULT 90,
      requires_special_equipment BOOLEAN DEFAULT 0,
      equipment_notes TEXT,
      image_url TEXT,
      color_code TEXT DEFAULT '#4285F4',
      icon TEXT,
      tags TEXT,
      metadata TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Tabela service_types criada\n');

  // Tabela service_variations
  console.log('📊 Criando tabela service_variations...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS service_variations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_type_id INTEGER NOT NULL,
      variation_name TEXT NOT NULL,
      variation_type TEXT,
      price_modifier REAL DEFAULT 0,
      duration_modifier INTEGER DEFAULT 0,
      is_default BOOLEAN DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE CASCADE
    );
  `);
  console.log('✅ Tabela service_variations criada\n');

  // Tabela service_addons
  console.log('📊 Criando tabela service_addons...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS service_addons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      addon_name TEXT NOT NULL,
      addon_category TEXT,
      description TEXT,
      price REAL DEFAULT 0,
      is_active BOOLEAN DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Tabela service_addons criada\n');

  // Tabela service_addon_mappings
  console.log('📊 Criando tabela service_addon_mappings...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS service_addon_mappings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      service_type_id INTEGER NOT NULL,
      addon_id INTEGER NOT NULL,
      is_recommended BOOLEAN DEFAULT 0,
      is_required BOOLEAN DEFAULT 0,
      FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE CASCADE,
      FOREIGN KEY (addon_id) REFERENCES service_addons(id) ON DELETE CASCADE,
      UNIQUE(service_type_id, addon_id)
    );
  `);
  console.log('✅ Tabela service_addon_mappings criada\n');

  // Tabela google_oauth_tokens
  console.log('📊 Criando tabela google_oauth_tokens...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS google_oauth_tokens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_email TEXT UNIQUE NOT NULL,
      access_token TEXT NOT NULL,
      refresh_token TEXT,
      token_type TEXT DEFAULT 'Bearer',
      expires_at INTEGER,
      scope TEXT,
      is_active BOOLEAN DEFAULT 1,
      calendar_id TEXT,
      drive_folder_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Tabela google_oauth_tokens criada\n');

  // Tabela local_storage_config
  console.log('📊 Criando tabela local_storage_config...');
  db.exec(`
    CREATE TABLE IF NOT EXISTS local_storage_config (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      key TEXT UNIQUE NOT NULL,
      value TEXT,
      value_type TEXT DEFAULT 'string',
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  console.log('✅ Tabela local_storage_config criada\n');

  // Índices
  console.log('📊 Criando índices...');
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_service_types_active ON service_types(is_active);
    CREATE INDEX IF NOT EXISTS idx_service_types_category ON service_types(service_category);
    CREATE INDEX IF NOT EXISTS idx_google_oauth_tokens_email ON google_oauth_tokens(account_email);
    CREATE INDEX IF NOT EXISTS idx_google_oauth_tokens_active ON google_oauth_tokens(is_active);
  `);
  console.log('✅ Índices criados\n');

  // Inserir alguns serviços de exemplo
  console.log('📊 Inserindo serviços de exemplo...');
  const insertService = db.prepare(`
    INSERT OR IGNORE INTO service_types (
      service_name, service_category, base_price, default_duration, color_code, icon
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  const services = [
    ['Tatuagem Pequena', 'tattoo', 150, 60, '#FF6B6B', 'pen'],
    ['Tatuagem Média', 'tattoo', 350, 120, '#4ECDC4', 'pen'],
    ['Tatuagem Grande', 'tattoo', 800, 240, '#45B7D1', 'pen'],
    ['Consulta', 'consultation', 0, 30, '#95E1D3', 'calendar'],
    ['Retoque', 'tattoo', 100, 60, '#F38181', 'refresh'],
  ];

  services.forEach(service => {
    insertService.run(...service, (err) => {
      if (err) console.error('Erro ao inserir serviço:', err.message);
    });
  });
  insertService.finalize();

  console.log('✅ Serviços de exemplo inseridos\n');
  console.log('🎉 Todas as tabelas foram criadas com sucesso!');
  console.log('✅ Backend não deve mais travar ao acessar /api/services\n');

  db.close((err) => {
    if (err) {
      console.error('❌ Erro ao fechar banco:', err.message);
      process.exit(1);
    }
    console.log('✅ Banco de dados fechado');
    process.exit(0);
  });
});

