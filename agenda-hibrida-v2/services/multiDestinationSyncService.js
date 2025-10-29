/**
 * Serviço de sincronização para múltiplos destinos
 * Coordena upload para Google Drive e QNAP
 */
class MultiDestinationSyncService {
  constructor(db, googleService, qnapService) {
    this.db = db;
    this.googleService = googleService;
    this.qnapService = qnapService;
  }

  /**
   * Sincroniza arquivo para destino específico
   * @param {number} fileId - ID do arquivo local
   * @param {number} destinationId - ID do destino
   * @returns {Promise<object>}
   */
  async syncToDestination(fileId, destinationId) {
    const file = await this._getLocalFile(fileId);
    if (!file) {
      throw new Error('Arquivo não encontrado');
    }

    const destination = await this._getDestination(destinationId);
    if (!destination) {
      throw new Error('Destino não encontrado');
    }

    if (!destination.enabled) {
      throw new Error('Destino está desabilitado');
    }

    console.log(`🔄 Sincronizando ${file.file_name} para ${destination.name}...`);

    // Atualiza status para "syncing"
    await this._updateSyncStatus(fileId, destinationId, 'syncing');

    try {
      let remoteFileId;
      const config = JSON.parse(destination.config);

      if (destination.type === 'gdrive') {
        remoteFileId = await this.googleService.uploadFile(
          file.file_path,
          file.file_name,
          config
        );
      } else if (destination.type === 'qnap') {
        remoteFileId = await this.qnapService.uploadFile(
          file.file_path,
          file.file_name,
          config
        );
      } else {
        throw new Error(`Tipo de destino não suportado: ${destination.type}`);
      }

      // Atualiza para "synced"
      await this._updateSyncStatus(fileId, destinationId, 'synced', remoteFileId);

      console.log(`✅ Sincronizado com sucesso para ${destination.name}`);

      return { 
        success: true,
        remoteFileId, 
        status: 'synced',
        destinationName: destination.name
      };
    } catch (error) {
      console.error(`❌ Erro ao sincronizar para ${destination.name}:`, error.message);
      
      // Atualiza para "failed"
      await this._updateSyncStatus(fileId, destinationId, 'failed', null, error.message);
      
      throw error;
    }
  }

  /**
   * Sincroniza arquivo para múltiplos destinos
   * @param {number} fileId - ID do arquivo local
   * @param {number[]} destinationIds - Array de IDs dos destinos
   * @returns {Promise<object>}
   */
  async syncToMultiple(fileId, destinationIds) {
    const file = await this._getLocalFile(fileId);
    if (!file) {
      throw new Error('Arquivo não encontrado');
    }

    console.log(`📤 Sincronizando ${file.file_name} para ${destinationIds.length} destinos...`);

    const results = [];

    for (const destId of destinationIds) {
      try {
        const result = await this.syncToDestination(fileId, destId);
        results.push({ 
          destinationId: destId, 
          success: true, 
          ...result 
        });
      } catch (error) {
        results.push({ 
          destinationId: destId, 
          success: false, 
          error: error.message 
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ ${successCount}/${destinationIds.length} sincronizações concluídas`);

    return { 
      fileId, 
      fileName: file.file_name,
      totalDestinations: destinationIds.length,
      successCount,
      results 
    };
  }

  /**
   * Obtém status de sincronização de um arquivo em todos os destinos
   * @param {number} fileId 
   * @returns {Promise<array>}
   */
  async getSyncStatus(fileId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT ss.*, sd.name as destination_name, sd.type, sd.color, sd.icon
         FROM sync_status ss
         JOIN sync_destinations sd ON ss.destination_id = sd.id
         WHERE ss.local_file_id = ?
         ORDER BY sd.priority DESC`,
        [fileId],
        (err, rows) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows || []);
          }
        }
      );
    });
  }

  /**
   * Obtém estatísticas de sincronização
   * @returns {Promise<object>}
   */
  async getStats() {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT 
          COUNT(DISTINCT local_file_id) as total_files,
          COUNT(CASE WHEN status = 'synced' THEN 1 END) as synced_count,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_count,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_count
         FROM sync_status`,
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || {});
          }
        }
      );
    });
  }

  /**
   * Re-sincroniza arquivos com falha
   * @param {number} destinationId - Opcional: filtrar por destino
   * @returns {Promise<object>}
   */
  async retryFailed(destinationId = null) {
    let query = `
      SELECT DISTINCT ss.local_file_id, ss.destination_id
      FROM sync_status ss
      WHERE ss.status = 'failed'
    `;
    const params = [];

    if (destinationId) {
      query += ' AND ss.destination_id = ?';
      params.push(destinationId);
    }

    const failed = await new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });

    console.log(`🔄 Re-sincronizando ${failed.length} arquivos com falha...`);

    const results = [];
    for (const item of failed) {
      try {
        await this.syncToDestination(item.local_file_id, item.destination_id);
        results.push({ ...item, success: true });
      } catch (error) {
        results.push({ ...item, success: false, error: error.message });
      }
    }

    const successCount = results.filter(r => r.success).length;
    return {
      total: failed.length,
      successCount,
      failedCount: failed.length - successCount,
      results
    };
  }

  // ==========================================
  // MÉTODOS PRIVADOS (HELPERS)
  // ==========================================

  /**
   * Obtém arquivo local do banco
   * @private
   */
  async _getLocalFile(fileId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM local_files WHERE id = ?', 
        [fileId], 
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  /**
   * Obtém destino do banco
   * @private
   */
  async _getDestination(destId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM sync_destinations WHERE id = ?', 
        [destId], 
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  /**
   * Atualiza status de sincronização
   * @private
   */
  async _updateSyncStatus(fileId, destId, status, remoteFileId = null, errorMsg = null) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO sync_status (local_file_id, destination_id, status, remote_file_id, last_sync, error_message, retry_count)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, ?, 0)
         ON CONFLICT(local_file_id, destination_id) 
         DO UPDATE SET 
           status = ?, 
           remote_file_id = COALESCE(?, remote_file_id), 
           last_sync = CURRENT_TIMESTAMP, 
           error_message = ?,
           retry_count = CASE WHEN ? = 'failed' THEN retry_count + 1 ELSE retry_count END`,
        [
          fileId, destId, status, remoteFileId, errorMsg,
          status, remoteFileId, errorMsg, status
        ],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
}

module.exports = MultiDestinationSyncService;

