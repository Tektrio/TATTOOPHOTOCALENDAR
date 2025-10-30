const EventEmitter = require('events');
const fs = require('fs-extra');
const path = require('path');

/**
 * Serviço de Operações de Pasta (Fila Assíncrona)
 * Gerencia operações demoradas em background (criação de pastas no Drive, etc)
 */
class FolderOperationService extends EventEmitter {
  constructor(db) {
    super();
    this.db = db;
    this.processing = new Set();
    this.workers = [];
    this.syncManager = null;
    this.isRunning = false;
  }

  /**
   * Configurar dependências
   * @param {Object} syncManager - Instância do SyncManager
   */
  setSyncManager(syncManager) {
    this.syncManager = syncManager;
  }

  /**
   * Iniciar workers
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️ FolderOperationService já está rodando');
      return;
    }

    const workerCount = parseInt(process.env.FOLDER_OPERATION_WORKERS) || 2;
    console.log(`🚀 Iniciando ${workerCount} workers para processamento de pastas`);

    this.isRunning = true;

    for (let i = 0; i < workerCount; i++) {
      const interval = setInterval(() => {
        if (this.isRunning) {
          this.processQueue().catch(err => {
            console.error(`❌ Erro no worker ${i}:`, err);
          });
        }
      }, 5000); // Processar a cada 5 segundos

      this.workers.push(interval);
    }
  }

  /**
   * Parar workers
   */
  stop() {
    console.log('⏹️ Parando FolderOperationService');
    this.isRunning = false;

    this.workers.forEach(interval => clearInterval(interval));
    this.workers = [];
  }

  /**
   * Enfileirar operação
   * @param {number} clientId - ID do cliente
   * @param {string} operationType - Tipo de operação
   * @param {Object} payload - Dados da operação
   * @returns {Promise<number>} - ID da operação
   */
  async enqueue(clientId, operationType, payload) {
    return new Promise((resolve, reject) => {
      const payloadJson = JSON.stringify(payload);

      this.db.run(
        `INSERT INTO folder_operations_queue 
         (client_id, operation_type, payload) 
         VALUES (?, ?, ?)`,
        [clientId, operationType, payloadJson],
        function(err) {
          if (err) {
            console.error('❌ Erro ao enfileirar operação:', err);
            reject(err);
          } else {
            console.log(`📥 Operação ${operationType} enfileirada para cliente ${clientId} (ID: ${this.lastID})`);
            resolve(this.lastID);
          }
        }
      );
    });
  }

  /**
   * Processar próxima operação da fila
   */
  async processQueue() {
    return new Promise((resolve, reject) => {
      // Buscar próxima operação pendente
      this.db.get(
        `SELECT * FROM folder_operations_queue 
         WHERE status = 'pending' 
         AND attempts < max_attempts 
         ORDER BY created_at ASC 
         LIMIT 1`,
        async (err, operation) => {
          if (err) {
            console.error('❌ Erro ao buscar operação:', err);
            return reject(err);
          }

          if (!operation) {
            // Nenhuma operação pendente
            return resolve();
          }

          // Verificar se já está sendo processada
          if (this.processing.has(operation.id)) {
            return resolve();
          }

          this.processing.add(operation.id);

          try {
            // Marcar como processando
            await this.markProcessing(operation.id);

            // Executar operação
            await this.executeOperation(operation);

            // Marcar como concluída
            await this.markCompleted(operation.id);

            this.emit('operation:completed', operation);
            console.log(`✅ Operação ${operation.operation_type} concluída (ID: ${operation.id})`);

          } catch (error) {
            console.error(`❌ Erro ao executar operação ${operation.id}:`, error);

            // Marcar como falhada
            await this.markFailed(operation.id, error.message);

            this.emit('operation:failed', { operation, error });

          } finally {
            this.processing.delete(operation.id);
            resolve();
          }
        }
      );
    });
  }

  /**
   * Executar operação específica
   * @param {Object} operation - Dados da operação
   */
  async executeOperation(operation) {
    const payload = JSON.parse(operation.payload);

    switch (operation.operation_type) {
      case 'create_drive_structure':
        await this.createDriveStructure(payload);
        break;

      case 'rename_folder':
        await this.renameFolder(payload);
        break;

      case 'sync_to_drive':
        await this.syncToDrive(payload);
        break;

      case 'delete':
        await this.deleteFolder(payload);
        break;

      default:
        throw new Error(`Tipo de operação desconhecido: ${operation.operation_type}`);
    }
  }

  /**
   * Criar estrutura de pastas no Google Drive
   * @param {Object} payload - { folderName, structure }
   */
  async createDriveStructure(payload) {
    if (!this.syncManager) {
      throw new Error('SyncManager não configurado');
    }

    const { folderName, structure } = payload;

    if (!folderName || !structure) {
      throw new Error('Payload inválido para create_drive_structure');
    }

    console.log(`📁 Criando estrutura no Drive para: ${folderName}`);

    // Usar o novo método createFolderStructure do SyncManager
    await this.syncManager.createFolderStructure(folderName, structure);

    console.log(`✅ Estrutura no Drive criada: ${folderName}`);
  }

  /**
   * Renomear pasta local e atualizar banco
   * @param {Object} payload - { oldPath, newPath, clientId }
   */
  async renameFolder(payload) {
    const { oldPath, newPath, clientId } = payload;

    if (!oldPath || !newPath || !clientId) {
      throw new Error('Payload inválido para rename_folder');
    }

    console.log(`📝 Renomeando pasta: ${oldPath} -> ${newPath}`);

    // Verificar se pasta antiga existe
    if (!await fs.pathExists(oldPath)) {
      throw new Error(`Pasta não encontrada: ${oldPath}`);
    }

    // Verificar se nova pasta já existe
    if (await fs.pathExists(newPath)) {
      throw new Error(`Pasta de destino já existe: ${newPath}`);
    }

    // Renomear
    await fs.move(oldPath, newPath);

    // Atualizar banco
    await new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE clients SET folder_path = ? WHERE id = ?',
        [path.basename(newPath), clientId],
        (err) => err ? reject(err) : resolve()
      );
    });

    console.log(`✅ Pasta renomeada com sucesso`);
  }

  /**
   * Sincronizar pasta com Drive
   * @param {Object} payload - { clientFolderPath, clientFolderName }
   */
  async syncToDrive(payload) {
    if (!this.syncManager) {
      throw new Error('SyncManager não configurado');
    }

    const { clientFolderPath, clientFolderName } = payload;

    if (!clientFolderPath || !clientFolderName) {
      throw new Error('Payload inválido para sync_to_drive');
    }

    console.log(`🔄 Sincronizando com Drive: ${clientFolderName}`);

    await this.syncManager.syncClientFolder(clientFolderPath, clientFolderName);

    console.log(`✅ Sincronização concluída: ${clientFolderName}`);
  }

  /**
   * Deletar pasta e arquivos
   * @param {Object} payload - { folderPath, clientId }
   */
  async deleteFolder(payload) {
    const { folderPath, clientId } = payload;

    if (!folderPath || !clientId) {
      throw new Error('Payload inválido para delete');
    }

    console.log(`🗑️ Deletando pasta: ${folderPath}`);

    if (await fs.pathExists(folderPath)) {
      await fs.remove(folderPath);
    }

    console.log(`✅ Pasta deletada: ${folderPath}`);
  }

  /**
   * Marcar operação como processando
   * @param {number} operationId - ID da operação
   */
  async markProcessing(operationId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE folder_operations_queue 
         SET status = 'processing', updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [operationId],
        (err) => err ? reject(err) : resolve()
      );
    });
  }

  /**
   * Marcar operação como concluída
   * @param {number} operationId - ID da operação
   */
  async markCompleted(operationId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE folder_operations_queue 
         SET status = 'completed', updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [operationId],
        (err) => err ? reject(err) : resolve()
      );
    });
  }

  /**
   * Marcar operação como falhada
   * @param {number} operationId - ID da operação
   * @param {string} error - Mensagem de erro
   */
  async markFailed(operationId, error) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE folder_operations_queue 
         SET status = 'failed', 
             error = ?, 
             attempts = attempts + 1, 
             updated_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [error, operationId],
        (err) => err ? reject(err) : resolve()
      );
    });
  }

  /**
   * Obter estatísticas da fila
   * @returns {Promise<Object>}
   */
  async getStats() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT 
          status, 
          COUNT(*) as count 
         FROM folder_operations_queue 
         GROUP BY status`,
        (err, rows) => {
          if (err) return reject(err);

          const stats = {
            pending: 0,
            processing: 0,
            completed: 0,
            failed: 0
          };

          rows.forEach(row => {
            stats[row.status] = row.count;
          });

          resolve(stats);
        }
      );
    });
  }
}

module.exports = FolderOperationService;

