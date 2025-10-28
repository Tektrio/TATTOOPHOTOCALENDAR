-- Migration 006: Sistema de Transações Financeiras (Vagaro)
-- Armazena histórico de pagamentos, produtos, pacotes e transações

CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER,
  appointment_id INTEGER,
  
  -- Dados da transação
  transaction_date DATETIME NOT NULL,
  transaction_type TEXT NOT NULL, -- 'service', 'product', 'package', 'tip', 'deposit', 'refund'
  transaction_status TEXT DEFAULT 'completed', -- 'pending', 'completed', 'cancelled', 'refunded'
  
  -- Valores
  subtotal REAL DEFAULT 0,
  discount REAL DEFAULT 0,
  tax REAL DEFAULT 0,
  tip REAL DEFAULT 0,
  total REAL DEFAULT 0,
  
  -- Método de pagamento
  payment_method TEXT, -- 'cash', 'credit_card', 'debit_card', 'pix', 'transfer', 'other'
  payment_status TEXT DEFAULT 'paid', -- 'pending', 'paid', 'partial', 'refunded'
  
  -- Detalhes do produto/serviço
  item_name TEXT,
  item_category TEXT,
  quantity INTEGER DEFAULT 1,
  
  -- Informações adicionais
  notes TEXT,
  employee_id INTEGER,
  invoice_number TEXT,
  
  -- Origem dos dados
  source TEXT DEFAULT 'manual', -- 'manual', 'vagaro', 'pos'
  import_log_id INTEGER,
  vagaro_transaction_id TEXT, -- ID original do Vagaro
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  FOREIGN KEY (import_log_id) REFERENCES import_logs(id) ON DELETE SET NULL
);

-- Tabela de Pacotes/Memberships do Vagaro
CREATE TABLE IF NOT EXISTS customer_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  
  package_name TEXT NOT NULL,
  package_type TEXT, -- 'prepaid', 'membership', 'package'
  
  sessions_total INTEGER DEFAULT 0,
  sessions_used INTEGER DEFAULT 0,
  sessions_remaining INTEGER DEFAULT 0,
  
  purchase_date DATE,
  expiration_date DATE,
  status TEXT DEFAULT 'active', -- 'active', 'expired', 'cancelled', 'completed'
  
  amount_paid REAL DEFAULT 0,
  
  notes TEXT,
  import_log_id INTEGER,
  vagaro_package_id TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  FOREIGN KEY (import_log_id) REFERENCES import_logs(id) ON DELETE SET NULL
);

-- Tabela de Produtos do Catálogo
CREATE TABLE IF NOT EXISTS products_catalog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  product_name TEXT NOT NULL,
  product_category TEXT,
  product_type TEXT, -- 'physical', 'service', 'package'
  
  description TEXT,
  sku TEXT,
  barcode TEXT,
  
  price REAL DEFAULT 0,
  cost REAL DEFAULT 0,
  
  stock_quantity INTEGER DEFAULT 0,
  low_stock_alert INTEGER DEFAULT 5,
  
  is_active BOOLEAN DEFAULT 1,
  
  tags TEXT, -- JSON array
  image_url TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_customer ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(transaction_status);
CREATE INDEX IF NOT EXISTS idx_transactions_employee ON transactions(employee_id);
CREATE INDEX IF NOT EXISTS idx_transactions_vagaro_id ON transactions(vagaro_transaction_id);

CREATE INDEX IF NOT EXISTS idx_packages_customer ON customer_packages(customer_id);
CREATE INDEX IF NOT EXISTS idx_packages_status ON customer_packages(status);
CREATE INDEX IF NOT EXISTS idx_packages_expiration ON customer_packages(expiration_date);

CREATE INDEX IF NOT EXISTS idx_products_name ON products_catalog(product_name);
CREATE INDEX IF NOT EXISTS idx_products_category ON products_catalog(product_category);
CREATE INDEX IF NOT EXISTS idx_products_sku ON products_catalog(sku);
CREATE INDEX IF NOT EXISTS idx_products_active ON products_catalog(is_active);

