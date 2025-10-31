// const { calculateMD5, compareFiles } = require('../utils/fileHasher'); // Removido - não utilizado
const fs = require('fs-extra');

/**
 * Detecta e resolve conflitos de sincronização
 * Conflito: arquivo local modificado E arquivo remoto modificado
 */
class ConflictResolver {
  constructor(db) {
    this.db = db;
  }

  /**
   * Detecta conflitos para um arquivo específico
   * @param {number} fileId - ID do arquivo local
   * @returns {Promise<object>} { hasConflict, conflicts: [] }
   */
  async detectConflicts(fileId) {
    const file = await this._getFile(fileId);
    if (!file) {
      throw new Error('Arquivo não encontrado');
    }

    // Busca status de sincronização
    const syncStatuses = await this._getSyncStatuses(fileId);
    
    const conflicts = [];

    for (const status of syncStatuses) {
      // Verifica se há arquivo remoto sincronizado
      if (status.status === 'synced' && status.remote_file_id) {
        // TODO: Implementar comparação com arquivo remoto
        // Por enquanto, apenas detecta conflito se status for 'conflict'
        if (status.status === 'conflict') {
          conflicts.push({
            destinationId: status.destination_id,
            destinationName: status.destination_name,
            localHash: file.md5_hash,
            lastSync: status.last_sync,
            remoteFileId: status.remote_file_id
          });
        }
      }
    }

    return {
      hasConflict: conflicts.length > 0,
      fileId,
      fileName: file.file_name,
      conflicts
    };
  }

  /**
   * Detecta todos os conflitos no sistema
   * @returns {Promise<array>}
   */
  async detectAllConflicts() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT lf.id, lf.file_name, COUNT(ss.id) as conflict_count
         FROM local_files lf
         JOIN sync_status ss ON lf.id = ss.local_file_id
         WHERE ss.status = 'conflict'
         GROUP BY lf.id`,
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
   * Resolve conflito usando estratégia especificada
   * @param {number} fileId 
   * @param {number} destinationId 
   * @param {string} strategy - 'local_wins' | 'remote_wins' | 'keep_both' | 'manual'
   * @returns {Promise<object>}
   */
  async resolveConflict(fileId, destinationId, strategy) {
    console.log(`🔄 Resolvendo conflito: arquivo ${fileId}, estratégia: ${strategy}`);

    const file = await this._getFile(fileId);
    if (!file) {
      throw new Error('Arquivo não encontrado');
    }

    switch (strategy) {
      case 'local_wins':
        return this._resolveLocalWins(fileId, destinationId);
      
      case 'remote_wins':
        return this._resolveRemoteWins(fileId, destinationId);
      
      case 'keep_both':
        return this._resolveKeepBoth(fileId, destinationId);
      
      case 'manual':
        return this._resolveManual(fileId, destinationId);
      
      default:
        throw new Error(`Estratégia desconhecida: ${strategy}`);
    }
  }

  /**
   * Estratégia: Local vence (sobrescreve remoto)
   * @private
   */
  async _resolveLocalWins(fileId, destinationId) {
    console.log('📤 Estratégia: Local vence - re-sincronizando...');

    // Marca para re-sync
    await this._updateSyncStatus(fileId, destinationId, 'pending', 'Resolvendo conflito: local vence');

    return {
      success: true,
      strategy: 'local_wins',
      action: 'Arquivo local será sincronizado novamente',
      nextStep: 'Adicionar à fila de sincronização'
    };
  }

  /**
   * Estratégia: Remoto vence (baixa arquivo remoto)
   * @private
   */
  async _resolveRemoteWins(fileId, destinationId) {
    console.log('📥 Estratégia: Remoto vence - baixando arquivo...');

    // Implementação futura: baixar arquivo remoto
    // Por enquanto, apenas marca como synced

    await this._updateSyncStatus(fileId, destinationId, 'synced', 'Conflito resolvido: remoto venceu');

    return {
      success: true,
      strategy: 'remote_wins',
      action: 'Arquivo remoto mantido',
      nextStep: 'Download do arquivo remoto (não implementado)'
    };
  }

  /**
   * Estratégia: Mantém ambos (cria cópia)
   * @private
   */
  async _resolveKeepBoth(fileId, destinationId) {
    console.log('📋 Estratégia: Manter ambos - criando cópia...');

    const file = await this._getFile(fileId);
    
    // Cria cópia local com timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const basename = file.file_name.replace(/\.[^/.]+$/, '');
    const ext = file.file_name.match(/\.[^/.]+$/)?.[0] || '';
    const copyName = `${basename}_conflict_${timestamp}${ext}`;
    const copyPath = file.file_path.replace(file.file_name, copyName);

    try {
      await fs.copy(file.file_path, copyPath);
      console.log(`✅ Cópia criada: ${copyName}`);

      // Marca conflito como resolvido
      await this._updateSyncStatus(fileId, destinationId, 'synced', 'Conflito resolvido: ambos mantidos');

      return {
        success: true,
        strategy: 'keep_both',
        action: 'Cópia local criada',
        copyPath,
        copyName
      };
    } catch (error) {
      throw new Error(`Erro ao criar cópia: ${error.message}`);
    }
  }

  /**
   * Estratégia: Resolução manual (marca para review)
   * @private
   */
  async _resolveManual(fileId, destinationId) {
    console.log('👤 Estratégia: Resolução manual');

    await this._updateSyncStatus(fileId, destinationId, 'conflict', 'Aguardando resolução manual');

    return {
      success: true,
      strategy: 'manual',
      action: 'Marcado para resolução manual',
      message: 'Usuário deverá escolher qual versão manter'
    };
  }

  /**
   * Marca arquivo como conflito
   * @param {number} fileId 
   * @param {number} destinationId 
   * @param {string} [reason] 
   * @returns {Promise<void>}
   */
  async markAsConflict(fileId, destinationId, reason = 'Conflito detectado') {
    await this._updateSyncStatus(fileId, destinationId, 'conflict', reason);
    console.log(`⚠️ Conflito marcado: arquivo ${fileId}, destino ${destinationId}`);
  }

  /**
   * Obtém estatísticas de conflitos
   * @returns {Promise<object>}
   */
  async getConflictStats() {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT 
          COUNT(DISTINCT local_file_id) as files_with_conflicts,
          COUNT(*) as total_conflicts
         FROM sync_status
         WHERE status = 'conflict'`,
        (err, row) => {
          if (err) {
            reject(err);
          } else {
            resolve(row || { files_with_conflicts: 0, total_conflicts: 0 });
          }
        }
      );
    });
  }

  // ==========================================
  // MÉTODOS PRIVADOS (HELPERS)
  // ==========================================

  /**
   * Obtém arquivo do banco
   * @private
   */
  async _getFile(fileId) {
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
   * Obtém status de sincronização
   * @private
   */
  async _getSyncStatuses(fileId) {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT ss.*, sd.name as destination_name
         FROM sync_status ss
         JOIN sync_destinations sd ON ss.destination_id = sd.id
         WHERE ss.local_file_id = ?`,
        [fileId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        }
      );
    });
  }

  /**
   * Atualiza status de sincronização
   * @private
   */
  async _updateSyncStatus(fileId, destinationId, status, message = null) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE sync_status 
         SET status = ?, error_message = ?, last_sync = CURRENT_TIMESTAMP
         WHERE local_file_id = ? AND destination_id = ?`,
        [status, message, fileId, destinationId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
}

module.exports = ConflictResolver;

