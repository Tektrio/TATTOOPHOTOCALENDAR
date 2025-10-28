/**
 * Document Service
 * Gerenciamento de documentos legais e assinaturas
 */

class DocumentService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Adicionar documento
   */
  async addDocument(clientId, documentData) {
    const {
      document_type,
      document_name,
      document_url,
      signed_date,
      expiry_date,
      signature_data,
      version = '1.0'
    } = documentData;

    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT INTO client_documents (
          client_id, document_type, document_name, document_url,
          signed_date, expiry_date, signature_data, version, is_valid
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
      `, [
        clientId, document_type, document_name, document_url,
        signed_date || new Date().toISOString(), expiry_date,
        signature_data, version
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  /**
   * Obter documentos do cliente
   */
  async getClientDocuments(clientId, onlyValid = false) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT * FROM client_documents
        WHERE client_id = ?
      `;

      const params = [clientId];

      if (onlyValid) {
        sql += ' AND is_valid = 1';
        sql += ' AND (expiry_date IS NULL OR expiry_date > datetime(\'now\'))';
      }

      sql += ' ORDER BY created_at DESC';

      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Verificar se documento específico está válido
   */
  async checkDocumentValidity(clientId, documentType) {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT * FROM client_documents
        WHERE client_id = ? AND document_type = ? AND is_valid = 1
        AND (expiry_date IS NULL OR expiry_date > datetime('now'))
        ORDER BY signed_date DESC
        LIMIT 1
      `, [clientId, documentType], (err, row) => {
        if (err) reject(err);
        else resolve({
          isValid: !!row,
          document: row || null,
          needsRenewal: row && row.expiry_date ? new Date(row.expiry_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : false
        });
      });
    });
  }

  /**
   * Invalidar documento
   */
  async invalidateDocument(documentId) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE client_documents 
        SET is_valid = 0
        WHERE id = ?
      `, [documentId], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Renovar documento (invalidar antigo e criar novo)
   */
  async renewDocument(oldDocumentId, newDocumentData) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');

        // Invalidar documento antigo
        this.db.run(`
          UPDATE client_documents SET is_valid = 0 WHERE id = ?
        `, [oldDocumentId], (err) => {
          if (err) {
            this.db.run('ROLLBACK');
            return reject(err);
          }

          // Obter client_id do documento antigo
          this.db.get(`
            SELECT client_id FROM client_documents WHERE id = ?
          `, [oldDocumentId], (err, row) => {
            if (err || !row) {
              this.db.run('ROLLBACK');
              return reject(err || new Error('Document not found'));
            }

            // Criar novo documento
            this.db.run(`
              INSERT INTO client_documents (
                client_id, document_type, document_name, document_url,
                signed_date, expiry_date, signature_data, version, is_valid
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
            `, [
              row.client_id,
              newDocumentData.document_type,
              newDocumentData.document_name,
              newDocumentData.document_url,
              newDocumentData.signed_date || new Date().toISOString(),
              newDocumentData.expiry_date,
              newDocumentData.signature_data,
              newDocumentData.version || '1.0'
            ], function(err) {
              if (err) {
                this.db.run('ROLLBACK');
                reject(err);
              } else {
                this.db.run('COMMIT', (err) => {
                  if (err) {
                    this.db.run('ROLLBACK');
                    reject(err);
                  } else {
                    resolve({ success: true, newDocumentId: this.lastID });
                  }
                });
              }
            }.bind(this));
          });
        });
      });
    });
  }

  /**
   * Obter estatísticas de documentos
   */
  async getDocumentStats(clientId) {
    return new Promise((resolve, reject) => {
      this.db.get(`
        SELECT 
          COUNT(*) as total_documents,
          SUM(CASE WHEN is_valid = 1 THEN 1 ELSE 0 END) as valid_documents,
          SUM(CASE WHEN expiry_date IS NOT NULL AND expiry_date < datetime('now') THEN 1 ELSE 0 END) as expired_documents,
          SUM(CASE WHEN expiry_date IS NOT NULL AND expiry_date > datetime('now') AND expiry_date < datetime('now', '+30 days') THEN 1 ELSE 0 END) as expiring_soon
        FROM client_documents
        WHERE client_id = ?
      `, [clientId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * Obter documentos que expiram em breve (próximos 30 dias)
   */
  async getExpiringSoon(daysAhead = 30) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT 
          d.*,
          c.name as client_name,
          c.email as client_email
        FROM client_documents d
        JOIN clients c ON d.client_id = c.id
        WHERE d.is_valid = 1
        AND d.expiry_date IS NOT NULL
        AND d.expiry_date > datetime('now')
        AND d.expiry_date < datetime('now', '+' || ? || ' days')
        ORDER BY d.expiry_date ASC
      `, [daysAhead], (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Verificar completude de documentação
   */
  async checkDocumentCompleteness(clientId) {
    const requiredDocs = ['consent', 'health_form', 'image_release', 'liability'];
    
    return new Promise((resolve, reject) => {
      const promises = requiredDocs.map(docType => 
        this.checkDocumentValidity(clientId, docType)
      );

      Promise.all(promises)
        .then(results => {
          const status = {};
          requiredDocs.forEach((docType, index) => {
            status[docType] = results[index];
          });

          const allValid = results.every(r => r.isValid);
          const missingDocs = requiredDocs.filter((_, i) => !results[i].isValid);

          resolve({
            isComplete: allValid,
            missingDocuments: missingDocs,
            details: status
          });
        })
        .catch(reject);
    });
  }
}

module.exports = DocumentService;

