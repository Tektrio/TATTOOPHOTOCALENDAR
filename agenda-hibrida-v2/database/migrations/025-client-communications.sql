-- ============================================
-- MIGRAÇÃO 025: Comunicação com Clientes
-- Timeline de todas as interações com o cliente
-- ============================================

CREATE TABLE IF NOT EXISTS client_communications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  artist_id INTEGER,
  
  communication_type TEXT NOT NULL,       -- message, call, email, meeting, note
  direction TEXT DEFAULT 'outgoing',      -- incoming, outgoing
  
  subject TEXT,
  content TEXT NOT NULL,
  
  timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
  
  is_read BOOLEAN DEFAULT 0,
  is_important BOOLEAN DEFAULT 0,
  
  attachments TEXT,                       -- JSON array de URLs
  
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE,
  FOREIGN KEY (artist_id) REFERENCES artists (id) ON DELETE SET NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_communications_client ON client_communications(client_id);
CREATE INDEX IF NOT EXISTS idx_communications_timestamp ON client_communications(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_communications_unread ON client_communications(is_read);
CREATE INDEX IF NOT EXISTS idx_communications_important ON client_communications(is_important);

