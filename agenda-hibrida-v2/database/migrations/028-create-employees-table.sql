-- Migration: Create employees table
-- Created: 2025-10-29
-- Description: Add employees/staff management table

CREATE TABLE IF NOT EXISTS employees (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  role TEXT, -- 'artist', 'piercer', 'receptionist', 'manager', etc
  specialty TEXT, -- Especialidade (ex: 'realismo', 'tradicional', etc)
  hourly_rate REAL DEFAULT 0,
  commission_rate REAL DEFAULT 0, -- Porcentagem de comissão
  status TEXT DEFAULT 'active', -- 'active', 'inactive', 'on_leave'
  hire_date DATE,
  birth_date DATE,
  address TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  avatar_url TEXT,
  bio TEXT, -- Biografia para exibir no site/app
  instagram TEXT,
  portfolio_url TEXT,
  rating REAL DEFAULT 0, -- Avaliação média
  total_appointments INTEGER DEFAULT 0,
  total_revenue REAL DEFAULT 0,
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_role ON employees(role);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

-- Tabela de horários de trabalho dos funcionários
CREATE TABLE IF NOT EXISTS employee_schedules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  day_of_week INTEGER NOT NULL, -- 0=Domingo, 1=Segunda, ..., 6=Sábado
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_employee_schedules_employee ON employee_schedules(employee_id);

-- Tabela de folgas/férias dos funcionários
CREATE TABLE IF NOT EXISTS employee_time_off (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  employee_id INTEGER NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  type TEXT NOT NULL, -- 'vacation', 'sick_leave', 'personal', etc
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (employee_id) REFERENCES employees (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_employee_time_off_employee ON employee_time_off(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_time_off_dates ON employee_time_off(start_date, end_date);

-- Adicionar coluna employee_id em appointments se não existir
ALTER TABLE appointments ADD COLUMN employee_id INTEGER REFERENCES employees(id);
CREATE INDEX IF NOT EXISTS idx_appointments_employee ON appointments(employee_id);

