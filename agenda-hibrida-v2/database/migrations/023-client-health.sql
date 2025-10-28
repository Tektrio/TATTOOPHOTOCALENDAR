-- ============================================
-- MIGRAÇÃO 023: Saúde e Cuidados
-- Informações médicas e de saúde dos clientes
-- ============================================

CREATE TABLE IF NOT EXISTS client_health (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL UNIQUE,
  
  allergies TEXT,                         -- JSON array
  medical_conditions TEXT,                -- JSON array
  medications TEXT,                       -- JSON array
  blood_type TEXT,
  
  has_diabetes BOOLEAN DEFAULT 0,
  has_hemophilia BOOLEAN DEFAULT 0,
  has_keloid_tendency BOOLEAN DEFAULT 0,
  has_skin_conditions BOOLEAN DEFAULT 0,
  
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  emergency_contact_relation TEXT,
  
  contraindications TEXT,                 -- JSON array
  special_notes TEXT,
  
  last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_health_client ON client_health(client_id);

