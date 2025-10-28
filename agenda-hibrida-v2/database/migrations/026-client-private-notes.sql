-- ============================================
-- MIGRAÇÃO 026: Notas Privadas do Artista
-- Anotações confidenciais sobre o cliente
-- ============================================

CREATE TABLE IF NOT EXISTS client_private_notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  artist_id INTEGER NOT NULL,
  
  note_type TEXT DEFAULT 'general',       -- technical, behavioral, reminder, feedback, general
  content TEXT NOT NULL,
  
  tags TEXT,                              -- JSON array
  is_pinned BOOLEAN DEFAULT 0,
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
  FOREIGN KEY (artist_id) REFERENCES artists (id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_private_notes_client ON client_private_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_private_notes_artist ON client_private_notes(artist_id);
CREATE INDEX IF NOT EXISTS idx_private_notes_type ON client_private_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_private_notes_pinned ON client_private_notes(is_pinned);

