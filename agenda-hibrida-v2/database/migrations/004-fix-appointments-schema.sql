-- Migration 004: Padronizar schema da tabela appointments
-- Data: 2025-10-27
-- Objetivo: Adicionar colunas esperadas pelo código e migrar dados existentes

-- Adicionar novas colunas necessárias para o sistema
ALTER TABLE appointments ADD COLUMN client_name TEXT;
ALTER TABLE appointments ADD COLUMN date DATE;
ALTER TABLE appointments ADD COLUMN time TIME;
ALTER TABLE appointments ADD COLUMN end_time TIME;
ALTER TABLE appointments ADD COLUMN service TEXT;
ALTER TABLE appointments ADD COLUMN notes TEXT;
ALTER TABLE appointments ADD COLUMN duration INTEGER DEFAULT 60;
ALTER TABLE appointments ADD COLUMN google_calendar_id TEXT;
ALTER TABLE appointments ADD COLUMN ical_uid TEXT;
ALTER TABLE appointments ADD COLUMN external_source TEXT;
ALTER TABLE appointments ADD COLUMN external_id TEXT;
ALTER TABLE appointments ADD COLUMN last_sync_date DATETIME;

-- Migrar dados existentes
UPDATE appointments 
SET 
  date = DATE(start_datetime),
  time = TIME(start_datetime),
  end_time = TIME(end_datetime),
  service = title,
  client_name = (SELECT name FROM clients WHERE clients.id = appointments.client_id)
WHERE date IS NULL AND start_datetime IS NOT NULL;

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date);
CREATE INDEX IF NOT EXISTS idx_appointments_google_event ON appointments(google_event_id);
CREATE INDEX IF NOT EXISTS idx_appointments_external_id ON appointments(external_id);

