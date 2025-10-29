-- Migration: Criar tabela account_calendar_sync
-- Data: 2025-10-29
-- Descrição: Rastrear sincronização de calendários por conta

CREATE TABLE IF NOT EXISTS account_calendar_sync (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  account_id INTEGER NOT NULL,
  calendar_id TEXT NOT NULL,
  calendar_name TEXT,
  last_sync TEXT DEFAULT CURRENT_TIMESTAMP,
  sync_status TEXT DEFAULT 'active',
  events_synced INTEGER DEFAULT 0,
  last_error TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES google_accounts(id) ON DELETE CASCADE
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_account_calendar_account_id ON account_calendar_sync(account_id);
CREATE INDEX IF NOT EXISTS idx_account_calendar_calendar_id ON account_calendar_sync(calendar_id);
CREATE INDEX IF NOT EXISTS idx_account_calendar_status ON account_calendar_sync(sync_status);

