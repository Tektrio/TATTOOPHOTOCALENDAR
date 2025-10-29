-- Migration: Criar tabela google_accounts para suporte multi-conta
-- Data: 2025-10-29
-- Descrição: Tabela para gerenciar múltiplas contas Google (Drive/Calendar)

CREATE TABLE IF NOT EXISTS google_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL DEFAULT 'system',
  account_name TEXT NOT NULL,
  account_email TEXT NOT NULL UNIQUE,
  account_type TEXT DEFAULT 'google',
  is_primary INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  color_code TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expiry INTEGER,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_google_accounts_email ON google_accounts(account_email);
CREATE INDEX IF NOT EXISTS idx_google_accounts_primary ON google_accounts(is_primary);
CREATE INDEX IF NOT EXISTS idx_google_accounts_active ON google_accounts(is_active);

-- Popular com conta existente do google_oauth_tokens (se existir)
INSERT OR IGNORE INTO google_accounts (
  user_id,
  account_name,
  account_email,
  is_primary,
  is_active,
  access_token,
  refresh_token,
  token_expiry
)
SELECT 
  user_id,
  'Conta Principal',
  'primary@account.com',
  1,
  1,
  access_token,
  refresh_token,
  expiry_date
FROM google_oauth_tokens
WHERE user_id = 'system'
LIMIT 1;

