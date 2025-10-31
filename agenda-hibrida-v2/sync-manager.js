const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
// const { google } = require('googleapis'); // Removido - não utilizado

/**
 * 📦 SYNC MANAGER - Gerenciador de Sincronização Híbrida
 * 
 * Sincroniza arquivos entre:
 * - Pasta Local (QNAP via rede)
 * - Google Drive (backup secundário)
 * - Banco de dados SQLite (metadados)
 */
class SyncManager {
  constructor(driveClient, db, uploadsPath) {
    this.driveClient = driveClient;
    this.db = db;
    this.uploadsPath = uploadsPath;
    this.metadataCache = new Map(); // Cache de metadados do Drive
    this.syncInProgress = new Set(); // Arquivos em sincronização
  }

  /**
   * Calcular hash MD5 de um arquivo local
   */
  async calculateFileHash(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const stream = fs.createReadStream(filePath);
      
      stream.on('error', reject);
      stream.on('data', chunk => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
    });
  }

  /**
   * Listar arquivos locais de uma pasta
   */
  async listLocalFiles(folderPath) {
    try {
      const fullPath = path.join(this.uploadsPath, folderPath);
      
      if (!await fs.pathExists(fullPath)) {
        return [];
      }

      const files = await fs.readdir(fullPath);
      const fileDetails = [];

      for (const file of files) {
        const filePath = path.join(fullPath, file);
        const stats = await fs.stat(filePath);

        if (stats.isFile()) {
          const hash = await this.calculateFileHash(filePath);
          
          fileDetails.push({
            name: file,
            path: path.join(folderPath, file),
            size: stats.size,
            mtime: stats.mtime,
            hash: hash,
            source: 'local'
          });
        }
      }

      return fileDetails;
    } catch (error) {
      console.error('❌ Erro ao listar arquivos locais:', error);
      return [];
    }
  }

  /**
   * Listar arquivos do Google Drive de uma pasta
   */
  async listDriveFiles(clientFolderName) {
    try {
      if (!this.driveClient) {
        console.warn('⚠️ Google Drive não está disponível');
        return [];
      }

      // Buscar pasta do cliente no Drive
      const folderQuery = `name='${clientFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const folderResponse = await this.driveClient.files.list({
        q: folderQuery,
        fields: 'files(id, name)',
        pageSize: 1
      });

      if (!folderResponse.data.files || folderResponse.data.files.length === 0) {
        console.log(`📁 Pasta "${clientFolderName}" não encontrada no Drive`);
        return [];
      }

      const clientFolder = folderResponse.data.files[0];
      console.log(`📁 Pasta encontrada no Drive: ${clientFolder.name} (${clientFolder.id})`);

      // Listar arquivos dentro da pasta (incluindo subpastas)
      const filesQuery = `'${clientFolder.id}' in parents and trashed=false`;
      const filesResponse = await this.driveClient.files.list({
        q: filesQuery,
        fields: 'files(id, name, size, modifiedTime, md5Checksum, mimeType)',
        orderBy: 'modifiedTime desc',
        pageSize: 1000
      });

      const files = filesResponse.data.files || [];
      
      // Processar recursivamente subpastas
      const allFiles = [];
      for (const file of files) {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          // É uma subpasta, buscar arquivos dentro dela
          const subFiles = await this.listDriveFilesRecursive(file.id, file.name);
          allFiles.push(...subFiles);
        } else {
          // É um arquivo
          allFiles.push({
            id: file.id,
            name: file.name,
            size: parseInt(file.size || 0),
            mtime: new Date(file.modifiedTime),
            hash: file.md5Checksum,
            mimeType: file.mimeType,
            source: 'drive'
          });
        }
      }

      return allFiles;
    } catch (error) {
      console.error('❌ Erro ao listar arquivos do Drive:', error);
      return [];
    }
  }

  /**
   * Listar arquivos recursivamente de uma pasta do Drive
   */
  async listDriveFilesRecursive(folderId, folderName) {
    try {
      const filesQuery = `'${folderId}' in parents and trashed=false`;
      const filesResponse = await this.driveClient.files.list({
        q: filesQuery,
        fields: 'files(id, name, size, modifiedTime, md5Checksum, mimeType)',
        pageSize: 1000
      });

      const files = filesResponse.data.files || [];
      const allFiles = [];

      for (const file of files) {
        if (file.mimeType === 'application/vnd.google-apps.folder') {
          const subFiles = await this.listDriveFilesRecursive(
            file.id, 
            `${folderName}/${file.name}`
          );
          allFiles.push(...subFiles);
        } else {
          allFiles.push({
            id: file.id,
            name: file.name,
            path: `${folderName}/${file.name}`,
            size: parseInt(file.size || 0),
            mtime: new Date(file.modifiedTime),
            hash: file.md5Checksum,
            mimeType: file.mimeType,
            source: 'drive'
          });
        }
      }

      return allFiles;
    } catch (error) {
      console.error('❌ Erro ao listar arquivos recursivamente:', error);
      return [];
    }
  }

  /**
   * Comparar arquivos locais vs Drive e identificar diferenças
   */
  compareFiles(localFiles, driveFiles) {
    const comparison = {
      onlyLocal: [],      // Arquivos que existem apenas localmente (precisam upload)
      onlyDrive: [],      // Arquivos que existem apenas no Drive (precisam download)
      conflicts: [],      // Arquivos que existem em ambos mas com diferenças
      synced: []          // Arquivos já sincronizados
    };

    // Criar mapa de arquivos por nome
    const localMap = new Map(localFiles.map(f => [f.name, f]));
    const driveMap = new Map(driveFiles.map(f => [f.name, f]));

    // Verificar arquivos locais
    for (const localFile of localFiles) {
      const driveFile = driveMap.get(localFile.name);

      if (!driveFile) {
        // Arquivo existe apenas localmente
        comparison.onlyLocal.push(localFile);
      } else {
        // Arquivo existe em ambos - verificar se há conflito
        const timeDiff = Math.abs(localFile.mtime - driveFile.mtime);
        const sizeDiff = Math.abs(localFile.size - driveFile.size);
        
        // Conflito se: timestamps diferem > 60s OU tamanhos diferentes OU hashes diferentes
        if (timeDiff > 60000 || sizeDiff > 0 || (localFile.hash && driveFile.hash && localFile.hash !== driveFile.hash)) {
          comparison.conflicts.push({
            name: localFile.name,
            local: localFile,
            drive: driveFile,
            timeDiff: timeDiff,
            sizeDiff: sizeDiff
          });
        } else {
          comparison.synced.push(localFile.name);
        }
      }
    }

    // Verificar arquivos que existem apenas no Drive
    for (const driveFile of driveFiles) {
      if (!localMap.has(driveFile.name)) {
        comparison.onlyDrive.push(driveFile);
      }
    }

    return comparison;
  }

  /**
   * Baixar arquivo do Google Drive
   */
  async downloadFromDrive(driveFile, localFolderPath) {
    const downloadKey = `${driveFile.id}_download`;
    
    if (this.syncInProgress.has(downloadKey)) {
      console.log(`⏭️ Download já em andamento: ${driveFile.name}`);
      return { success: false, reason: 'already_in_progress' };
    }

    this.syncInProgress.add(downloadKey);

    try {
      console.log(`⬇️ Baixando do Drive: ${driveFile.name}`);
      
      const fullPath = path.join(this.uploadsPath, localFolderPath);
      await fs.ensureDir(fullPath);
      
      const destPath = path.join(fullPath, driveFile.name);

      // Baixar arquivo do Drive
      const response = await this.driveClient.files.get(
        { fileId: driveFile.id, alt: 'media' },
        { responseType: 'stream' }
      );

      return new Promise((resolve, reject) => {
        const dest = fs.createWriteStream(destPath);
        
        response.data
          .on('end', () => {
            console.log(`✅ Download concluído: ${driveFile.name}`);
            this.syncInProgress.delete(downloadKey);
            resolve({ success: true, path: destPath });
          })
          .on('error', err => {
            console.error(`❌ Erro no download: ${driveFile.name}`, err);
            this.syncInProgress.delete(downloadKey);
            reject(err);
          })
          .pipe(dest);
      });
    } catch (error) {
      this.syncInProgress.delete(downloadKey);
      console.error('❌ Erro ao baixar do Drive:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Fazer upload de arquivo para Google Drive
   */
  async uploadToDrive(localFile, clientFolderName, category = 'outros') {
    const uploadKey = `${localFile.path}_upload`;
    
    if (this.syncInProgress.has(uploadKey)) {
      console.log(`⏭️ Upload já em andamento: ${localFile.name}`);
      return { success: false, reason: 'already_in_progress' };
    }

    this.syncInProgress.add(uploadKey);

    try {
      console.log(`⬆️ Enviando para Drive: ${localFile.name}`);

      // Buscar ou criar pasta do cliente no Drive
      const clientFolderId = await this.getOrCreateDriveFolder(clientFolderName);
      
      if (!clientFolderId) {
        throw new Error('Não foi possível criar pasta do cliente no Drive');
      }

      // Buscar ou criar subpasta da categoria (suporta caminhos aninhados)
      const categoryFolderId = await this.createNestedDriveFolders(category, clientFolderId);

      // Upload do arquivo
      const filePath = path.join(this.uploadsPath, localFile.path);
      const fileMetadata = {
        name: localFile.name,
        parents: [categoryFolderId]
      };

      const media = {
        mimeType: require('mime-types').lookup(localFile.name) || 'application/octet-stream',
        body: fs.createReadStream(filePath)
      };

      const response = await this.driveClient.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, size, modifiedTime, md5Checksum'
      });

      console.log(`✅ Upload concluído: ${localFile.name}`);
      this.syncInProgress.delete(uploadKey);
      
      return { success: true, file: response.data };
    } catch (error) {
      this.syncInProgress.delete(uploadKey);
      console.error('❌ Erro ao fazer upload para Drive:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Buscar ou criar pasta no Google Drive
   */
  async getOrCreateDriveFolder(folderName, parentId = null) {
    try {
      // Escapar aspas simples no nome da pasta
      const escapedFolderName = folderName.replace(/'/g, "\\'");
      
      // Buscar pasta existente
      let query = `name='${escapedFolderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      if (parentId) {
        query += ` and '${parentId}' in parents`;
      }

      const response = await this.driveClient.files.list({
        q: query,
        fields: 'files(id, name)',
        pageSize: 1
      });

      if (response.data.files && response.data.files.length > 0) {
        console.log(`✅ Pasta encontrada no Drive: ${folderName}`);
        return response.data.files[0].id;
      }

      // Criar nova pasta
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentId ? [parentId] : []
      };

      const folder = await this.driveClient.files.create({
        requestBody: fileMetadata,
        fields: 'id'
      });

      console.log(`📁 Pasta criada no Drive: ${folderName}`);
      return folder.data.id;
    } catch (error) {
      console.error('❌ Erro ao buscar/criar pasta no Drive:', error);
      return null;
    }
  }

  /**
   * Criar estrutura de pastas aninhadas no Google Drive
   * Suporta caminhos como "Tattoo/01_Referencias" ou "Documentos/Contratos_Assinados"
   * @param {string} folderPath - Caminho completo (ex: "Tattoo/01_Referencias")
   * @param {string} clientFolderId - ID da pasta raiz do cliente no Drive
   * @returns {Promise<string>} - ID da pasta final criada
   */
  async createNestedDriveFolders(folderPath, clientFolderId) {
    try {
      if (!folderPath) {
        return clientFolderId;
      }

      const parts = folderPath.split('/').filter(p => p.trim().length > 0);
      let currentParentId = clientFolderId;

      console.log(`📁 Criando estrutura aninhada no Drive: ${folderPath}`);

      // Navegar pela hierarquia criando pastas conforme necessário
      for (const part of parts) {
        currentParentId = await this.getOrCreateDriveFolder(part, currentParentId);
        
        if (!currentParentId) {
          throw new Error(`Falha ao criar/encontrar pasta: ${part}`);
        }
      }

      console.log(`✅ Estrutura aninhada criada: ${folderPath}`);
      return currentParentId;
    } catch (error) {
      console.error('❌ Erro ao criar estrutura aninhada:', error);
      throw error;
    }
  }

  /**
   * Criar estrutura completa de pastas de um cliente no Drive
   * @param {string} clientFolderName - Nome da pasta raiz do cliente
   * @param {Array<string>} folderStructure - Array de caminhos (ex: ["Tattoo/01_Referencias", "Documentos/Contratos"])
   * @returns {Promise<string>} - ID da pasta raiz do cliente
   */
  async createFolderStructure(clientFolderName, folderStructure) {
    try {
      console.log(`📁 Criando estrutura completa no Drive para: ${clientFolderName}`);

      // Criar/obter pasta raiz do cliente
      const clientFolderId = await this.getOrCreateDriveFolder(clientFolderName);
      
      if (!clientFolderId) {
        throw new Error('Não foi possível criar pasta raiz do cliente');
      }

      // Criar todas as subpastas
      for (const folderPath of folderStructure) {
        await this.createNestedDriveFolders(folderPath, clientFolderId);
      }

      console.log(`✅ Estrutura completa criada no Drive para: ${clientFolderName}`);
      return clientFolderId;
    } catch (error) {
      console.error('❌ Erro ao criar estrutura de pastas no Drive:', error);
      throw error;
    }
  }

  /**
   * Sincronizar pasta de cliente (download de arquivos faltantes)
   */
  async syncClientFolder(clientFolderPath, clientFolderName) {
    console.log(`\n🔄 Iniciando sincronização: ${clientFolderName}`);

    try {
      // 1. Listar arquivos locais
      const localFiles = await this.listLocalFiles(clientFolderPath);
      console.log(`📂 Arquivos locais: ${localFiles.length}`);

      // 2. Listar arquivos do Drive
      const driveFiles = await this.listDriveFiles(clientFolderName);
      console.log(`☁️ Arquivos no Drive: ${driveFiles.length}`);

      // 3. Comparar arquivos
      const comparison = this.compareFiles(localFiles, driveFiles);
      console.log(`\n📊 Análise de sincronização:`);
      console.log(`   ✅ Sincronizados: ${comparison.synced.length}`);
      console.log(`   ⬇️ Apenas no Drive (baixar): ${comparison.onlyDrive.length}`);
      console.log(`   ⬆️ Apenas local (enviar): ${comparison.onlyLocal.length}`);
      console.log(`   ⚠️ Conflitos: ${comparison.conflicts.length}`);

      // 4. Baixar arquivos que existem apenas no Drive
      const downloadResults = [];
      for (const driveFile of comparison.onlyDrive) {
        const result = await this.downloadFromDrive(driveFile, clientFolderPath);
        downloadResults.push({ file: driveFile.name, ...result });
      }

      return {
        success: true,
        comparison,
        downloads: downloadResults,
        needsConflictResolution: comparison.conflicts.length > 0
      };
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Resolver conflito de arquivo
   */
  async resolveConflict(conflict, resolution) {
    console.log(`🔧 Resolvendo conflito: ${conflict.name} (${resolution})`);

    try {
      const localPath = path.join(this.uploadsPath, conflict.local.path);

      switch (resolution) {
        case 'keep_local':
          // Manter versão local e sobrescrever no Drive
          await this.uploadToDrive(conflict.local, conflict.drive.id);
          return { success: true, kept: 'local' };

        case 'keep_drive':
          // Manter versão do Drive e sobrescrever local
          await this.downloadFromDrive(conflict.drive, path.dirname(conflict.local.path));
          return { success: true, kept: 'drive' };

        case 'keep_both':
          // Manter ambos, renomeando o local
          const timestamp = new Date().getTime();
          const ext = path.extname(conflict.local.name);
          const nameWithoutExt = path.basename(conflict.local.name, ext);
          const newName = `${nameWithoutExt}_local_${timestamp}${ext}`;
          const newPath = path.join(path.dirname(localPath), newName);
          
          await fs.rename(localPath, newPath);
          await this.downloadFromDrive(conflict.drive, path.dirname(conflict.local.path));
          
          return { success: true, kept: 'both', renamedTo: newName };

        default:
          return { success: false, error: 'Resolução inválida' };
      }
    } catch (error) {
      console.error('❌ Erro ao resolver conflito:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = SyncManager;

