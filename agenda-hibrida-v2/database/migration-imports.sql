-- ============================================
-- MIGRATION: Suporte para Importações Externas
-- Vagaro Excel, ICS e Google Calendar Sync
-- ============================================

-- Adicionar colunas de rastreamento externo à tabela clients
-- (caso não existam)
ALTER TABLE clients ADD COLUMN external_source TEXT;
ALTER TABLE clients ADD COLUMN external_id TEXT;
ALTER TABLE clients ADD COLUMN phone_normalized TEXT;
ALTER TABLE clients ADD COLUMN last_import_date DATETIME;

-- Criar índice único para phone_normalized (deduplicação)
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_phone_normalized ON clients(phone_normalized) WHERE phone_normalized IS NOT NULL;

-- Criar índice composto para external_source e external_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_clients_external ON clients(external_source, external_id) WHERE external_source IS NOT NULL AND external_id IS NOT NULL;

-- Adicionar colunas de rastreamento externo à tabela appointments
-- (assumindo que a tabela appointments já existe)
ALTER TABLE appointments ADD COLUMN external_source TEXT;
ALTER TABLE appointments ADD COLUMN external_id TEXT;
ALTER TABLE appointments ADD COLUMN google_event_id TEXT;
ALTER TABLE appointments ADD COLUMN google_calendar_id TEXT;
ALTER TABLE appointments ADD COLUMN ical_uid TEXT;
ALTER TABLE appointments ADD COLUMN last_sync_date DATETIME;

-- Criar índice único para google_event_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_google_event ON appointments(google_event_id) WHERE google_event_id IS NOT NULL;

-- Criar índice único para ical_uid
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_ical_uid ON appointments(ical_uid) WHERE ical_uid IS NOT NULL;

-- Criar índice composto para external_source e external_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_external ON appointments(external_source, external_id) WHERE external_source IS NOT NULL AND external_id IS NOT NULL;

-- Tabela para armazenar tokens OAuth do Google
CREATE TABLE IF NOT EXISTS google_oauth_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT DEFAULT 'system',
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_type TEXT DEFAULT 'Bearer',
  expiry_date INTEGER,
  scope TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para logs de importação
CREATE TABLE IF NOT EXISTS import_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  import_type TEXT NOT NULL, -- 'vagaro_excel', 'ics', 'google_calendar'
  import_source TEXT, -- 'clients', 'appointments'
  status TEXT NOT NULL, -- 'success', 'partial', 'failed'
  records_processed INTEGER DEFAULT 0,
  records_created INTEGER DEFAULT 0,
  records_updated INTEGER DEFAULT 0,
  records_skipped INTEGER DEFAULT 0,
  records_failed INTEGER DEFAULT 0,
  error_details JSON,
  file_name TEXT,
  batch_id TEXT,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  duration_seconds INTEGER
);

-- Tabela para armazenar configurações de sincronização
CREATE TABLE IF NOT EXISTS sync_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configurações padrão de sincronização
INSERT OR IGNORE INTO sync_settings (setting_key, setting_value, description)
VALUES 
  ('google_calendar_sync_enabled', 'false', 'Habilitar sincronização automática com Google Calendar'),
  ('google_calendar_sync_interval', '300', 'Intervalo de sincronização em segundos (padrão: 5 minutos)'),
  ('google_calendar_last_sync', NULL, 'Data/hora da última sincronização com Google Calendar'),
  ('timezone', 'America/Sao_Paulo', 'Timezone padrão para importações'),
  ('default_appointment_duration', '60', 'Duração padrão de agendamentos em minutos'),
  ('vagaro_auto_import_enabled', 'false', 'Habilitar importação automática de arquivos Vagaro');

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_import_logs_type ON import_logs(import_type);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON import_logs(status);
CREATE INDEX IF NOT EXISTS idx_import_logs_batch ON import_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_clients_external_source ON clients(external_source);
CREATE INDEX IF NOT EXISTS idx_appointments_external_source ON appointments(external_source);

-- ============================================
-- VIEWS ÚTEIS PARA RELATÓRIOS
-- ============================================

-- View para estatísticas de importação
CREATE VIEW IF NOT EXISTS v_import_statistics AS
SELECT 
  import_type,
  import_source,
  COUNT(*) as total_imports,
  SUM(records_processed) as total_records_processed,
  SUM(records_created) as total_records_created,
  SUM(records_updated) as total_records_updated,
  SUM(records_skipped) as total_records_skipped,
  SUM(records_failed) as total_records_failed,
  MAX(completed_at) as last_import_date
FROM import_logs
WHERE status != 'failed'
GROUP BY import_type, import_source;

-- View para clientes importados
CREATE VIEW IF NOT EXISTS v_imported_clients AS
SELECT 
  c.*,
  il.import_type,
  il.completed_at as imported_at
FROM clients c
LEFT JOIN import_logs il ON il.batch_id = c.external_id
WHERE c.external_source IS NOT NULL;
