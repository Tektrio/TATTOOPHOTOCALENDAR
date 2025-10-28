-- ============================================
-- MIGRAÇÃO 008: Expandir Tabela Clients com Campos Vagaro Completos
-- Adiciona TODOS os campos do CustomersList.xlsx do Vagaro
-- ============================================

-- Campos básicos de identificação
ALTER TABLE clients ADD COLUMN customer_since TEXT;
ALTER TABLE clients ADD COLUMN last_visited TEXT;
ALTER TABLE clients ADD COLUMN first_name TEXT;
ALTER TABLE clients ADD COLUMN last_name TEXT;
ALTER TABLE clients ADD COLUMN membership TEXT;
ALTER TABLE clients ADD COLUMN birthdate TEXT;

-- Endereço completo
ALTER TABLE clients ADD COLUMN apt_suite TEXT;
ALTER TABLE clients ADD COLUMN address_line1 TEXT;

-- Múltiplos telefones
ALTER TABLE clients ADD COLUMN mobile TEXT;
ALTER TABLE clients ADD COLUMN day_phone TEXT;
ALTER TABLE clients ADD COLUMN night_phone TEXT;

-- Informações de origem e preferências
ALTER TABLE clients ADD COLUMN referred_by TEXT;
ALTER TABLE clients ADD COLUMN online_booking_allowed BOOLEAN DEFAULT 1;
ALTER TABLE clients ADD COLUMN credit_card_on_file TEXT;
ALTER TABLE clients ADD COLUMN bank_on_file TEXT;
ALTER TABLE clients ADD COLUMN tags TEXT;

-- Estatísticas do Vagaro (métricas de engajamento)
ALTER TABLE clients ADD COLUMN vagaro_appointments_booked INTEGER DEFAULT 0;
ALTER TABLE clients ADD COLUMN vagaro_classes_booked INTEGER DEFAULT 0;
ALTER TABLE clients ADD COLUMN vagaro_check_ins INTEGER DEFAULT 0;
ALTER TABLE clients ADD COLUMN vagaro_points_earned INTEGER DEFAULT 0;
ALTER TABLE clients ADD COLUMN vagaro_amount_paid REAL DEFAULT 0;
ALTER TABLE clients ADD COLUMN vagaro_no_shows INTEGER DEFAULT 0;
ALTER TABLE clients ADD COLUMN vagaro_cancellations INTEGER DEFAULT 0;
ALTER TABLE clients ADD COLUMN vagaro_employee_seen TEXT;

-- IDs externos e controle de importação
ALTER TABLE clients ADD COLUMN vagaro_customer_id TEXT;
ALTER TABLE clients ADD COLUMN import_source TEXT DEFAULT 'vagaro';
ALTER TABLE clients ADD COLUMN last_import_date TEXT

