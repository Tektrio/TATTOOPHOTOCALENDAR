-- Migration: Create financial_transactions table
-- Created: 2025-10-29
-- Description: Add financial transactions tracking

CREATE TABLE IF NOT EXISTS financial_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_date DATE NOT NULL,
  transaction_time TIME,
  type TEXT NOT NULL, -- 'income', 'expense', 'refund'
  category TEXT, -- 'service', 'product', 'supplies', 'rent', 'utilities', etc
  description TEXT NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT, -- 'cash', 'credit_card', 'debit_card', 'pix', 'transfer', etc
  client_id INTEGER,
  appointment_id INTEGER,
  employee_id INTEGER,
  invoice_id INTEGER,
  notes TEXT,
  receipt_url TEXT, -- URL do comprovante/nota fiscal
  status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'cancelled', 'refunded'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients (id),
  FOREIGN KEY (appointment_id) REFERENCES appointments (id),
  FOREIGN KEY (employee_id) REFERENCES employees (id),
  FOREIGN KEY (invoice_id) REFERENCES invoices (id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_financial_transactions_date ON financial_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_type ON financial_transactions(type);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_category ON financial_transactions(category);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_client ON financial_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_employee ON financial_transactions(employee_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_appointment ON financial_transactions(appointment_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_status ON financial_transactions(status);

-- Tabela de metas financeiras
CREATE TABLE IF NOT EXISTS financial_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  target_amount REAL NOT NULL,
  current_amount REAL DEFAULT 0,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  category TEXT, -- 'monthly_revenue', 'quarterly_revenue', 'annual_revenue', etc
  status TEXT DEFAULT 'active', -- 'active', 'completed', 'cancelled'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_financial_goals_dates ON financial_goals(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_financial_goals_status ON financial_goals(status);

-- Tabela de despesas recorrentes
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  amount REAL NOT NULL,
  frequency TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'yearly'
  category TEXT,
  next_due_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recurring_expenses_next_due ON recurring_expenses(next_due_date);
CREATE INDEX IF NOT EXISTS idx_recurring_expenses_active ON recurring_expenses(is_active);

