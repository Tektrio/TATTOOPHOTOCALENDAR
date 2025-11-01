-- Migration 005: Corrigir schema completo da tabela appointments
-- Data: 2025-11-01
-- Objetivo: Adicionar TODAS as colunas necessárias para compatibilidade total

-- Adicionar colunas faltantes (se não existirem)
-- Usamos IF NOT EXISTS via pragma para evitar erros de coluna duplicada

-- Colunas principais
ALTER TABLE appointments ADD COLUMN title TEXT;
ALTER TABLE appointments ADD COLUMN description TEXT;
ALTER TABLE appointments ADD COLUMN start_datetime DATETIME;
ALTER TABLE appointments ADD COLUMN end_datetime DATETIME;

-- Colunas de integração Google
ALTER TABLE appointments ADD COLUMN google_event_id TEXT;
ALTER TABLE appointments ADD COLUMN google_calendar_id TEXT;
ALTER TABLE appointments ADD COLUMN ical_uid TEXT;

-- Colunas de sincronização externa
ALTER TABLE appointments ADD COLUMN external_source TEXT;
ALTER TABLE appointments ADD COLUMN external_id TEXT;
ALTER TABLE appointments ADD COLUMN last_sync_date DATETIME;

-- Colunas de dados do cliente e serviço
ALTER TABLE appointments ADD COLUMN client_name TEXT;
ALTER TABLE appointments ADD COLUMN date DATE;
ALTER TABLE appointments ADD COLUMN time TIME;
ALTER TABLE appointments ADD COLUMN end_time TIME;
ALTER TABLE appointments ADD COLUMN service TEXT;
ALTER TABLE appointments ADD COLUMN notes TEXT;

-- Colunas de configuração
ALTER TABLE appointments ADD COLUMN duration INTEGER DEFAULT 60;
ALTER TABLE appointments ADD COLUMN tattoo_type_id INTEGER;
ALTER TABLE appointments ADD COLUMN estimated_price REAL DEFAULT 0;

-- Migrar dados existentes de appointment_date/start_time para date/time
UPDATE appointments 
SET 
  date = COALESCE(date, appointment_date),
  time = COALESCE(time, start_time)
WHERE date IS NULL OR time IS NULL;

-- Migrar dados para start_datetime/end_datetime se não existirem
UPDATE appointments 
SET 
  start_datetime = COALESCE(
    start_datetime, 
    datetime(COALESCE(date, appointment_date) || ' ' || COALESCE(time, start_time))
  ),
  end_datetime = COALESCE(
    end_datetime,
    datetime(COALESCE(date, appointment_date) || ' ' || COALESCE(end_time, start_time))
  )
WHERE start_datetime IS NULL OR end_datetime IS NULL;

-- Preencher campos derivados
UPDATE appointments 
SET 
  service = COALESCE(service, title, service_type),
  client_name = COALESCE(client_name, (SELECT name FROM clients WHERE clients.id = appointments.client_id))
WHERE service IS NULL OR client_name IS NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_start_datetime ON appointments(start_datetime);
CREATE INDEX IF NOT EXISTS idx_appointments_google_event ON appointments(google_event_id);
CREATE INDEX IF NOT EXISTS idx_appointments_external_id ON appointments(external_id);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_tattoo_type ON appointments(tattoo_type_id);



