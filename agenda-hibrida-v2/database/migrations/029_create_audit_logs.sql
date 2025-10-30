-- ============================================================================
-- Migration 029: Sistema de Logs de Auditoria
-- ============================================================================
-- Descrição: Cria tabela para rastrear todas as ações realizadas no sistema
-- Data: 2025-10-30
-- Autor: Sistema de Melhorias
-- ============================================================================

-- Tabela principal de logs de auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Identificação do usuário (futuro: integração com sistema de auth)
  user_id INTEGER,
  user_email TEXT,
  user_name TEXT,
  
  -- Ação realizada
  action TEXT NOT NULL CHECK (action IN (
    'CREATE', 'UPDATE', 'DELETE', 'IMPORT', 'EXPORT', 
    'SYNC', 'UPLOAD', 'DOWNLOAD', 'LOGIN', 'LOGOUT',
    'CONFIG_CHANGE', 'BACKUP', 'RESTORE'
  )),
  
  -- Entidade afetada
  entity_type TEXT NOT NULL CHECK (entity_type IN (
    'appointment', 'client', 'employee', 'file', 'tattoo_type',
    'transaction', 'config', 'user', 'import', 'sync'
  )),
  entity_id INTEGER,
  entity_name TEXT,
  
  -- Detalhes da mudança (JSON com before/after)
  changes TEXT, -- JSON: { before: {...}, after: {...} }
  
  -- Metadados da requisição
  ip_address TEXT,
  user_agent TEXT,
  request_method TEXT, -- GET, POST, PUT, DELETE
  request_path TEXT,
  
  -- Status da operação
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'error', 'pending')),
  error_message TEXT,
  
  -- Timestamps
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Contexto adicional (JSON livre)
  metadata TEXT, -- JSON: { key: value, ... }
  
  -- Índices para performance
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Índices para otimizar consultas comuns
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_id ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip ON audit_logs(ip_address);

-- Índice composto para consultas por entidade específica
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity_lookup 
ON audit_logs(entity_type, entity_id, timestamp DESC);

-- Índice composto para consultas por usuário e período
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp 
ON audit_logs(user_id, timestamp DESC);

-- View para logs recentes (últimos 7 dias)
CREATE VIEW IF NOT EXISTS recent_audit_logs AS
SELECT 
  id,
  user_id,
  user_email,
  user_name,
  action,
  entity_type,
  entity_id,
  entity_name,
  timestamp,
  status,
  ip_address
FROM audit_logs
WHERE timestamp >= datetime('now', '-7 days')
ORDER BY timestamp DESC;

-- View para estatísticas de auditoria
CREATE VIEW IF NOT EXISTS audit_stats AS
SELECT 
  date(timestamp) as date,
  action,
  entity_type,
  status,
  COUNT(*) as count
FROM audit_logs
GROUP BY date(timestamp), action, entity_type, status
ORDER BY date DESC;

-- Trigger para limpar logs antigos (manter apenas 90 dias)
-- Executado automaticamente ao inserir novos logs
CREATE TRIGGER IF NOT EXISTS cleanup_old_audit_logs
AFTER INSERT ON audit_logs
BEGIN
  DELETE FROM audit_logs 
  WHERE timestamp < datetime('now', '-90 days')
  AND status = 'success'; -- Manter logs de erro por mais tempo
END;

-- ============================================================================
-- Inserir log da própria migration
-- ============================================================================
INSERT INTO audit_logs (
  user_id,
  user_email,
  user_name,
  action,
  entity_type,
  entity_id,
  entity_name,
  changes,
  ip_address,
  user_agent,
  request_method,
  request_path,
  status,
  metadata
) VALUES (
  NULL,
  'system@agenda-hibrida.local',
  'Sistema',
  'CREATE',
  'config',
  NULL,
  'audit_logs_table',
  '{"description": "Tabela de logs de auditoria criada com sucesso"}',
  '127.0.0.1',
  'Migration Script',
  'SQL',
  '/database/migrations/029_create_audit_logs.sql',
  'success',
  '{"migration": "029", "version": "2.0.0", "timestamp": "' || datetime('now') || '"}'
);

-- ============================================================================
-- Comentários e documentação
-- ============================================================================
-- Esta tabela armazena:
-- 1. Todas as ações CRUD em entidades principais
-- 2. Mudanças de configuração
-- 3. Sincronizações e importações
-- 4. Uploads e downloads de arquivos
-- 5. Login/logout de usuários (futuro)
--
-- Performance:
-- - Índices otimizados para consultas por: usuário, data, entidade, ação
-- - View materialized para logs recentes (mais rápida)
-- - Trigger automático para limpeza de logs antigos
--
-- Retenção:
-- - Logs de sucesso: 90 dias
-- - Logs de erro: indefinido (para troubleshooting)
--
-- Privacidade/LGPD:
-- - IP é mascarado parcialmente no service
-- - Dados sensíveis não são armazenados em changes
-- - User agent completo apenas para debugging
-- ============================================================================

