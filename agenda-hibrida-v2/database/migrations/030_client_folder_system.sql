-- ============================================
-- MIGRATION 030: Sistema de Pastas de Clientes
-- ============================================
-- Adiciona campos para gerenciamento avançado de pastas
-- Cache de IDs do Google Drive
-- Fila de operações assíncronas
-- ============================================

-- 1. Adicionar campos à tabela clients
ALTER TABLE clients ADD COLUMN slug TEXT;
ALTER TABLE clients ADD COLUMN phone_clean TEXT;
ALTER TABLE clients ADD COLUMN folder_path TEXT;
ALTER TABLE clients ADD COLUMN drive_root_id TEXT;
ALTER TABLE clients ADD COLUMN folder_created_at DATETIME;
ALTER TABLE clients ADD COLUMN folder_structure_version TEXT DEFAULT '1.0';

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_clients_phone_clean ON clients(phone_clean);
CREATE INDEX IF NOT EXISTS idx_clients_slug ON clients(slug);
CREATE INDEX IF NOT EXISTS idx_clients_folder_path ON clients(folder_path);

-- 3. Cache de IDs de pastas do Google Drive
CREATE TABLE IF NOT EXISTS client_drive_folders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  relative_path TEXT NOT NULL,
  drive_id TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
  UNIQUE(client_id, relative_path)
);

CREATE INDEX IF NOT EXISTS idx_drive_folders_client ON client_drive_folders(client_id);
CREATE INDEX IF NOT EXISTS idx_drive_folders_path ON client_drive_folders(client_id, relative_path);

-- 4. Fila de operações assíncronas
CREATE TABLE IF NOT EXISTS folder_operations_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  operation_type TEXT NOT NULL CHECK(operation_type IN ('create', 'rename', 'sync', 'delete')),
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'completed', 'failed')),
  payload TEXT,
  error TEXT,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_operations_status ON folder_operations_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_operations_client ON folder_operations_queue(client_id);

-- 5. Backfill: popular campos slug e phone_clean para clientes existentes
-- Nota: Isso será executado apenas se já houver clientes cadastrados
UPDATE clients 
SET 
  slug = LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(name, 
    'á', 'a'), 'é', 'e'), 'í', 'i'), 'ó', 'o'), 'ú', 'u'), 'ã', 'a'), 'õ', 'o'), ' ', '-')),
  phone_clean = REPLACE(REPLACE(REPLACE(REPLACE(phone, '(', ''), ')', ''), '-', ''), ' ', '')
WHERE slug IS NULL AND name IS NOT NULL;

-- 6. Trigger para atualizar updated_at automaticamente
CREATE TRIGGER IF NOT EXISTS update_client_drive_folders_timestamp 
AFTER UPDATE ON client_drive_folders
BEGIN
  UPDATE client_drive_folders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_folder_operations_timestamp 
AFTER UPDATE ON folder_operations_queue
BEGIN
  UPDATE folder_operations_queue SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 7. View para monitoramento de operações pendentes
CREATE VIEW IF NOT EXISTS pending_folder_operations AS
SELECT 
  o.id,
  o.client_id,
  c.name as client_name,
  o.operation_type,
  o.status,
  o.attempts,
  o.max_attempts,
  o.error,
  o.created_at,
  o.updated_at,
  (JULIANDAY('now') - JULIANDAY(o.created_at)) * 24 * 60 as age_minutes
FROM folder_operations_queue o
LEFT JOIN clients c ON c.id = o.client_id
WHERE o.status IN ('pending', 'processing')
ORDER BY o.created_at ASC;

-- ============================================
-- FIM DA MIGRATION 030
-- ============================================

