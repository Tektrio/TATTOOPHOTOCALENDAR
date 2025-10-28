-- Migration 009: Tipos de Serviços Predefinidos
-- Sistema de serviços com categorias, preços e durações padrão

CREATE TABLE IF NOT EXISTS service_types (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Informações básicas
  service_name TEXT NOT NULL,
  service_category TEXT, -- 'tattoo', 'piercing', 'consultation', 'removal', 'aftercare'
  service_type TEXT DEFAULT 'fixed', -- 'fixed', 'half_day', 'full_day', 'hourly'
  
  -- Descrição e detalhes
  description TEXT,
  short_description TEXT,
  
  -- Preços
  base_price REAL DEFAULT 0,
  min_price REAL DEFAULT 0,
  max_price REAL DEFAULT 0,
  
  -- Duração
  default_duration INTEGER DEFAULT 60, -- em minutos
  min_duration INTEGER,
  max_duration INTEGER,
  
  -- Configurações de agenda
  requires_deposit BOOLEAN DEFAULT 0,
  deposit_amount REAL DEFAULT 0,
  deposit_percentage REAL DEFAULT 0,
  
  allows_online_booking BOOLEAN DEFAULT 1,
  requires_consultation BOOLEAN DEFAULT 0,
  
  -- Disponibilidade
  is_active BOOLEAN DEFAULT 1,
  is_featured BOOLEAN DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  
  -- Restrições
  min_advance_booking_hours INTEGER DEFAULT 24, -- mínimo de horas de antecedência
  max_advance_booking_days INTEGER DEFAULT 90, -- máximo de dias futuros
  
  -- Recursos adicionais
  requires_special_equipment BOOLEAN DEFAULT 0,
  equipment_notes TEXT,
  
  -- Imagem e apresentação
  image_url TEXT,
  color_code TEXT DEFAULT '#4285F4',
  icon TEXT, -- Nome do ícone (ex: 'scissors', 'droplet', etc)
  
  -- Metadados
  tags TEXT, -- JSON array
  metadata TEXT, -- JSON object para dados adicionais
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de variações de serviços (ex: tamanhos, complexidades)
CREATE TABLE IF NOT EXISTS service_variations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_type_id INTEGER NOT NULL,
  
  variation_name TEXT NOT NULL, -- 'Small', 'Medium', 'Large', 'Extra Large'
  variation_type TEXT, -- 'size', 'complexity', 'location', 'custom'
  
  price_modifier REAL DEFAULT 0, -- Valor adicional ou multiplicador
  duration_modifier INTEGER DEFAULT 0, -- Minutos adicionais
  
  is_default BOOLEAN DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE CASCADE
);

-- Tabela de addons/extras (produtos ou serviços adicionais)
CREATE TABLE IF NOT EXISTS service_addons (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  addon_name TEXT NOT NULL,
  addon_category TEXT, -- 'product', 'service', 'upgrade'
  
  description TEXT,
  price REAL DEFAULT 0,
  
  is_active BOOLEAN DEFAULT 1,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de associação serviços <-> addons (quais addons estão disponíveis para cada serviço)
CREATE TABLE IF NOT EXISTS service_addon_mappings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  service_type_id INTEGER NOT NULL,
  addon_id INTEGER NOT NULL,
  
  is_recommended BOOLEAN DEFAULT 0,
  is_required BOOLEAN DEFAULT 0,
  
  FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE CASCADE,
  FOREIGN KEY (addon_id) REFERENCES service_addons(id) ON DELETE CASCADE,
  
  UNIQUE(service_type_id, addon_id)
);

-- Adicionar coluna service_type_id em appointments
ALTER TABLE appointments ADD COLUMN service_type_id INTEGER REFERENCES service_types(id);
ALTER TABLE appointments ADD COLUMN service_variation_id INTEGER REFERENCES service_variations(id);
ALTER TABLE appointments ADD COLUMN selected_addons TEXT; -- JSON array de addon_ids

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_service_types_active ON service_types(is_active);
CREATE INDEX IF NOT EXISTS idx_service_types_category ON service_types(service_category);
CREATE INDEX IF NOT EXISTS idx_service_types_type ON service_types(service_type);
CREATE INDEX IF NOT EXISTS idx_service_types_featured ON service_types(is_featured);

CREATE INDEX IF NOT EXISTS idx_service_variations_type ON service_variations(service_type_id);
CREATE INDEX IF NOT EXISTS idx_service_addons_active ON service_addons(is_active);
CREATE INDEX IF NOT EXISTS idx_service_addon_mappings_service ON service_addon_mappings(service_type_id);

CREATE INDEX IF NOT EXISTS idx_appointments_service_type ON appointments(service_type_id);

-- Inserir serviços padrão
INSERT INTO service_types (
  service_name, service_category, service_type, description, 
  base_price, default_duration, color_code, icon, is_featured
) VALUES
  ('Video Consultation', 'consultation', 'fixed', 'Consulta online por vídeo para discutir seu projeto de tatuagem', 50.00, 30, '#4285F4', 'video', 1),
  ('Half Day Session', 'tattoo', 'half_day', 'Sessão de tatuagem de meio período (4 horas)', 800.00, 240, '#34A853', 'clock', 1),
  ('Full Day Session', 'tattoo', 'full_day', 'Sessão de tatuagem de dia completo (6-8 horas)', 1500.00, 480, '#FBBC05', 'sun', 1),
  ('Small Tattoo', 'tattoo', 'fixed', 'Tatuagem pequena (até 5cm)', 200.00, 60, '#9333EA', 'droplet', 0),
  ('Medium Tattoo', 'tattoo', 'fixed', 'Tatuagem média (5-15cm)', 500.00, 120, '#9333EA', 'droplet', 0),
  ('Large Tattoo', 'tattoo', 'fixed', 'Tatuagem grande (15-30cm)', 1000.00, 240, '#9333EA', 'droplet', 0),
  ('Piercing', 'piercing', 'fixed', 'Serviço de piercing profissional', 100.00, 30, '#EC4899', 'circle', 0),
  ('Tattoo Touch-up', 'tattoo', 'fixed', 'Retoque de tatuagem existente', 150.00, 60, '#14B8A6', 'refresh', 0),
  ('Laser Removal Session', 'removal', 'fixed', 'Sessão de remoção de tatuagem a laser', 300.00, 45, '#EF4444', 'zap', 0),
  ('Cover-up Consultation', 'consultation', 'fixed', 'Consulta para planejamento de cover-up', 80.00, 45, '#F59E0B', 'layers', 0);

-- Inserir variações de exemplo para "Small Tattoo"
INSERT INTO service_variations (service_type_id, variation_name, variation_type, price_modifier, is_default) 
VALUES
  (4, 'Black & Grey', 'style', 0, 1),
  (4, 'Full Color', 'style', 50, 0),
  (4, 'Fine Line', 'style', 30, 0);

-- Inserir addons de exemplo
INSERT INTO service_addons (addon_name, addon_category, description, price, is_active) 
VALUES
  ('Aftercare Kit', 'product', 'Kit completo de cuidados pós-tatuagem', 50.00, 1),
  ('Numbing Cream', 'product', 'Creme anestésico para reduzir desconforto', 30.00, 1),
  ('Priority Booking', 'service', 'Agendamento prioritário em horários premium', 25.00, 1),
  ('Rush Service', 'service', 'Serviço expresso com conclusão rápida', 100.00, 1),
  ('Custom Design', 'service', 'Design personalizado exclusivo', 150.00, 1),
  ('Touch-up Insurance', 'service', 'Seguro para retoque gratuito em 6 meses', 75.00, 1);

-- Associar addons aos serviços
-- Todos os serviços de tatuagem podem ter aftercare kit e numbing cream
INSERT INTO service_addon_mappings (service_type_id, addon_id, is_recommended) 
SELECT id, 1, 1 FROM service_types WHERE service_category = 'tattoo';

INSERT INTO service_addon_mappings (service_type_id, addon_id, is_recommended) 
SELECT id, 2, 1 FROM service_types WHERE service_category = 'tattoo';

-- Serviços grandes podem ter custom design
INSERT INTO service_addon_mappings (service_type_id, addon_id, is_recommended) 
VALUES (3, 5, 1), (6, 5, 1);

-- Todos podem ter priority booking
INSERT INTO service_addon_mappings (service_type_id, addon_id) 
SELECT id, 3 FROM service_types WHERE is_active = 1;

