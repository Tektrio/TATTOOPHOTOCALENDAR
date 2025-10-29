const { getNextAvailableColor } = require('../utils/colorAssigner');
const { validateDestination } = require('../utils/syncValidator');

/**
 * Serviço de gerenciamento de destinos de sincronização
 * (Google Drive + QNAP NAS)
 */
class SyncDestinationsService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Lista todos os destinos de sincronização
   * @returns {Promise<array>}
   */
  async list() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT sd.*,
          (SELECT COUNT(*) FROM sync_status WHERE destination_id = sd.id AND status = 'synced') as synced_files_count,
          (SELECT COUNT(*) FROM sync_status WHERE destination_id = sd.id AND status = 'failed') as failed_files_count
         FROM sync_destinations sd
         ORDER BY sd.priority DESC, sd.created_at ASC`,
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            // Parse JSON config
            const destinations = rows.map(row => ({
              ...row,
              config: JSON.parse(row.config || '{}')
            }));
            resolve(destinations);
          }
        }
      );
    });
  }

  /**
   * Adiciona novo destino de sincronização
   * @param {object} destination - { type, name, config, priority }
   * @returns {Promise<object>}
   */
  async add(destination) {
    // Valida dados
    const validation = validateDestination(destination);
    if (!validation.valid) {
      throw new Error(`Validação falhou: ${validation.errors.join(', ')}`);
    }

    const { type, name, config, priority = 0 } = destination;
    
    // Auto-assign color para Google Drive
    let color = destination.color;
    if (type === 'gdrive' && !color) {
      const existing = await this.list();
      const usedColors = existing
        .filter(d => d.type === 'gdrive')
        .map(d => d.color);
      color = getNextAvailableColor(usedColors);
    } else if (type === 'qnap') {
      color = 'orange'; // QNAP sempre laranja
    }

    const icon = type === 'gdrive' ? 'Cloud' : 'Server';

    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO sync_destinations (type, name, enabled, config, color, icon, priority)
         VALUES (?, ?, 1, ?, ?, ?, ?)`,
        [type, name, JSON.stringify(config), color, icon, priority],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ 
              id: this.lastID, 
              type, 
              name, 
              color, 
              icon,
              priority 
            });
          }
        }
      );
    });
  }

  /**
   * Atualiza destino existente
   * @param {number} id 
   * @param {object} updates - { name, enabled, config, priority }
   * @returns {Promise<object>}
   */
  async update(id, updates) {
    const fields = [];
    const values = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }

    if (updates.enabled !== undefined) {
      fields.push('enabled = ?');
      values.push(updates.enabled ? 1 : 0);
    }

    if (updates.config !== undefined) {
      fields.push('config = ?');
      values.push(JSON.stringify(updates.config));
    }

    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      values.push(updates.priority);
    }

    if (fields.length === 0) {
      throw new Error('Nenhum campo para atualizar');
    }

    values.push(id);

    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE sync_destinations SET ${fields.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ success: true, changes: this.changes });
          }
        }
      );
    });
  }

  /**
   * Remove destino de sincronização
   * @param {number} id 
   * @returns {Promise<object>}
   */
  async remove(id) {
    // Verifica se existem sincronizações ativas
    const hasActiveSync = await new Promise((resolve, reject) => {
      this.db.get(
        `SELECT COUNT(*) as count FROM sync_status 
         WHERE destination_id = ? AND status IN ('pending', 'syncing')`,
        [id],
        (err, row) => {
          if (err) reject(err);
          else resolve(row.count > 0);
        }
      );
    });

    if (hasActiveSync) {
      throw new Error('Não é possível remover destino com sincronizações ativas');
    }

    return new Promise((resolve, reject) => {
      this.db.run(
        'DELETE FROM sync_destinations WHERE id = ?',
        [id],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ success: true, changes: this.changes });
          }
        }
      );
    });
  }

  /**
   * Obtém destino por ID
   * @param {number} id 
   * @returns {Promise<object|null>}
   */
  async getById(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM sync_destinations WHERE id = ?',
        [id],
        (err, row) => {
          if (err) {
            reject(err);
          } else if (row) {
            resolve({
              ...row,
              config: JSON.parse(row.config || '{}')
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  /**
   * Lista destinos por tipo
   * @param {string} type - 'gdrive' ou 'qnap'
   * @returns {Promise<array>}
   */
  async listByType(type) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT * FROM sync_destinations WHERE type = ? ORDER BY created_at ASC`,
        [type],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const destinations = rows.map(row => ({
              ...row,
              config: JSON.parse(row.config || '{}')
            }));
            resolve(destinations);
          }
        }
      );
    });
  }

  /**
   * Habilita/desabilita destino
   * @param {number} id 
   * @param {boolean} enabled 
   * @returns {Promise<object>}
   */
  async setEnabled(id, enabled) {
    return this.update(id, { enabled });
  }
}

module.exports = SyncDestinationsService;

