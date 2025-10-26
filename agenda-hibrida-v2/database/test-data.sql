-- ============================================
-- DADOS DE TESTE
-- Para validar o sistema de gestão de clientes
-- ============================================

-- Inserir cliente de teste
INSERT INTO clients (name, email, phone, date_of_birth, gender, address, city, state, postal_code, status)
VALUES (
  'João Silva',
  'joao.silva@email.com',
  '(11) 99999-9999',
  '1990-05-15',
  'Masculino',
  'Rua das Flores, 123',
  'São Paulo',
  'SP',
  '01234-567',
  'active'
);

-- Obter ID do cliente inserido
-- SQLite usa last_insert_rowid() mas para simplicidade vamos usar ID 1

-- Inserir estatísticas do cliente
INSERT INTO client_statistics (client_id, total_appointments, completed_appointments, total_sales, loyalty_points_balance, first_visit_date)
VALUES (1, 5, 3, 1500.00, 150, '2024-01-10');

-- Inserir nota de teste
INSERT INTO customer_notes (client_id, title, content, created_by)
VALUES (1, 'Primeira consulta', 'Cliente interessado em tatuagem de dragão no braço direito. Orçamento aprovado.', 'Admin');

-- Inserir agendamento de teste
INSERT INTO appointments (
  client_id, 
  service_type, 
  service_provider, 
  appointment_date, 
  start_time, 
  end_time,
  duration_hours,
  status,
  service_price,
  total_price,
  paid_amount
)
VALUES (
  1,
  'Tatuagem Grande',
  'Carlos Tattoo',
  '2024-11-15',
  '14:00',
  '18:00',
  4.0,
  'confirmed',
  800.00,
  800.00,
  800.00
);

-- Inserir produto de teste
INSERT INTO products (name, description, category, price, stock_quantity)
VALUES ('Pomada Cicatrizante', 'Pomada para cuidados pós-tatuagem', 'Cuidados', 45.00, 50);

-- Inserir compra de produto
INSERT INTO customer_products (client_id, product_id, quantity, unit_price, total_price)
VALUES (1, 1, 2, 45.00, 90.00);

-- Inserir tags
INSERT INTO tags (name, color) VALUES 
  ('VIP', '#FFD700'),
  ('Primeira Vez', '#4CAF50'),
  ('Pagamento Pendente', '#FF5722');

-- Associar tag ao cliente
INSERT INTO client_tags (client_id, tag_id)
VALUES (1, 1), (1, 2);

-- Inserir pontos de fidelidade
INSERT INTO loyalty_points (client_id, points, transaction_type, description)
VALUES 
  (1, 100, 'earned', 'Pontos ganhos pela primeira tatuagem'),
  (1, 50, 'earned', 'Bônus de indicação');

