-- Seed data para teste do sistema
-- Inserir alguns funcionários de exemplo

INSERT OR IGNORE INTO employees (
  id, name, email, phone, role, specialty, 
  hourly_rate, commission_rate, status, hire_date
) VALUES
(1, 'João Silva', 'joao@tattoo.com', '(11) 98765-4321', 'artist', 'Realismo', 150.00, 30.0, 'active', '2023-01-15'),
(2, 'Maria Santos', 'maria@tattoo.com', '(11) 98765-4322', 'artist', 'Tradicional', 120.00, 25.0, 'active', '2023-03-20'),
(3, 'Pedro Oliveira', 'pedro@tattoo.com', '(11) 98765-4323', 'piercer', 'Piercings', 80.00, 20.0, 'active', '2023-06-10'),
(4, 'Ana Costa', 'ana@tattoo.com', '(11) 98765-4324', 'receptionist', NULL, 25.00, 0, 'active', '2023-02-01');

-- Inserir transações financeiras de exemplo (últimos 3 meses)

-- Receitas de serviços
INSERT OR IGNORE INTO financial_transactions (
  transaction_date, type, category, description, amount, 
  payment_method, status
) VALUES
('2025-10-25', 'income', 'service', 'Tatuagem Realista - Cliente João', 800.00, 'credit_card', 'completed'),
('2025-10-24', 'income', 'service', 'Tatuagem Tradicional - Cliente Maria', 500.00, 'pix', 'completed'),
('2025-10-23', 'income', 'service', 'Piercing Helix', 150.00, 'cash', 'completed'),
('2025-10-20', 'income', 'service', 'Tatuagem Floral', 650.00, 'debit_card', 'completed'),
('2025-10-18', 'income', 'service', 'Tatuagem Geométrica', 900.00, 'credit_card', 'completed'),
('2025-10-15', 'income', 'service', 'Piercing Septum', 120.00, 'cash', 'completed'),
('2025-10-12', 'income', 'product', 'Pomada para Tatuagem', 45.00, 'cash', 'completed'),
('2025-10-10', 'income', 'service', 'Tatuagem Blackwork', 1200.00, 'credit_card', 'completed'),
('2025-10-08', 'income', 'service', 'Tatuagem Minimalista', 400.00, 'pix', 'completed'),
('2025-10-05', 'income', 'service', 'Tatuagem Oriental', 1100.00, 'credit_card', 'completed');

-- Despesas
INSERT OR IGNORE INTO financial_transactions (
  transaction_date, type, category, description, amount, 
  payment_method, status
) VALUES
('2025-10-01', 'expense', 'rent', 'Aluguel do Estúdio - Outubro', 3500.00, 'transfer', 'completed'),
('2025-10-01', 'expense', 'utilities', 'Conta de Luz', 450.00, 'transfer', 'completed'),
('2025-10-15', 'expense', 'supplies', 'Agulhas e Tintas', 890.00, 'credit_card', 'completed'),
('2025-10-20', 'expense', 'supplies', 'Luvas e Material Descartável', 320.00, 'credit_card', 'completed');

-- Transações de meses anteriores
INSERT OR IGNORE INTO financial_transactions (
  transaction_date, type, category, description, amount, 
  payment_method, status
) VALUES
('2025-09-28', 'income', 'service', 'Tatuagem Cover-up', 750.00, 'credit_card', 'completed'),
('2025-09-25', 'income', 'service', 'Tatuagem Aquarela', 850.00, 'pix', 'completed'),
('2025-09-20', 'income', 'service', 'Tatuagem Tribal', 600.00, 'cash', 'completed'),
('2025-09-15', 'income', 'service', 'Piercing Industrial', 200.00, 'debit_card', 'completed'),
('2025-09-01', 'expense', 'rent', 'Aluguel do Estúdio - Setembro', 3500.00, 'transfer', 'completed'),
('2025-08-28', 'income', 'service', 'Tatuagem Lettering', 550.00, 'pix', 'completed'),
('2025-08-20', 'income', 'service', 'Tatuagem Manga Completa - Parte 1', 2000.00, 'credit_card', 'completed'),
('2025-08-15', 'expense', 'supplies', 'Reposição de Material', 1200.00, 'credit_card', 'completed'),
('2025-08-01', 'expense', 'rent', 'Aluguel do Estúdio - Agosto', 3500.00, 'transfer', 'completed');

-- Adicionar alguns produtos
INSERT OR IGNORE INTO products (
  id, name, description, category, price, cost, stock_quantity, is_active
) VALUES
(1, 'Pomada para Tatuagem', 'Pomada cicatrizante para tatuagens novas', 'Cuidados', 45.00, 25.00, 50, 1),
(2, 'Protetor Solar Tattoo', 'Protetor solar específico para tatuagens', 'Cuidados', 60.00, 35.00, 30, 1),
(3, 'Película Protetora', 'Película transparente para proteção', 'Cuidados', 25.00, 12.00, 100, 1);

