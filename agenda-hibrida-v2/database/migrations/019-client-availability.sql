-- ============================================
-- MIGRAÇÃO 019: Disponibilidade de Clientes
-- Horários e dias disponíveis do cliente para agendamento
-- ============================================

CREATE TABLE IF NOT EXISTS client_availability (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  
  day_of_week INTEGER NOT NULL,          -- 0=domingo, 6=sábado
  is_available BOOLEAN DEFAULT 1,
  
  time_start TEXT,                        -- "09:00"
  time_end TEXT,                          -- "17:00"
  
  notes TEXT,
  
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS client_scheduling_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL UNIQUE,
  
  preferred_session_duration INTEGER DEFAULT 120,  -- minutos
  preferred_interval_days INTEGER DEFAULT 14,      -- dias entre sessões
  flexibility_level TEXT DEFAULT 'moderate',       -- inflexible, moderate, flexible
  advance_notice_hours INTEGER DEFAULT 24,         -- horas de antecedência
  
  best_contact_time TEXT,                 -- "18:00-20:00"
  worst_contact_time TEXT,
  
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_availability_client ON client_availability(client_id);
CREATE INDEX IF NOT EXISTS idx_availability_day ON client_availability(day_of_week);

