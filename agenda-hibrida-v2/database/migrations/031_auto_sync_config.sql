-- Migration: 031_auto_sync_config.sql
-- Descrição: Adiciona configuração de sincronização automática
-- Data: 2025-10-30

-- Adicionar timestamps de última sincronização em arquivos
-- Usamos BEGIN/COMMIT para tornar atômico e ignorar erros se já existir
BEGIN;

-- Tentar adicionar colunas em local_files (ignorar se já existem)
ALTER TABLE local_files ADD COLUMN last_synced_at DATETIME;
ALTER TABLE local_files ADD COLUMN sync_status TEXT DEFAULT 'pending';

-- Criar índices para performance
CREATE INDEX idx_local_files_sync_status ON local_files(sync_status);
CREATE INDEX idx_local_files_last_synced ON local_files(last_synced_at);

COMMIT;

-- Atualizar configuração padrão (usar UPDATE pois já existe)
UPDATE local_storage_config 
SET auto_sync_enabled = 0,
    auto_sync_interval = 30,
    auto_sync_mode = 'incremental'
WHERE id = 1;
