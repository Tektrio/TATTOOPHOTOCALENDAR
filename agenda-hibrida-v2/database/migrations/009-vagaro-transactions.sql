-- ============================================
-- MIGRAÇÃO 009: Tabela de Transações Financeiras do Vagaro
-- Armazena dados de DepositReport e Transaction List
-- ============================================

CREATE TABLE IF NOT EXISTS vagaro_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER,
  transaction_date TEXT NOT NULL,
  deposit_date TEXT,
  transaction_number TEXT UNIQUE,
  transaction_type TEXT,
  swiped_typed TEXT,
  customer_name TEXT,
  last_4_acct TEXT,
  account_type TEXT,
  gross_amount REAL DEFAULT 0,
  discount_fee REAL DEFAULT 0,
  per_transaction_fee REAL DEFAULT 0,
  refund_amount REAL DEFAULT 0,
  total_fee REAL DEFAULT 0,
  net_amount REAL DEFAULT 0,
  payment_method TEXT,
  service_name TEXT,
  employee_name TEXT,
  notes TEXT,
  import_date TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE SET NULL
)
