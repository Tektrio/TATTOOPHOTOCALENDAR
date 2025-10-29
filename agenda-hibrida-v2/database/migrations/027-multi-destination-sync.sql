-- ============================================
-- MIGRAÇÃO 027: Sistema de Sincronização Multi-Destino
-- Sincronização de arquivos locais para múltiplos destinos
-- (Google Drive contas múltiplas + QNAP NAS)
-- ============================================

-- ============================================
-- TABELA 1: Configuração de Armazenamento Local
-- ============================================
CREATE TABLE IF NOT EXISTS local_storage_config (
  id INTEGER PRIMARY KEY CHECK (id = 1), -- Apenas 1 registro (singleton)
  base_path TEXT NOT NULL,
  enabled BOOLEAN DEFAULT 1,
  last_scan DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABELA 2: Destinos de Sincronização
-- (Google Drive + QNAP)
-- ============================================
CREATE TABLE IF NOT EXISTS sync_destinations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK(type IN ('gdrive', 'qnap')),
  name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT 1,
  config TEXT NOT NULL, -- JSON com credenciais/tokens
  color TEXT CHECK(color IN ('blue', 'green', 'purple', 'cyan', 'orange')),
  icon TEXT,
  priority INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para sync_destinations
CREATE INDEX IF NOT EXISTS idx_sync_dest_type ON sync_destinations(type);
CREATE INDEX IF NOT EXISTS idx_sync_dest_enabled ON sync_destinations(enabled);

-- ============================================
-- TABELA 3: Arquivos Locais Indexados
-- ============================================
CREATE TABLE IF NOT EXISTS local_files (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER,
  file_path TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  category TEXT,
  md5_hash TEXT,
  last_modified DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

-- Índices para local_files
CREATE INDEX IF NOT EXISTS idx_local_files_client ON local_files(client_id);
CREATE INDEX IF NOT EXISTS idx_local_files_path ON local_files(file_path);
CREATE INDEX IF NOT EXISTS idx_local_files_hash ON local_files(md5_hash);
CREATE INDEX IF NOT EXISTS idx_local_files_category ON local_files(category);

-- ============================================
-- TABELA 4: Status de Sincronização por Destino
-- ============================================
CREATE TABLE IF NOT EXISTS sync_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  local_file_id INTEGER NOT NULL,
  destination_id INTEGER NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending', 'syncing', 'synced', 'failed', 'conflict')),
  remote_file_id TEXT,
  last_sync DATETIME,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  
  FOREIGN KEY (local_file_id) REFERENCES local_files(id) ON DELETE CASCADE,
  FOREIGN KEY (destination_id) REFERENCES sync_destinations(id) ON DELETE CASCADE,
  
  UNIQUE(local_file_id, destination_id)
);

-- Índices para sync_status
CREATE INDEX IF NOT EXISTS idx_sync_status_file ON sync_status(local_file_id);
CREATE INDEX IF NOT EXISTS idx_sync_status_dest ON sync_status(destination_id);
CREATE INDEX IF NOT EXISTS idx_sync_status_status ON sync_status(status);

-- ============================================
-- TABELA 5: Regras de Sincronização Automática
-- ============================================
CREATE TABLE IF NOT EXISTS sync_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  destination_id INTEGER NOT NULL,
  auto_sync BOOLEAN DEFAULT 0,
  categories TEXT, -- JSON array: ['fotos_finais', 'referencias']
  file_patterns TEXT, -- JSON array: ['*.jpg', '*.psd']
  min_file_size INTEGER,
  max_file_size INTEGER,
  enabled BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (destination_id) REFERENCES sync_destinations(id) ON DELETE CASCADE
);

-- Índices para sync_rules
CREATE INDEX IF NOT EXISTS idx_sync_rules_dest ON sync_rules(destination_id);
CREATE INDEX IF NOT EXISTS idx_sync_rules_enabled ON sync_rules(enabled);

-- ============================================
-- TABELA 6: Fila de Sincronização
-- ============================================
CREATE TABLE IF NOT EXISTS sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  local_file_id INTEGER NOT NULL,
  destination_ids TEXT NOT NULL, -- JSON array com IDs dos destinos
  priority INTEGER DEFAULT 5,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME,
  error_message TEXT,
  
  FOREIGN KEY (local_file_id) REFERENCES local_files(id) ON DELETE CASCADE
);

-- Índices para sync_queue
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_priority ON sync_queue(priority);
CREATE INDEX IF NOT EXISTS idx_sync_queue_file ON sync_queue(local_file_id);

