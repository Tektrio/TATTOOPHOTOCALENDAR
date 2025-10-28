-- ============================================
-- MIGRAÇÃO 018: Waiting List de Clientes
-- Sistema de fila de espera para projetos de tatuagem
-- ============================================

CREATE TABLE IF NOT EXISTS client_waiting_list (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  artist_id INTEGER,
  
  project_name TEXT NOT NULL,
  description TEXT,
  priority TEXT DEFAULT 'medium',         -- low, medium, high, urgent
  session_type TEXT DEFAULT 'first',      -- first, continuation, last, touch_up
  
  estimated_sessions INTEGER DEFAULT 1,
  estimated_hours_total INTEGER DEFAULT 0,
  estimated_cost REAL DEFAULT 0,
  deposit_paid REAL DEFAULT 0,
  
  status TEXT DEFAULT 'waiting',          -- waiting, scheduled, in_progress, completed, cancelled
  added_date TEXT DEFAULT CURRENT_TIMESTAMP,
  target_start_date TEXT,
  
  body_location TEXT,
  size_category TEXT,                     -- small, medium, large, full_body
  
  notes TEXT,
  
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
  FOREIGN KEY (artist_id) REFERENCES artists (id) ON DELETE SET NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_waiting_list_client ON client_waiting_list(client_id);
CREATE INDEX IF NOT EXISTS idx_waiting_list_status ON client_waiting_list(status);
CREATE INDEX IF NOT EXISTS idx_waiting_list_priority ON client_waiting_list(priority);

