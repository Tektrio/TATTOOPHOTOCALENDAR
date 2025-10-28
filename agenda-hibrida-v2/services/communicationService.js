/**
 * Communication Service
 * Gerenciamento de comunicação e timeline de interações com clientes
 */

class CommunicationService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Adicionar comunicação
   */
  async addCommunication(clientId, communicationData) {
    const {
      artist_id,
      communication_type,
      direction = 'outgoing',
      subject,
      content,
      timestamp,
      is_important = false,
      attachments = []
    } = communicationData;

    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT INTO client_communications (
          client_id, artist_id, communication_type, direction,
          subject, content, timestamp, is_important, attachments
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        clientId, artist_id, communication_type, direction,
        subject, content, timestamp || new Date().toISOString(),
        is_important ? 1 : 0, JSON.stringify(attachments)
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  /**
   * Obter timeline de comunicação do cliente
   */
  async getClientTimeline(clientId, filters = {}) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT * FROM client_communications
        WHERE client_id = ?
      `;

      const params = [clientId];

      // Filtros opcionais
      if (filters.communication_type) {
        sql += ' AND communication_type = ?';
        params.push(filters.communication_type);
      }

      if (filters.direction) {
        sql += ' AND direction = ?';
        params.push(filters.direction);
      }

      if (filters.is_important !== undefined) {
        sql += ' AND is_important = ?';
        params.push(filters.is_important ? 1 : 0);
      }

      if (filters.is_read !== undefined) {
        sql += ' AND is_read = ?';
        params.push(filters.is_read ? 1 : 0);
      }

      if (filters.start_date) {
        sql += ' AND timestamp >= ?';
        params.push(filters.start_date);
      }

      if (filters.end_date) {
        sql += ' AND timestamp <= ?';
        params.push(filters.end_date);
      }

      sql += ' ORDER BY timestamp DESC';

      if (filters.limit) {
        sql += ' LIMIT ?';
        params.push(filters.limit);
      }

      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else {
          // Parse attachments JSON
          rows = (rows || []).map(row => {
            if (row.attachments) {
              try {
                row.attachments = JSON.parse(row.attachments);
              } catch (e) {
                row.attachments = [];
              }
            }
            row.is_read = !!row.is_read;
            row.is_important = !!row.is_important;
            return row;
          });
          resolve(rows);
        }
      });
    });
  }

  /**
   * Marcar comunicação como lida
   */
  async markAsRead(communicationId, isRead = true) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE client_communications 
        SET is_read = ?
        WHERE id = ?
      `, [isRead ? 1 : 0, communicationId], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Marcar todas como lidas
   */
  async markAllAsRead(clientId) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE client_communications 
        SET is_read = 1
        WHERE client_id = ? AND is_read = 0
      `, [clientId], function(err) {
        if (err) reject(err);
        else resolve({ success: true, updated: this.changes });
      });
    });
  }

  /**
   * Marcar como importante
   */
  async toggleImportant(communicationId, isImportant) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE client_communications 
        SET is_important = ?
        WHERE id = ?
      `, [isImportant ? 1 : 0, communicationId], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Atualizar comunicação
   */
  async updateCommunication(communicationId, updateData) {
    const allowedFields = ['subject', 'content', 'is_important', 'is_read', 'attachments'];
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        fields.push(`${key} = ?`);
        if (key === 'attachments') {
          values.push(JSON.stringify(updateData[key]));
        } else if (key === 'is_important' || key === 'is_read') {
          values.push(updateData[key] ? 1 : 0);
        } else {
          values.push(updateData[key]);
        }
      }
    });

    if (fields.length === 0) {
      return Promise.resolve({ success: true, message: 'No fields to update' });
    }

    values.push(communicationId);

    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE client_communications 
        SET ${fields.join(', ')}
        WHERE id = ?
      `, values, (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Deletar comunicação
   */
  async deleteCommunication(communicationId) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        DELETE FROM client_communications WHERE id = ?
      `, [communicationId], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Obter estatísticas de comunicação
   */
  async getCommunicationStats(clientId, period = 'all') {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          COUNT(*) as total_communications,
          SUM(CASE WHEN direction = 'incoming' THEN 1 ELSE 0 END) as incoming,
          SUM(CASE WHEN direction = 'outgoing' THEN 1 ELSE 0 END) as outgoing,
          SUM(CASE WHEN communication_type = 'message' THEN 1 ELSE 0 END) as messages,
          SUM(CASE WHEN communication_type = 'call' THEN 1 ELSE 0 END) as calls,
          SUM(CASE WHEN communication_type = 'email' THEN 1 ELSE 0 END) as emails,
          SUM(CASE WHEN is_important = 1 THEN 1 ELSE 0 END) as important,
          SUM(CASE WHEN is_read = 0 THEN 1 ELSE 0 END) as unread,
          MAX(timestamp) as last_communication
        FROM client_communications
        WHERE client_id = ?
      `;

      const params = [clientId];

      // Filtro de período
      if (period !== 'all') {
        const periods = {
          'week': 7,
          'month': 30,
          'quarter': 90,
          'year': 365
        };

        if (periods[period]) {
          sql += ` AND timestamp >= datetime('now', '-${periods[period]} days')`;
        }
      }

      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  /**
   * Buscar comunicações
   */
  async searchCommunications(clientId, searchTerm) {
    return new Promise((resolve, reject) => {
      this.db.all(`
        SELECT * FROM client_communications
        WHERE client_id = ?
        AND (subject LIKE ? OR content LIKE ?)
        ORDER BY timestamp DESC
      `, [clientId, `%${searchTerm}%`, `%${searchTerm}%`], (err, rows) => {
        if (err) reject(err);
        else {
          rows = (rows || []).map(row => {
            if (row.attachments) {
              try {
                row.attachments = JSON.parse(row.attachments);
              } catch (e) {
                row.attachments = [];
              }
            }
            row.is_read = !!row.is_read;
            row.is_important = !!row.is_important;
            return row;
          });
          resolve(rows);
        }
      });
    });
  }

  /**
   * Obter últimas comunicações não lidas
   */
  async getUnreadCommunications(artistId = null, limit = 50) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          c.*,
          cl.name as client_name
        FROM client_communications c
        JOIN clients cl ON c.client_id = cl.id
        WHERE c.is_read = 0 AND c.direction = 'incoming'
      `;

      const params = [];

      if (artistId) {
        sql += ' AND c.artist_id = ?';
        params.push(artistId);
      }

      sql += ' ORDER BY c.timestamp DESC LIMIT ?';
      params.push(limit);

      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else {
          rows = (rows || []).map(row => {
            if (row.attachments) {
              try {
                row.attachments = JSON.parse(row.attachments);
              } catch (e) {
                row.attachments = [];
              }
            }
            return row;
          });
          resolve(rows);
        }
      });
    });
  }
}

module.exports = CommunicationService;

