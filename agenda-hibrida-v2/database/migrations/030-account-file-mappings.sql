-- Migration: Criar tabela account_file_mappings
-- Data: 2025-10-29
-- Descrição: Mapear arquivos para contas Google específicas

CREATE TABLE IF NOT EXISTS account_file_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  file_id INTEGER NOT NULL,
  account_id INTEGER NOT NULL,
  remote_file_id TEXT,
  remote_path TEXT,
  last_sync TEXT DEFAULT CURRENT_TIMESTAMP,
  sync_status TEXT DEFAULT 'pending',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE CASCADE,
  FOREIGN KEY (account_id) REFERENCES google_accounts(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_account_file_file_id ON account_file_mappings(file_id);
CREATE INDEX IF NOT EXISTS idx_account_file_account_id ON account_file_mappings(account_id);
CREATE INDEX IF NOT EXISTS idx_account_file_status ON account_file_mappings(sync_status);

