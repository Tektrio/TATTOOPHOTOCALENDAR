-- ============================================
-- MIGRAÇÃO 022: Documentos e Termos
-- Gestão de documentos legais e assinaturas
-- ============================================

CREATE TABLE IF NOT EXISTS client_documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id INTEGER NOT NULL,
  
  document_type TEXT NOT NULL,            -- consent, health_form, image_release, liability, cancellation
  document_name TEXT,
  document_url TEXT,
  
  signed_date TEXT,
  expiry_date TEXT,
  is_valid BOOLEAN DEFAULT 1,
  
  signature_data TEXT,                    -- Base64 da assinatura
  version TEXT DEFAULT '1.0',
  
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_documents_client ON client_documents(client_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON client_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_valid ON client_documents(is_valid);
CREATE INDEX IF NOT EXISTS idx_documents_expiry ON client_documents(expiry_date);

