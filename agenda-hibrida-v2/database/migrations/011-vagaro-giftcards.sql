-- ============================================
-- MIGRAÇÃO 011: Tabela de Gift Cards do Vagaro
-- Gerencia cartões presente e seus saldos
-- ============================================

CREATE TABLE IF NOT EXISTS vagaro_gift_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gift_card_number TEXT UNIQUE NOT NULL,
  purchase_date TEXT,
  expire_on TEXT,
  merchant_account TEXT,
  purchased_at TEXT,
  from_customer TEXT,
  assigned_to TEXT,
  client_id INTEGER,
  initial_amount REAL DEFAULT 0,
  current_balance REAL DEFAULT 0,
  visits_remaining INTEGER,
  status TEXT DEFAULT 'outstanding',
  void_reason TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE SET NULL
)
