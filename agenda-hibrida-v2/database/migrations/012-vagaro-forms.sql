-- ============================================
-- MIGRAÇÃO 012: Tabela de Formulários do Vagaro
-- Rastreia formulários preenchidos e assinaturas
-- ============================================

CREATE TABLE IF NOT EXISTS vagaro_forms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  form_name TEXT NOT NULL,
  form_type TEXT,
  client_id INTEGER,
  customer_name TEXT,
  fill_date TEXT,
  signature_date TEXT,
  signature_status TEXT,
  signature_required TEXT,
  form_data TEXT,
  notes TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE SET NULL
)
