const chokidar = require('chokidar');
const { calculateMD5 } = require('../utils/fileHasher');
const path = require('path');

/**
 * Monitora pasta local e detecta mudanças em arquivos
 * Emite eventos via WebSocket para o frontend
 */
class LocalFileWatcher {
  constructor(db, io, localStorageService) {
    this.db = db;
    this.io = io;
    this.localStorageService = localStorageService;
    this.watcher = null;
    this.isWatching = false;
  }

  /**
   * Inicia monitoramento da pasta local
   * @param {string} basePath - Caminho da pasta a monitorar
   * @returns {Promise<void>}
   */
  async start(basePath) {
    if (this.watcher) {
      console.log('⚠️ Watcher já está ativo, parando anterior...');
      await this.stop();
    }

    console.log(`👁️ Iniciando monitoramento de: ${basePath}`);

    this.watcher = chokidar.watch(basePath, {
      ignored: /(^|[\/\\])\../, // Ignora arquivos/pastas ocultos
      persistent: true,
      ignoreInitial: true, // Não processa arquivos existentes no start
      awaitWriteFinish: {
        stabilityThreshold: 2000, // Aguarda 2s após última modificação
        pollInterval: 100
      }
    });

    this.watcher
      .on('add', path => this._handleFileAdded(path, basePath))
      .on('change', path => this._handleFileChanged(path, basePath))
      .on('unlink', path => this._handleFileDeleted(path, basePath))
      .on('error', error => console.error(`❌ Erro no watcher: ${error.message}`));

    this.isWatching = true;
    console.log('✅ File watcher ativo');
  }

  /**
   * Handler: Novo arquivo detectado
   * @private
   * @param {string} filePath 
   * @param {string} basePath 
   */
  async _handleFileAdded(filePath, basePath) {
    try {
      console.log(`➕ Novo arquivo detectado: ${path.basename(filePath)}`);

      // Indexa arquivo no banco
      const indexed = await this.localStorageService._indexFile(filePath, basePath);

      // Emite evento via WebSocket
      if (this.io) {
        this.io.emit('file:added', {
          fileId: indexed.id,
          filePath: indexed.filePath,
          fileName: indexed.fileName,
          clientId: indexed.clientId,
          timestamp: new Date().toISOString()
        });
      }

      console.log(`✅ Arquivo indexado: ID ${indexed.id}`);
    } catch (error) {
      console.error(`❌ Erro ao processar arquivo novo: ${error.message}`);
    }
  }

  /**
   * Handler: Arquivo modificado
   * @private
   * @param {string} filePath 
   * @param {string} basePath 
   */
  async _handleFileChanged(filePath, basePath) {
    try {
      console.log(`✏️ Arquivo modificado: ${path.basename(filePath)}`);

      // Busca arquivo no banco
      const existingFile = await this._getFileByPath(filePath);
      
      if (!existingFile) {
        console.log('Arquivo não estava indexado, indexando agora...');
        await this._handleFileAdded(filePath, basePath);
        return;
      }

      // Calcula novo MD5
      const newHash = await calculateMD5(filePath);

      if (newHash !== existingFile.md5_hash) {
        console.log('🔄 Hash diferente, arquivo foi realmente modificado');

        // Atualiza hash no banco
        await this._updateFileHash(existingFile.id, newHash);

        // Marca sincronizações como "pending" para re-sync
        await this._markForResync(existingFile.id);

        // Emite evento via WebSocket
        if (this.io) {
          this.io.emit('file:changed', {
            fileId: existingFile.id,
            filePath,
            fileName: existingFile.file_name,
            oldHash: existingFile.md5_hash,
            newHash,
            timestamp: new Date().toISOString()
          });
        }

        console.log(`✅ Arquivo atualizado: ID ${existingFile.id}`);
      } else {
        console.log('Hash igual, arquivo não mudou realmente');
      }
    } catch (error) {
      console.error(`❌ Erro ao processar arquivo modificado: ${error.message}`);
    }
  }

  /**
   * Handler: Arquivo deletado
   * @private
   * @param {string} filePath 
   * @param {string} basePath 
   */
  async _handleFileDeleted(filePath, basePath) {
    try {
      console.log(`🗑️ Arquivo deletado: ${path.basename(filePath)}`);

      // Busca arquivo no banco
      const existingFile = await this._getFileByPath(filePath);
      
      if (existingFile) {
        // Remove do banco (CASCADE deleta sync_status também)
        await this.localStorageService.removeFromIndex(existingFile.id);

        // Emite evento via WebSocket
        if (this.io) {
          this.io.emit('file:deleted', {
            fileId: existingFile.id,
            filePath,
            fileName: existingFile.file_name,
            timestamp: new Date().toISOString()
          });
        }

        console.log(`✅ Arquivo removido do índice: ID ${existingFile.id}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao processar arquivo deletado: ${error.message}`);
    }
  }

  /**
   * Para monitoramento
   * @returns {Promise<void>}
   */
  async stop() {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      this.isWatching = false;
      console.log('🛑 File watcher parado');
    }
  }

  /**
   * Obtém status do watcher
   * @returns {object}
   */
  getStatus() {
    return {
      isWatching: this.isWatching,
      watching: this.watcher ? true : false
    };
  }

  // ==========================================
  // MÉTODOS PRIVADOS (DB HELPERS)
  // ==========================================

  /**
   * Busca arquivo por path
   * @private
   */
  async _getFileByPath(filePath) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM local_files WHERE file_path = ?',
        [filePath],
        (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        }
      );
    });
  }

  /**
   * Atualiza hash do arquivo
   * @private
   */
  async _updateFileHash(fileId, newHash) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE local_files SET md5_hash = ?, last_modified = CURRENT_TIMESTAMP WHERE id = ?',
        [newHash, fileId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  /**
   * Marca sincronizações existentes como pending para re-sync
   * @private
   */
  async _markForResync(fileId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE sync_status 
         SET status = 'pending', error_message = 'Arquivo modificado, aguardando re-sync'
         WHERE local_file_id = ? AND status = 'synced'`,
        [fileId],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }
}

module.exports = LocalFileWatcher;

