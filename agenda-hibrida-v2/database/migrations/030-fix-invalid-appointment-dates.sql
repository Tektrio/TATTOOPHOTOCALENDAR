-- Migration: Fix invalid appointment dates
-- Created: 2025-10-29
-- Description: Corrigir agendamentos com datas inválidas ou vazias

-- 1. Deletar agendamentos sem título e sem data (provavelmente inválidos)
DELETE FROM appointments 
WHERE (start_datetime IS NULL OR start_datetime = '') 
  AND (title IS NULL OR title = '');

-- 2. Para agendamentos com título mas sem data, definir data padrão como hoje
UPDATE appointments 
SET 
  start_datetime = datetime('now', 'localtime'),
  end_datetime = datetime('now', '+1 hour', 'localtime'),
  date = date('now'),
  time = time('now', 'localtime')
WHERE (start_datetime IS NULL OR start_datetime = '')
  AND title IS NOT NULL
  AND title != '';

-- 3. Sincronizar coluna 'date' com start_datetime para agendamentos que têm datetime mas não date
UPDATE appointments 
SET date = date(start_datetime)
WHERE date IS NULL 
  AND start_datetime IS NOT NULL 
  AND start_datetime != '';

-- 4. Sincronizar coluna 'time' com start_datetime para agendamentos que têm datetime mas não time
UPDATE appointments 
SET time = time(start_datetime)
WHERE time IS NULL 
  AND start_datetime IS NOT NULL 
  AND start_datetime != '';

-- 5. Criar índice para melhorar performance em queries de data
CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(start_datetime, end_datetime);

