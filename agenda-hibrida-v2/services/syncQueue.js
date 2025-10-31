/**
 * Fila de sincronização com processamento em background
 * Gerencia sincronizações pendentes com retry automático
 */
class SyncQueue {
  constructor(db, io, multiSyncService) {
    this.db = db;
    this.io = io;
    this.multiSyncService = multiSyncService;
    this.processing = false;
    this.processInterval = null;
  }

  /**
   * Adiciona arquivo à fila de sincronização
   * @param {number} fileId - ID do arquivo local
   * @param {number[]} destinationIds - IDs dos destinos
   * @param {number} [priority=5] - Prioridade (1-10, maior = mais prioritário)
   * @returns {Promise<object>}
   */
  async addToQueue(fileId, destinationIds, priority = 5) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO sync_queue (local_file_id, destination_ids, priority, status)
         VALUES (?, ?, ?, 'pending')`,
        [fileId, JSON.stringify(destinationIds), priority],
        function(err) {
          if (err) {
            reject(err);
          } else {
            const queueId = this.lastID;
            console.log(`📋 Adicionado à fila: queue ID ${queueId}`);
            resolve({ queueId, fileId, destinationIds, priority });
          }
        }
      );
    });
  }

  /**
   * Inicia processamento automático da fila
   * Processa a cada 5 segundos
   */
  startAutoProcess() {
    if (this.processInterval) {
      console.log('⚠️ Auto-processamento já está ativo');
      return;
    }

    console.log('🔄 Iniciando auto-processamento da fila');
    
    this.processInterval = setInterval(() => {
      this.processQueue().catch(err => {
        console.error('Erro no auto-processamento:', err.message);
      });
    }, 5000); // 5 segundos
  }

  /**
   * Para processamento automático
   */
  stopAutoProcess() {
    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
      console.log('🛑 Auto-processamento parado');
    }
  }

  /**
   * Processa fila de sincronização
   * Processa um item por vez, respeitando prioridade
   * @returns {Promise<object>}
   */
  async processQueue() {
    if (this.processing) {
      return { message: 'Já está processando' };
    }

    this.processing = true;
    let processedCount = 0;

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const item = await this._getNextQueueItem();
        
        if (!item) {
          break; // Fila vazia
        }

        try {
          await this._processQueueItem(item);
          processedCount++;
        } catch (error) {
          console.error(`❌ Erro ao processar queue ${item.id}:`, error.message);
        }
      }

      if (processedCount > 0) {
        console.log(`✅ Processados ${processedCount} itens da fila`);
      }

      return { 
        processed: processedCount,
        message: processedCount > 0 ? 'Fila processada' : 'Fila vazia'
      };
    } finally {
      this.processing = false;
    }
  }

  /**
   * Obtém próximo item da fila (maior prioridade primeiro)
   * @private
   * @returns {Promise<object|null>}
   */
  async _getNextQueueItem() {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM sync_queue 
         WHERE status = 'pending' 
         ORDER BY priority DESC, created_at ASC 
         LIMIT 1`,
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || null);
          }
        }
      );
    });
  }

  /**
   * Processa item individual da fila
   * @private
   * @param {object} item 
   */
  async _processQueueItem(item) {
    const { id, local_file_id, destination_ids } = item;
    const destIds = JSON.parse(destination_ids);

    console.log(`🔄 Processando queue ${id} - Arquivo ${local_file_id}`);

    // Atualiza para "processing"
    await this._updateQueueStatus(id, 'processing');
    
    // Emite evento WebSocket
    if (this.io) {
      this.io.emit('sync:progress', { 
        queueId: id, 
        status: 'processing',
        fileId: local_file_id
      });
    }

    try {
      // Executa sincronização
      const result = await this.multiSyncService.syncToMultiple(local_file_id, destIds);
      
      // Verifica se todas sincronizações tiveram sucesso
      const allSuccess = result.results.every(r => r.success);
      const someSuccess = result.results.some(r => r.success);

      if (allSuccess) {
        // Tudo OK
        await this._updateQueueStatus(id, 'completed');
        
        if (this.io) {
          this.io.emit('sync:complete', { 
            queueId: id, 
            fileId: local_file_id,
            result 
          });
        }
      } else if (someSuccess) {
        // Algumas falharam
        await this._updateQueueStatus(id, 'completed', 'Algumas sincronizações falharam');
        
        if (this.io) {
          this.io.emit('sync:partial', { 
            queueId: id, 
            fileId: local_file_id,
            result 
          });
        }
      } else {
        // Todas falharam
        throw new Error('Todas as sincronizações falharam');
      }

      console.log(`✅ Queue ${id} concluído`);
    } catch (error) {
      // Falha total
      await this._updateQueueStatus(id, 'failed', error.message);
      
      if (this.io) {
        this.io.emit('sync:error', { 
          queueId: id, 
          fileId: local_file_id,
          error: error.message 
        });
      }

      console.error(`❌ Queue ${id} falhou: ${error.message}`);
    }
  }

  /**
   * Atualiza status do item na fila
   * @private
   */
  async _updateQueueStatus(id, status, errorMsg = null) {
    return new Promise((resolve, reject) => {
      const timeField = status === 'processing' ? 'started_at' :
                        (status === 'completed' || status === 'failed') ? 'completed_at' : null;
      
      let query = `UPDATE sync_queue SET status = ?, error_message = ?`;
      if (timeField) {
        query += `, ${timeField} = CURRENT_TIMESTAMP`;
      }
      query += ` WHERE id = ?`;

      this.db.run(query, [status, errorMsg, id], (err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  /**
   * Lista itens da fila
   * @param {string} [status] - Filtrar por status
   * @returns {Promise<array>}
   */
  async list(status = null) {
    return new Promise((resolve, reject) => {
      let query = `
        SELECT sq.*, lf.file_name, lf.client_id
        FROM sync_queue sq
        LEFT JOIN local_files lf ON sq.local_file_id = lf.id
      `;
      const params = [];

      if (status) {
        query += ' WHERE sq.status = ?';
        params.push(status);
      }

      query += ' ORDER BY sq.priority DESC, sq.created_at ASC';

      this.db.all(query, params, (err, rows) => {
        if (err) {
          reject(err);
        } else {
          const items = rows.map(row => ({
            ...row,
            destination_ids: JSON.parse(row.destination_ids || '[]')
          }));
          resolve(items);
        }
      });
    });
  }

  /**
   * Cancela item da fila
   * @param {number} queueId 
   * @returns {Promise<object>}
   */
  async cancel(queueId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE sync_queue SET status = 'cancelled', error_message = 'Cancelado pelo usuário'
         WHERE id = ? AND status IN ('pending', 'processing')`,
        [queueId],
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
   * Limpa itens concluídos antigos (mais de 7 dias)
   * @returns {Promise<number>} Quantidade removida
   */
  async cleanOld() {
    return new Promise((resolve, reject) => {
      this.db.run(
        `DELETE FROM sync_queue 
         WHERE status IN ('completed', 'cancelled', 'failed')
         AND datetime(completed_at) < datetime('now', '-7 days')`,
        function(err) {
          if (err) {
            reject(err);
          } else {
            console.log(`🧹 ${this.changes} itens antigos removidos da fila`);
            resolve(this.changes);
          }
        }
      );
    });
  }

  /**
   * Obtém estatísticas da fila
   * @returns {Promise<object>}
   */
  async getStats() {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT 
          COUNT(*) as total,
          COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending,
          COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing,
          COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
          COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
          COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled
         FROM sync_queue`,
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
}

module.exports = SyncQueue;

