-- ============================================
-- SCHEMA DO SISTEMA DE GESTÃO DE CLIENTES
-- Inspirado no Vagaro para TattooScheduler
-- ============================================

-- Expandir tabela de clientes existente
-- (Já existe, vamos adicionar colunas via migration)

-- Tabela de notas do cliente
CREATE TABLE IF NOT EXISTS customer_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  created_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
);

-- Tabela de formulários customizados
CREATE TABLE IF NOT EXISTS custom_forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  fields JSON NOT NULL, -- Armazena estrutura do formulário em JSON
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de formulários preenchidos pelos clientes
CREATE TABLE IF NOT EXISTS customer_forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  form_id INTEGER NOT NULL,
  appointment_id INTEGER,
  form_data JSON NOT NULL, -- Dados preenchidos em JSON
  filled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
  FOREIGN KEY (form_id) REFERENCES custom_forms (id),
  FOREIGN KEY (appointment_id) REFERENCES appointments (id)
);

-- Tabela de arquivos do cliente (expandir a existente)
CREATE TABLE IF NOT EXISTS customer_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  appointment_id INTEGER,
  form_id INTEGER,
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT, -- appointment, customer, form
  category TEXT, -- referencias, desenhos_aprovados, processo, fotos_finais, etc
  mime_type TEXT,
  file_size INTEGER,
  thumbnail_path TEXT,
  google_drive_id TEXT,
  uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments (id),
  FOREIGN KEY (form_id) REFERENCES customer_forms (id)
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price REAL NOT NULL,
  cost REAL,
  stock_quantity INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de compras de produtos pelos clientes
CREATE TABLE IF NOT EXISTS customer_products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  product_id INTEGER NOT NULL,
  appointment_id INTEGER,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price REAL NOT NULL,
  total_price REAL NOT NULL,
  purchase_location TEXT DEFAULT 'In House', -- 'In House', 'Online'
  purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products (id),
  FOREIGN KEY (appointment_id) REFERENCES appointments (id)
);

-- Tabela de gift cards
CREATE TABLE IF NOT EXISTS gift_cards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT UNIQUE NOT NULL,
  client_id INTEGER, -- Cliente que comprou
  recipient_client_id INTEGER, -- Cliente que recebeu
  initial_value REAL NOT NULL,
  current_balance REAL NOT NULL,
  purchase_location TEXT DEFAULT 'In House',
  status TEXT DEFAULT 'active', -- active, used, expired, void
  purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  used_at DATETIME,
  FOREIGN KEY (client_id) REFERENCES clients (id),
  FOREIGN KEY (recipient_client_id) REFERENCES clients (id)
);

-- Tabela de uso de gift cards
CREATE TABLE IF NOT EXISTS gift_card_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gift_card_id INTEGER NOT NULL,
  appointment_id INTEGER,
  amount_used REAL NOT NULL,
  used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (gift_card_id) REFERENCES gift_cards (id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments (id)
);

-- Tabela de pacotes de serviços
CREATE TABLE IF NOT EXISTS service_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  total_sessions INTEGER NOT NULL,
  price REAL NOT NULL,
  service_type TEXT,
  validity_days INTEGER, -- Validade em dias
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de pacotes comprados pelos clientes
CREATE TABLE IF NOT EXISTS customer_packages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  package_id INTEGER NOT NULL,
  total_sessions INTEGER NOT NULL,
  used_sessions INTEGER DEFAULT 0,
  remaining_sessions INTEGER NOT NULL,
  purchase_price REAL NOT NULL,
  status TEXT DEFAULT 'active', -- active, completed, expired
  purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
  FOREIGN KEY (package_id) REFERENCES service_packages (id)
);

-- Tabela de uso de pacotes
CREATE TABLE IF NOT EXISTS package_usage (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_package_id INTEGER NOT NULL,
  appointment_id INTEGER,
  sessions_used INTEGER DEFAULT 1,
  used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_package_id) REFERENCES customer_packages (id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments (id)
);

-- Tabela de planos de membership
CREATE TABLE IF NOT EXISTS membership_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  billing_cycle TEXT NOT NULL, -- monthly, quarterly, yearly
  benefits JSON, -- Benefícios em JSON
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de memberships dos clientes
CREATE TABLE IF NOT EXISTS customer_memberships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  membership_plan_id INTEGER NOT NULL,
  status TEXT DEFAULT 'active', -- active, paused, cancelled, expired
  start_date DATE NOT NULL,
  end_date DATE,
  next_billing_date DATE,
  monthly_price REAL NOT NULL,
  last_payment_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
  FOREIGN KEY (membership_plan_id) REFERENCES membership_plans (id)
);

-- Tabela de pagamentos de membership
CREATE TABLE IF NOT EXISTS membership_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_membership_id INTEGER NOT NULL,
  amount REAL NOT NULL,
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending', -- pending, completed, failed, refunded
  payment_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_membership_id) REFERENCES customer_memberships (id) ON DELETE CASCADE
);

-- Tabela de invoices/faturas
CREATE TABLE IF NOT EXISTS invoices (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_number TEXT UNIQUE NOT NULL,
  client_id INTEGER NOT NULL,
  appointment_id INTEGER,
  subtotal REAL NOT NULL,
  tax REAL DEFAULT 0,
  discount REAL DEFAULT 0,
  total REAL NOT NULL,
  status TEXT DEFAULT 'draft', -- draft, sent, paid, overdue, void
  notes TEXT,
  due_date DATE,
  paid_date DATE,
  payment_method TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments (id)
);

-- Tabela de itens da invoice
CREATE TABLE IF NOT EXISTS invoice_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  invoice_id INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  unit_price REAL NOT NULL,
  total_price REAL NOT NULL,
  item_type TEXT, -- service, product, package
  item_id INTEGER, -- ID do produto/serviço referenciado
  FOREIGN KEY (invoice_id) REFERENCES invoices (id) ON DELETE CASCADE
);

-- Tabela de tags
CREATE TABLE IF NOT EXISTS tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  color TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de tags dos clientes
CREATE TABLE IF NOT EXISTS client_tags (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  tag_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags (id) ON DELETE CASCADE,
  UNIQUE(client_id, tag_id)
);

-- Tabela de relacionamentos (Family & Friends)
CREATE TABLE IF NOT EXISTS client_relationships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  related_client_id INTEGER NOT NULL,
  relationship_type TEXT, -- family, friend, spouse, etc
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
  FOREIGN KEY (related_client_id) REFERENCES clients (id) ON DELETE CASCADE,
  UNIQUE(client_id, related_client_id)
);

-- Tabela de sistema de pontos
CREATE TABLE IF NOT EXISTS loyalty_points (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  points INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- earned, redeemed, adjusted
  description TEXT,
  appointment_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
  FOREIGN KEY (appointment_id) REFERENCES appointments (id)
);

-- Tabela de estatísticas agregadas dos clientes (para performance)
CREATE TABLE IF NOT EXISTS client_statistics (
  client_id INTEGER PRIMARY KEY,
  total_appointments INTEGER DEFAULT 0,
  completed_appointments INTEGER DEFAULT 0,
  no_shows INTEGER DEFAULT 0,
  cancellations INTEGER DEFAULT 0,
  total_sales REAL DEFAULT 0,
  loyalty_points_balance INTEGER DEFAULT 0,
  last_visit_date DATETIME,
  first_visit_date DATETIME,
  average_rating REAL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
);

-- Tabela para metadados de importação do Vagaro
CREATE TABLE IF NOT EXISTS vagaro_import_metadata (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  table_name TEXT NOT NULL,
  record_id INTEGER NOT NULL,
  vagaro_id TEXT,
  imported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  import_batch_id TEXT,
  original_data JSON
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_customer_notes_client ON customer_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_customer_forms_client ON customer_forms(client_id);
CREATE INDEX IF NOT EXISTS idx_customer_files_client ON customer_files(client_id);
CREATE INDEX IF NOT EXISTS idx_customer_products_client ON customer_products(client_id);
CREATE INDEX IF NOT EXISTS idx_gift_cards_client ON gift_cards(client_id);
CREATE INDEX IF NOT EXISTS idx_customer_packages_client ON customer_packages(client_id);
CREATE INDEX IF NOT EXISTS idx_customer_memberships_client ON customer_memberships(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_client ON loyalty_points(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_client_tags_client ON client_tags(client_id);
CREATE INDEX IF NOT EXISTS idx_vagaro_import ON vagaro_import_metadata(table_name, record_id);

