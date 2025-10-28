-- ============================================
-- MIGRAÇÃO 024: Preferências e Personalização
-- Preferências de sessão, comunicação e conforto
-- ============================================

CREATE TABLE IF NOT EXISTS client_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL UNIQUE,
  
  -- Preferências de Sessão
  preferred_side TEXT,                    -- left, right, no_preference
  break_frequency_minutes INTEGER DEFAULT 60,
  conversation_level TEXT DEFAULT 'moderate',  -- quiet, moderate, chatty
  music_preference TEXT,                  -- genre ou "no_music"
  needs_frequent_breaks BOOLEAN DEFAULT 0,
  
  -- Preferências de Comunicação
  preferred_contact_method TEXT DEFAULT 'whatsapp',
  best_contact_time TEXT,
  reminder_frequency TEXT DEFAULT '24h',
  
  -- Preferências de Conforto
  temperature_preference TEXT DEFAULT 'moderate',
  lighting_preference TEXT DEFAULT 'moderate',
  allow_companion BOOLEAN DEFAULT 0,
  
  -- Outras
  favorite_snacks TEXT,
  favorite_drinks TEXT,
  preferred_payment_method TEXT,
  
  notes TEXT,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
);

-- Índice
CREATE INDEX IF NOT EXISTS idx_preferences_client ON client_preferences(client_id);

