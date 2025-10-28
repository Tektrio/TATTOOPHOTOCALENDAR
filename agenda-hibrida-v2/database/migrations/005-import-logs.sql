-- Migration 005: Sistema de Logs de Importação
-- Registra todas as importações realizadas (Vagaro e outras fontes)

CREATE TABLE IF NOT EXISTS import_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  import_type TEXT NOT NULL, -- 'vagaro_clients', 'vagaro_appointments', 'vagaro_transactions', etc
  file_name TEXT NOT NULL,
  file_hash TEXT, -- MD5 hash do arquivo para evitar duplicatas
  total_rows INTEGER DEFAULT 0,
  processed_rows INTEGER DEFAULT 0,
  successful_rows INTEGER DEFAULT 0,
  failed_rows INTEGER DEFAULT 0,
  skipped_rows INTEGER DEFAULT 0, -- Linhas duplicadas ou inválidas
  error_details TEXT, -- JSON com detalhes dos erros
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  duration_seconds INTEGER,
  status TEXT DEFAULT 'pending', -- pending, processing, completed, failed, partial
  user_id INTEGER, -- Quem iniciou a importação (futuro)
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de detalhes de erros por linha
CREATE TABLE IF NOT EXISTS import_errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  import_log_id INTEGER NOT NULL,
  row_number INTEGER NOT NULL,
  error_type TEXT NOT NULL, -- 'validation', 'duplicate', 'database', 'unknown'
  error_message TEXT NOT NULL,
  row_data TEXT, -- JSON com os dados da linha que falhou
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (import_log_id) REFERENCES import_logs(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_import_logs_type ON import_logs(import_type);
CREATE INDEX IF NOT EXISTS idx_import_logs_status ON import_logs(status);
CREATE INDEX IF NOT EXISTS idx_import_logs_file_hash ON import_logs(file_hash);
CREATE INDEX IF NOT EXISTS idx_import_logs_created ON import_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_import_errors_log ON import_errors(import_log_id);

-- Adicionar coluna import_log_id nas tabelas existentes para rastreabilidade
ALTER TABLE customers ADD COLUMN import_log_id INTEGER REFERENCES import_logs(id);
ALTER TABLE appointments ADD COLUMN import_log_id INTEGER REFERENCES import_logs(id);

