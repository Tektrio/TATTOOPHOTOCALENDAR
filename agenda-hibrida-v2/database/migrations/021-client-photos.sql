-- ============================================
-- MIGRAÇÃO 021: Fotos e Galeria de Clientes
-- Sistema de gestão de fotos de tatuagens
-- ============================================

CREATE TABLE IF NOT EXISTS client_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  project_id INTEGER,
  session_id INTEGER,
  
  photo_type TEXT NOT NULL,               -- reference, sketch, before, during, after, healing
  photo_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  upload_date TEXT DEFAULT CURRENT_TIMESTAMP,
  taken_date TEXT,
  
  is_portfolio BOOLEAN DEFAULT 0,
  client_approved BOOLEAN DEFAULT 0,
  show_to_client BOOLEAN DEFAULT 1,
  
  caption TEXT,
  tags TEXT,                              -- JSON array
  
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
  FOREIGN KEY (project_id) REFERENCES client_projects (id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES appointments (id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_photos_client ON client_photos(client_id);
CREATE INDEX IF NOT EXISTS idx_photos_project ON client_photos(project_id);
CREATE INDEX IF NOT EXISTS idx_photos_type ON client_photos(photo_type);
CREATE INDEX IF NOT EXISTS idx_photos_portfolio ON client_photos(is_portfolio);

