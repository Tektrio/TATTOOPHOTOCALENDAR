-- Migration 008: Multi-Account Google System
-- Criado: 2025-10-27
-- Objetivo: Suportar múltiplas contas Google Drive/Calendar

-- Tabela de contas Google
CREATE TABLE IF NOT EXISTS google_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_name TEXT NOT NULL,
  account_email TEXT UNIQUE NOT NULL,
  account_type TEXT DEFAULT 'both' CHECK(account_type IN ('drive', 'calendar', 'both')),
  is_primary BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  color_code TEXT DEFAULT '#4285F4',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_google_accounts_email ON google_accounts(account_email);
CREATE INDEX IF NOT EXISTS idx_google_accounts_active ON google_accounts(is_active);
CREATE INDEX IF NOT EXISTS idx_google_accounts_primary ON google_accounts(is_primary);

-- Adicionar coluna account_id na tabela de tokens OAuth
-- Primeiro verificar se a coluna já existe
ALTER TABLE google_oauth_tokens ADD COLUMN account_id INTEGER REFERENCES google_accounts(id);

-- Criar índice para account_id
CREATE INDEX IF NOT EXISTS idx_google_oauth_tokens_account ON google_oauth_tokens(account_id);

-- Tabela de mapeamento de arquivos por conta
CREATE TABLE IF NOT EXISTS account_file_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  drive_file_id TEXT,
  folder_id TEXT,
  file_type TEXT CHECK(file_type IN ('photo', 'document', 'other')),
  file_size INTEGER,
  mime_type TEXT,
  last_synced DATETIME,
  sync_status TEXT DEFAULT 'pending' CHECK(sync_status IN ('pending', 'syncing', 'synced', 'error')),
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES google_accounts(id) ON DELETE CASCADE,
  UNIQUE(account_id, file_path)
);

-- Criar índices para performance de mapeamento
CREATE INDEX IF NOT EXISTS idx_account_file_mappings_account ON account_file_mappings(account_id);
CREATE INDEX IF NOT EXISTS idx_account_file_mappings_drive_file ON account_file_mappings(drive_file_id);
CREATE INDEX IF NOT EXISTS idx_account_file_mappings_sync_status ON account_file_mappings(sync_status);
CREATE INDEX IF NOT EXISTS idx_account_file_mappings_last_synced ON account_file_mappings(last_synced);

-- Tabela de sincronização de calendários por conta
CREATE TABLE IF NOT EXISTS account_calendar_sync (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  calendar_id TEXT NOT NULL,
  calendar_name TEXT,
  last_sync_token TEXT,
  last_synced DATETIME,
  sync_direction TEXT DEFAULT 'bidirectional' CHECK(sync_direction IN ('import', 'export', 'bidirectional')),
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES google_accounts(id) ON DELETE CASCADE,
  UNIQUE(account_id, calendar_id)
);

-- Criar índices para performance de sincronização de calendário
CREATE INDEX IF NOT EXISTS idx_account_calendar_sync_account ON account_calendar_sync(account_id);
CREATE INDEX IF NOT EXISTS idx_account_calendar_sync_calendar ON account_calendar_sync(calendar_id);
CREATE INDEX IF NOT EXISTS idx_account_calendar_sync_active ON account_calendar_sync(is_active);

-- Inserir conta padrão se houver tokens existentes
INSERT OR IGNORE INTO google_accounts (account_name, account_email, account_type, is_primary, is_active)
SELECT 
  'Conta Principal',
  COALESCE(
    (SELECT value FROM google_oauth_tokens WHERE key = 'user_email' LIMIT 1),
    'default@example.com'
  ),
  'both',
  1,
  1
WHERE EXISTS (SELECT 1 FROM google_oauth_tokens LIMIT 1);

-- Atualizar tokens existentes para vincular à conta padrão
UPDATE google_oauth_tokens 
SET account_id = (SELECT id FROM google_accounts WHERE is_primary = 1 LIMIT 1)
WHERE account_id IS NULL;

