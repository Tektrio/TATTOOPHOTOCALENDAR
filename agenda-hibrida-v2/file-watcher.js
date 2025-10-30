const chokidar = require('chokidar');
const path = require('path');
const fs = require('fs-extra');

/**
 * 👀 FILE WATCHER - Monitor de Arquivos Local
 * 
 * Monitora mudanças na pasta local e sincroniza automaticamente com Google Drive
 */
class FileWatcher {
  constructor(syncManager, uploadsPath, db, io) {
    this.syncManager = syncManager;
    this.uploadsPath = uploadsPath;
    this.db = db;
    this.io = io; // Socket.IO para notificações em tempo real
    this.watcher = null;
    this.isEnabled = false;
    this.ignoredPaths = new Set(); // Arquivos temporários a ignorar
    this.debounceTimers = new Map(); // Timers para debounce
  }

  /**
   * Iniciar monitoramento
   */
  start() {
    if (this.watcher) {
      console.log('⚠️ File Watcher já está rodando');
      return;
    }

    console.log('👀 Iniciando File Watcher...');
    
    this.watcher = chokidar.watch(this.uploadsPath, {
      ignored: /(^|[\/\\])\../, // Ignorar arquivos ocultos
      persistent: true,
      ignoreInitial: true, // Não processar arquivos existentes no início
      awaitWriteFinish: {
        stabilityThreshold: 2000, // Esperar 2s após última modificação
        pollInterval: 100
      }
    });

    // Evento: Novo arquivo adicionado
    this.watcher.on('add', (filePath) => {
      this.handleFileAdded(filePath);
    });

    // Evento: Arquivo modificado
    this.watcher.on('change', (filePath) => {
      this.handleFileChanged(filePath);
    });

    // Evento: Arquivo removido
    this.watcher.on('unlink', (filePath) => {
      this.handleFileDeleted(filePath);
    });

    // Evento: Erro
    this.watcher.on('error', (error) => {
      console.error('❌ Erro no File Watcher:', error);
    });

    this.isEnabled = true;
    console.log('✅ File Watcher iniciado com sucesso');
  }

  /**
   * Parar monitoramento
   */
  async stop() {
    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
      this.isEnabled = false;
      console.log('🛑 File Watcher parado');
    }
  }

  /**
   * Handler: Novo arquivo adicionado
   */
  async handleFileAdded(filePath) {
    try {
      // Ignorar se for caminho temporário
      if (this.ignoredPaths.has(filePath)) {
        return;
      }

      const relativePath = path.relative(this.uploadsPath, filePath);
      const fileName = path.basename(filePath);
      
      console.log(`📄 Novo arquivo detectado: ${relativePath}`);

      // Debounce: aguardar 3 segundos antes de processar
      this.debounce(`add_${filePath}`, async () => {
        // Verificar se arquivo ainda existe
        if (!await fs.pathExists(filePath)) {
          return;
        }

        // Extrair informações do caminho
        const pathParts = relativePath.split(path.sep);
        if (pathParts.length < 2) {
          console.log('⏭️ Arquivo não está em pasta de cliente, ignorando');
          return;
        }

        const clientFolderName = pathParts[0];
        
        // Extrair caminho completo da categoria (suporta caminhos aninhados)
        // Ex: Cliente_joao_123/Tattoo/01_Referencias/foto.jpg -> Tattoo/01_Referencias
        const categoryPath = pathParts.slice(1, -1).join('/') || 'outros';
        
        console.log(`📂 Pasta detectada: ${clientFolderName}, Categoria: ${categoryPath}`);

        // Buscar cliente no banco
        const client = await this.findClientByFolderName(clientFolderName);
        if (!client) {
          console.log(`⚠️ Cliente não encontrado para pasta: ${clientFolderName}`);
          return;
        }

        // Obter informações do arquivo
        const stats = await fs.stat(filePath);
        const hash = await this.syncManager.calculateFileHash(filePath);

        const fileInfo = {
          name: fileName,
          path: relativePath,
          size: stats.size,
          mtime: stats.mtime,
          hash: hash,
          source: 'local'
        };

        // Fazer upload para Google Drive
        console.log(`⬆️ Iniciando upload automático para Drive: ${fileName}`);
        const uploadResult = await this.syncManager.uploadToDrive(
          fileInfo,
          clientFolderName,
          categoryPath
        );

        if (uploadResult.success) {
          // Registrar no banco de dados
          await this.registerFileInDatabase(client.id, fileInfo, categoryPath);

          // Notificar clientes conectados via WebSocket
          this.io.emit('file_synced', {
            action: 'added',
            clientId: client.id,
            clientName: client.name,
            file: fileInfo,
            driveFile: uploadResult.file
          });

          console.log(`✅ Arquivo sincronizado: ${fileName}`);
        } else {
          console.error(`❌ Falha no upload: ${fileName}`, uploadResult.error);
        }
      }, 3000);

    } catch (error) {
      console.error('❌ Erro ao processar arquivo adicionado:', error);
    }
  }

  /**
   * Handler: Arquivo modificado
   */
  async handleFileChanged(filePath) {
    try {
      const relativePath = path.relative(this.uploadsPath, filePath);
      const fileName = path.basename(filePath);
      
      console.log(`✏️ Arquivo modificado: ${relativePath}`);

      // Debounce: aguardar 3 segundos antes de processar
      this.debounce(`change_${filePath}`, async () => {
        // Similar ao handleFileAdded, mas atualizar arquivo existente
        const pathParts = relativePath.split(path.sep);
        if (pathParts.length < 2) return;

        const clientFolderName = pathParts[0];
        
        // Extrair caminho completo da categoria (suporta caminhos aninhados)
        const categoryPath = pathParts.slice(1, -1).join('/') || 'outros';

        const client = await this.findClientByFolderName(clientFolderName);
        if (!client) return;

        const stats = await fs.stat(filePath);
        const hash = await this.syncManager.calculateFileHash(filePath);

        const fileInfo = {
          name: fileName,
          path: relativePath,
          size: stats.size,
          mtime: stats.mtime,
          hash: hash,
          source: 'local'
        };

        // Re-upload para Drive (criar nova versão)
        console.log(`🔄 Atualizando arquivo no Drive: ${fileName}`);
        const uploadResult = await this.syncManager.uploadToDrive(
          fileInfo,
          clientFolderName,
          categoryPath
        );

        if (uploadResult.success) {
          // Atualizar registro no banco
          await this.updateFileInDatabase(client.id, fileInfo);

          this.io.emit('file_synced', {
            action: 'updated',
            clientId: client.id,
            clientName: client.name,
            file: fileInfo
          });

          console.log(`✅ Arquivo atualizado: ${fileName}`);
        }
      }, 3000);

    } catch (error) {
      console.error('❌ Erro ao processar arquivo modificado:', error);
    }
  }

  /**
   * Handler: Arquivo deletado
   */
  async handleFileDeleted(filePath) {
    try {
      const relativePath = path.relative(this.uploadsPath, filePath);
      const fileName = path.basename(filePath);
      
      console.log(`🗑️ Arquivo removido: ${relativePath}`);

      const pathParts = relativePath.split(path.sep);
      if (pathParts.length < 2) return;

      const clientFolderName = pathParts[0];

      const client = await this.findClientByFolderName(clientFolderName);
      if (!client) return;

      // Marcar como deletado no banco (soft delete)
      await this.markFileAsDeleted(client.id, fileName);

      this.io.emit('file_synced', {
        action: 'deleted',
        clientId: client.id,
        clientName: client.name,
        fileName: fileName
      });

      console.log(`✅ Arquivo marcado como deletado: ${fileName}`);

    } catch (error) {
      console.error('❌ Erro ao processar arquivo deletado:', error);
    }
  }

  /**
   * Debounce helper
   */
  debounce(key, func, delay) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key));
    }

    const timer = setTimeout(() => {
      func();
      this.debounceTimers.delete(key);
    }, delay);

    this.debounceTimers.set(key, timer);
  }

  /**
   * Buscar cliente pelo nome da pasta
   */
  async findClientByFolderName(folderName) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM clients WHERE folder_path = ?',
        [folderName],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  /**
   * Registrar arquivo no banco de dados
   */
  async registerFileInDatabase(clientId, fileInfo, category) {
    return new Promise((resolve, reject) => {
      const fileType = this.getFileType(fileInfo.name);
      
      this.db.run(
        `INSERT INTO files 
         (client_id, filename, original_name, file_path, storage_type, category, file_type, file_size, created_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
        [
          clientId,
          fileInfo.name,
          fileInfo.name,
          fileInfo.path,
          'hybrid',
          category,
          fileType,
          fileInfo.size
        ],
        function(err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  /**
   * Atualizar arquivo no banco de dados
   */
  async updateFileInDatabase(clientId, fileInfo) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE files 
         SET file_size = ?, updated_at = datetime('now')
         WHERE client_id = ? AND filename = ?`,
        [fileInfo.size, clientId, fileInfo.name],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  /**
   * Marcar arquivo como deletado (soft delete)
   */
  async markFileAsDeleted(clientId, fileName) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE files 
         SET deleted_at = datetime('now')
         WHERE client_id = ? AND filename = ? AND deleted_at IS NULL`,
        [clientId, fileName],
        function(err) {
          if (err) reject(err);
          else resolve(this.changes);
        }
      );
    });
  }

  /**
   * Determinar tipo de arquivo
   */
  getFileType(filename) {
    const ext = path.extname(filename).toLowerCase();
    
    if (['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'].includes(ext)) {
      return 'image';
    } else if (['.psd', '.ai', '.sketch'].includes(ext)) {
      return 'design';
    } else if (['.pdf', '.doc', '.docx', '.txt'].includes(ext)) {
      return 'document';
    } else if (['.mp4', '.mov', '.avi', '.mkv'].includes(ext)) {
      return 'video';
    }
    
    return 'other';
  }

  /**
   * Adicionar caminho à lista de ignorados temporariamente
   */
  addToIgnoreList(filePath, duration = 5000) {
    this.ignoredPaths.add(filePath);
    setTimeout(() => {
      this.ignoredPaths.delete(filePath);
    }, duration);
  }
}

module.exports = FileWatcher;

