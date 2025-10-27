-- ============================================
-- MIGRATION 003: Performance Indexes
-- Data: 2025-10-27
-- Objetivo: Adicionar índices para otimizar queries frequentes
-- ============================================

-- Índices adicionais para tabela clients
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);

-- Índices adicionais para tabela appointments  
CREATE INDEX IF NOT EXISTS idx_appointments_end_datetime ON appointments(end_datetime);
CREATE INDEX IF NOT EXISTS idx_appointments_google_event_id ON appointments(google_event_id);
CREATE INDEX IF NOT EXISTS idx_appointments_tattoo_type_id ON appointments(tattoo_type_id);

-- Índices compostos para queries comuns
CREATE INDEX IF NOT EXISTS idx_appointments_client_date ON appointments(client_id, start_datetime);
CREATE INDEX IF NOT EXISTS idx_appointments_date_status ON appointments(start_datetime, status);

-- Índices para tabela tattoo_types (para JOINs)
CREATE INDEX IF NOT EXISTS idx_tattoo_types_name ON tattoo_types(name);

-- Analyze para atualizar estatísticas do SQLite
ANALYZE;

-- Vacuum para compactar banco de dados (comentado para não travar)
-- VACUUM;
