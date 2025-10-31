/**
 * Waiting List Service
 * Gerenciamento da fila de espera de projetos de tatuagem
 */

class WaitingListService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Adicionar projeto à waiting list
   */
  async addToWaitingList(clientId, projectData) {
    const {
      artist_id,
      project_name,
      description,
      priority = 'medium',
      session_type = 'first',
      estimated_sessions = 1,
      estimated_hours_total = 0,
      estimated_cost = 0,
      deposit_paid = 0,
      target_start_date,
      body_location,
      size_category,
      notes
    } = projectData;

    return new Promise((resolve, reject) => {
      this.db.run(`
        INSERT INTO client_waiting_list (
          client_id, artist_id, project_name, description, priority,
          session_type, estimated_sessions, estimated_hours_total,
          estimated_cost, deposit_paid, target_start_date,
          body_location, size_category, notes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        clientId, artist_id, project_name, description, priority,
        session_type, estimated_sessions, estimated_hours_total,
        estimated_cost, deposit_paid, target_start_date,
        body_location, size_category, notes
      ], function(err) {
        if (err) reject(err);
        else resolve({ id: this.lastID });
      });
    });
  }

  /**
   * Atualizar prioridade de um projeto
   */
  async updatePriority(waitingListId, priority) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE client_waiting_list 
        SET priority = ?
        WHERE id = ?
      `, [priority, waitingListId], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Obter waiting list de um cliente
   */
  async getClientWaitingList(clientId, status = null) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT wl.*, c.name as client_name
        FROM client_waiting_list wl
        JOIN clients c ON wl.client_id = c.id
        WHERE wl.client_id = ?
      `;
      const params = [clientId];

      if (status) {
        sql += ' AND wl.status = ?';
        params.push(status);
      }

      sql += ' ORDER BY CASE priority WHEN \'urgent\' THEN 1 WHEN \'high\' THEN 2 WHEN \'medium\' THEN 3 ELSE 4 END, added_date';

      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  /**
   * Agendar sessão a partir da waiting list
   */
  async scheduleFromWaitingList(waitingListId, _appointmentData) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');

        // Atualizar status do projeto na waiting list
        this.db.run(`
          UPDATE client_waiting_list 
          SET status = 'scheduled'
          WHERE id = ?
        `, [waitingListId], (err) => {
          if (err) {
            this.db.run('ROLLBACK');
            return reject(err);
          }

          // Aqui você pode criar o appointment
          // (integração com appointmentService)

          this.db.run('COMMIT', (err) => {
            if (err) {
              this.db.run('ROLLBACK');
              reject(err);
            } else {
              resolve({ success: true });
            }
          });
        });
      });
    });
  }

  /**
   * Reordenar prioridades (drag and drop)
   */
  async reorderPriorities(clientId, orderedIds) {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run('BEGIN TRANSACTION');

        const updates = orderedIds.map((id, index) => {
          return new Promise((res, rej) => {
            // Usar added_date para manter ordem personalizada
            const customOrder = new Date(Date.now() + index * 1000).toISOString();
            this.db.run(`
              UPDATE client_waiting_list 
              SET added_date = ?
              WHERE id = ? AND client_id = ?
            `, [customOrder, id, clientId], (err) => {
              if (err) rej(err);
              else res();
            });
          });
        });

        Promise.all(updates)
          .then(() => {
            this.db.run('COMMIT', (err) => {
              if (err) {
                this.db.run('ROLLBACK');
                reject(err);
              } else {
                resolve({ success: true });
              }
            });
          })
          .catch((err) => {
            this.db.run('ROLLBACK');
            reject(err);
          });
      });
    });
  }

  /**
   * Atualizar projeto na waiting list
   */
  async updateWaitingListItem(waitingListId, updateData) {
    const fields = [];
    const values = [];

    Object.keys(updateData).forEach(key => {
      fields.push(`${key} = ?`);
      values.push(updateData[key]);
    });

    values.push(waitingListId);

    return new Promise((resolve, reject) => {
      this.db.run(`
        UPDATE client_waiting_list 
        SET ${fields.join(', ')}
        WHERE id = ?
      `, values, (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Remover da waiting list
   */
  async removeFromWaitingList(waitingListId) {
    return new Promise((resolve, reject) => {
      this.db.run(`
        DELETE FROM client_waiting_list WHERE id = ?
      `, [waitingListId], (err) => {
        if (err) reject(err);
        else resolve({ success: true });
      });
    });
  }

  /**
   * Obter estatísticas da waiting list
   */
  async getWaitingListStats(artistId = null) {
    return new Promise((resolve, reject) => {
      let sql = `
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'waiting' THEN 1 ELSE 0 END) as waiting,
          SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) as scheduled,
          SUM(CASE WHEN priority = 'urgent' THEN 1 ELSE 0 END) as urgent,
          SUM(estimated_cost) as total_estimated_revenue,
          SUM(deposit_paid) as total_deposits
        FROM client_waiting_list
      `;

      const params = [];
      if (artistId) {
        sql += ' WHERE artist_id = ?';
        params.push(artistId);
      }

      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
}

module.exports = WaitingListService;

