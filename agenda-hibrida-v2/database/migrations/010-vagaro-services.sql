-- ============================================
-- MIGRAÇÃO 010: Tabela de Serviços do Vagaro
-- Armazena estatísticas de serviços oferecidos
-- ============================================

CREATE TABLE IF NOT EXISTS vagaro_services (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_name TEXT NOT NULL UNIQUE,
  total_appointments INTEGER DEFAULT 0,
  total_attendees INTEGER DEFAULT 0,
  service_sales REAL DEFAULT 0,
  service_addon_sales REAL DEFAULT 0,
  class_sales REAL DEFAULT 0,
  class_addon_sales REAL DEFAULT 0,
  cost_to_business REAL DEFAULT 0,
  average_sale REAL DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
)
