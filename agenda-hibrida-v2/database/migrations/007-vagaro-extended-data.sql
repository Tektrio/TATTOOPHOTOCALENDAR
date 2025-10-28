-- Migration 007: Dados Estendidos do Vagaro
-- Funcionários, histórico de mensagens e campos expandidos de clientes

-- Tabela de Funcionários (Employees/Staff)
CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Dados básicos
  employee_name TEXT NOT NULL,
  employee_email TEXT UNIQUE,
  employee_phone TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT 1,
  employment_status TEXT DEFAULT 'active', -- 'active', 'inactive', 'on_leave', 'terminated'
  
  -- Função e especialidades
  role TEXT, -- 'artist', 'piercer', 'receptionist', 'manager', 'owner'
  specialties TEXT, -- JSON array: ['tattoo', 'piercing', 'consultation']
  
  -- Informações de agenda
  work_schedule TEXT, -- JSON com horários de trabalho
  calendar_color TEXT DEFAULT '#4285F4',
  
  -- Comissões e pagamento
  commission_rate REAL DEFAULT 0, -- Percentual de comissão
  hourly_rate REAL DEFAULT 0,
  salary REAL DEFAULT 0,
  
  -- Estatísticas
  total_services INTEGER DEFAULT 0,
  total_revenue REAL DEFAULT 0,
  average_rating REAL DEFAULT 0,
  total_reviews INTEGER DEFAULT 0,
  
  -- Dados de importação
  import_log_id INTEGER,
  vagaro_employee_id TEXT UNIQUE,
  
  -- Datas
  hire_date DATE,
  termination_date DATE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (import_log_id) REFERENCES import_logs(id) ON DELETE SET NULL
);

-- Tabela de Histórico de Mensagens (SMS/Email do Vagaro)
CREATE TABLE IF NOT EXISTS message_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  customer_id INTEGER,
  appointment_id INTEGER,
  employee_id INTEGER,
  
  -- Dados da mensagem
  message_type TEXT NOT NULL, -- 'sms', 'email', 'push', 'whatsapp'
  message_category TEXT, -- 'appointment_reminder', 'confirmation', 'cancellation', 'marketing', 'follow_up'
  
  subject TEXT,
  message_body TEXT NOT NULL,
  
  -- Status
  status TEXT DEFAULT 'sent', -- 'pending', 'sent', 'delivered', 'failed', 'bounced'
  sent_at DATETIME,
  delivered_at DATETIME,
  read_at DATETIME,
  
  -- Destinatário
  recipient_name TEXT,
  recipient_contact TEXT, -- Phone ou Email
  
  -- Resposta
  has_response BOOLEAN DEFAULT 0,
  response_text TEXT,
  response_at DATETIME,
  
  -- Origem
  import_log_id INTEGER,
  vagaro_message_id TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  FOREIGN KEY (import_log_id) REFERENCES import_logs(id) ON DELETE SET NULL
);

-- Tabela de Reviews/Avaliações
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  customer_id INTEGER,
  appointment_id INTEGER,
  employee_id INTEGER,
  
  -- Avaliação
  rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
  review_title TEXT,
  review_text TEXT,
  
  -- Tags e categorias
  service_quality INTEGER,
  cleanliness INTEGER,
  professionalism INTEGER,
  value_for_money INTEGER,
  
  -- Status
  status TEXT DEFAULT 'published', -- 'pending', 'published', 'hidden', 'flagged'
  is_verified BOOLEAN DEFAULT 0,
  
  -- Resposta do estabelecimento
  has_response BOOLEAN DEFAULT 0,
  response_text TEXT,
  response_at DATETIME,
  
  -- Origem
  source TEXT DEFAULT 'manual', -- 'manual', 'vagaro', 'google', 'facebook'
  import_log_id INTEGER,
  vagaro_review_id TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL,
  FOREIGN KEY (import_log_id) REFERENCES import_logs(id) ON DELETE SET NULL
);

-- Campos estendidos para clientes (adicionar colunas na tabela customers)
-- Notas: Caso a tabela customers já exista, usamos ALTER TABLE

-- Campos de contato expandidos
ALTER TABLE customers ADD COLUMN address_line1 TEXT;
ALTER TABLE customers ADD COLUMN address_line2 TEXT;
ALTER TABLE customers ADD COLUMN city TEXT;
ALTER TABLE customers ADD COLUMN state TEXT;
ALTER TABLE customers ADD COLUMN zip_code TEXT;
ALTER TABLE customers ADD COLUMN country TEXT DEFAULT 'Brasil';

-- Dados demográficos
ALTER TABLE customers ADD COLUMN date_of_birth DATE;
ALTER TABLE customers ADD COLUMN gender TEXT;
ALTER TABLE customers ADD COLUMN preferred_language TEXT DEFAULT 'pt';

-- Preferências e notas
ALTER TABLE customers ADD COLUMN marketing_consent BOOLEAN DEFAULT 0;
ALTER TABLE customers ADD COLUMN sms_consent BOOLEAN DEFAULT 0;
ALTER TABLE customers ADD COLUMN email_consent BOOLEAN DEFAULT 0;
ALTER TABLE customers ADD COLUMN preferred_contact_method TEXT DEFAULT 'phone'; -- 'phone', 'email', 'sms', 'whatsapp'

-- Estatísticas do cliente
ALTER TABLE customers ADD COLUMN total_visits INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN total_spent REAL DEFAULT 0;
ALTER TABLE customers ADD COLUMN average_ticket REAL DEFAULT 0;
ALTER TABLE customers ADD COLUMN last_visit_date DATE;
ALTER TABLE customers ADD COLUMN first_visit_date DATE;

-- Campos de fidelidade
ALTER TABLE customers ADD COLUMN loyalty_points INTEGER DEFAULT 0;
ALTER TABLE customers ADD COLUMN loyalty_tier TEXT; -- 'bronze', 'silver', 'gold', 'platinum'
ALTER TABLE customers ADD COLUMN referral_source TEXT;
ALTER TABLE customers ADD COLUMN referred_by_customer_id INTEGER REFERENCES customers(id);

-- Campos do Vagaro
ALTER TABLE customers ADD COLUMN vagaro_customer_id TEXT UNIQUE;
ALTER TABLE customers ADD COLUMN vagaro_member_since DATE;
ALTER TABLE customers ADD COLUMN vagaro_last_sync DATETIME;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_employees_active ON employees(is_active);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(employee_email);
CREATE INDEX IF NOT EXISTS idx_employees_vagaro_id ON employees(vagaro_employee_id);

CREATE INDEX IF NOT EXISTS idx_messages_customer ON message_history(customer_id);
CREATE INDEX IF NOT EXISTS idx_messages_type ON message_history(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_status ON message_history(status);
CREATE INDEX IF NOT EXISTS idx_messages_sent ON message_history(sent_at);

CREATE INDEX IF NOT EXISTS idx_reviews_customer ON reviews(customer_id);
CREATE INDEX IF NOT EXISTS idx_reviews_employee ON reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);

CREATE INDEX IF NOT EXISTS idx_customers_vagaro_id ON customers(vagaro_customer_id);
CREATE INDEX IF NOT EXISTS idx_customers_birth ON customers(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_customers_last_visit ON customers(last_visit_date);
CREATE INDEX IF NOT EXISTS idx_customers_loyalty ON customers(loyalty_tier);

