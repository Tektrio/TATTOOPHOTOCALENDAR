-- ============================================
-- MIGRAÇÃO 020: Projetos de Tatuagem
-- Gestão de projetos de tatuagem dos clientes
-- ============================================

CREATE TABLE IF NOT EXISTS client_projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  artist_id INTEGER,
  
  project_name TEXT NOT NULL,
  description TEXT,
  body_location TEXT,
  size_category TEXT,
  style TEXT,                             -- traditional, realism, watercolor, etc
  color_type TEXT DEFAULT 'color',        -- color, black_gray, both
  
  status TEXT DEFAULT 'planning',         -- planning, in_progress, completed, paused
  
  total_sessions_planned INTEGER,
  sessions_completed INTEGER DEFAULT 0,
  
  total_hours_planned INTEGER,
  total_hours_spent INTEGER DEFAULT 0,
  
  estimated_cost REAL,
  total_paid REAL DEFAULT 0,
  
  start_date TEXT,
  completion_date TEXT,
  
  sketch_url TEXT,
  reference_urls TEXT,                    -- JSON array
  
  notes TEXT,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
  FOREIGN KEY (artist_id) REFERENCES artists (id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_projects_client ON client_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_artist ON client_projects(artist_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON client_projects(status);

