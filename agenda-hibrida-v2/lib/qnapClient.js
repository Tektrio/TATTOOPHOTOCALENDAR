const { createClient } = require('webdav');
const ftp = require('basic-ftp');
const fs = require('fs-extra');
const path = require('path');

/**
 * Cliente QNAP NAS com suporte para WebDAV e FTP
 * WebDAV é preferencial, FTP como fallback
 */
class QnapClient {
  /**
   * @param {object} config 
   * @param {string} config.host - Host/IP do QNAP
   * @param {number} [config.port] - Porta (opcional)
   * @param {string} config.username - Usuário
   * @param {string} config.password - Senha
   * @param {string} config.protocol - 'webdav' ou 'ftp'
   * @param {string} [config.remotePath] - Pasta remota base
   * @param {boolean} [config.secure] - HTTPS/FTPS (opcional)
   */
  constructor(config) {
    this.config = config;
    this.protocol = config.protocol || 'webdav';
    this.client = null;
    this.connected = false;
  }

  /**
   * Conecta ao QNAP
   * @returns {Promise<object>}
   */
  async connect() {
    if (this.protocol === 'webdav') {
      return this._connectWebDAV();
    } else if (this.protocol === 'ftp') {
      return this._connectFTP();
    } else {
      throw new Error(`Protocolo não suportado: ${this.protocol}`);
    }
  }

  /**
   * Conecta via WebDAV
   * @private
   * @returns {Promise<object>}
   */
  async _connectWebDAV() {
    try {
      const protocol = this.config.secure ? 'https' : 'http';
      const port = this.config.port || (this.config.secure ? 443 : 80);
      const url = `${protocol}://${this.config.host}:${port}`;
      
      console.log(`🔌 Conectando ao QNAP via WebDAV: ${url}`);

      this.client = createClient(url, {
        username: this.config.username,
        password: this.config.password
      });

      // Testa conexão listando diretório raiz
      await this.client.getDirectoryContents(this.config.remotePath || '/');
      
      this.connected = true;
      console.log('✅ Conectado ao QNAP via WebDAV');
      
      return { 
        success: true, 
        protocol: 'webdav',
        url 
      };
    } catch (error) {
      throw new Error(`Falha na conexão WebDAV: ${error.message}`);
    }
  }

  /**
   * Conecta via FTP
   * @private
   * @returns {Promise<object>}
   */
  async _connectFTP() {
    try {
      this.client = new ftp.Client();
      this.client.ftp.verbose = false; // Debug logs
      
      const port = this.config.port || 21;
      console.log(`🔌 Conectando ao QNAP via FTP: ${this.config.host}:${port}`);

      await this.client.access({
        host: this.config.host,
        port: port,
        user: this.config.username,
        password: this.config.password,
        secure: this.config.secure || false
      });

      this.connected = true;
      console.log('✅ Conectado ao QNAP via FTP');
      
      return { 
        success: true, 
        protocol: 'ftp',
        host: this.config.host,
        port
      };
    } catch (error) {
      throw new Error(`Falha na conexão FTP: ${error.message}`);
    }
  }

  /**
   * Upload de arquivo
   * @param {string} localPath - Caminho local do arquivo
   * @param {string} remotePath - Caminho remoto (relativo ao base)
   * @returns {Promise<string>} Caminho remoto final
   */
  async uploadFile(localPath, remotePath) {
    if (!this.connected) {
      await this.connect();
    }

    // Verifica se arquivo existe
    if (!await fs.pathExists(localPath)) {
      throw new Error(`Arquivo local não encontrado: ${localPath}`);
    }

    // Monta caminho remoto completo
    const fullRemotePath = this.config.remotePath 
      ? path.posix.join(this.config.remotePath, remotePath)
      : remotePath;

    console.log(`📤 Upload: ${path.basename(localPath)} → ${fullRemotePath}`);

    try {
      if (this.protocol === 'webdav') {
        const fileStream = fs.createReadStream(localPath);
        await this.client.putFileContents(fullRemotePath, fileStream);
      } else if (this.protocol === 'ftp') {
        // Garante que o diretório remoto existe
        const remoteDir = path.posix.dirname(fullRemotePath);
        try {
          await this.client.ensureDir(remoteDir);
        } catch (err) {
          // Ignora erro se diretório já existe
        }
        
        await this.client.uploadFrom(localPath, fullRemotePath);
      }

      console.log(`✅ Upload concluído: ${fullRemotePath}`);
      return fullRemotePath;
    } catch (error) {
      throw new Error(`Erro no upload: ${error.message}`);
    }
  }

  /**
   * Download de arquivo
   * @param {string} remotePath - Caminho remoto
   * @param {string} localPath - Caminho local destino
   * @returns {Promise<string>} Caminho local final
   */
  async downloadFile(remotePath, localPath) {
    if (!this.connected) {
      await this.connect();
    }

    const fullRemotePath = this.config.remotePath 
      ? path.posix.join(this.config.remotePath, remotePath)
      : remotePath;

    console.log(`📥 Download: ${fullRemotePath} → ${localPath}`);

    try {
      // Garante que diretório local existe
      await fs.ensureDir(path.dirname(localPath));

      if (this.protocol === 'webdav') {
        const fileStream = await this.client.createReadStream(fullRemotePath);
        const writeStream = fs.createWriteStream(localPath);
        
        return new Promise((resolve, reject) => {
          fileStream.pipe(writeStream);
          writeStream.on('finish', () => {
            console.log(`✅ Download concluído: ${localPath}`);
            resolve(localPath);
          });
          writeStream.on('error', reject);
        });
      } else if (this.protocol === 'ftp') {
        await this.client.downloadTo(localPath, fullRemotePath);
        console.log(`✅ Download concluído: ${localPath}`);
        return localPath;
      }
    } catch (error) {
      throw new Error(`Erro no download: ${error.message}`);
    }
  }

  /**
   * Lista arquivos em diretório
   * @param {string} [remotePath='/'] - Caminho remoto
   * @returns {Promise<array>}
   */
  async listFiles(remotePath = '/') {
    if (!this.connected) {
      await this.connect();
    }

    const fullRemotePath = this.config.remotePath 
      ? path.posix.join(this.config.remotePath, remotePath)
      : remotePath;

    try {
      if (this.protocol === 'webdav') {
        const contents = await this.client.getDirectoryContents(fullRemotePath);
        return contents.map(item => ({
          name: item.basename,
          size: item.size,
          type: item.type, // 'file' ou 'directory'
          lastModified: item.lastmod
        }));
      } else if (this.protocol === 'ftp') {
        const list = await this.client.list(fullRemotePath);
        return list.map(item => ({
          name: item.name,
          size: item.size,
          type: item.isDirectory ? 'directory' : 'file',
          lastModified: item.modifiedAt
        }));
      }
    } catch (error) {
      throw new Error(`Erro ao listar arquivos: ${error.message}`);
    }
  }

  /**
   * Deleta arquivo
   * @param {string} remotePath - Caminho remoto
   * @returns {Promise<void>}
   */
  async deleteFile(remotePath) {
    if (!this.connected) {
      await this.connect();
    }

    const fullRemotePath = this.config.remotePath 
      ? path.posix.join(this.config.remotePath, remotePath)
      : remotePath;

    console.log(`🗑️ Deletando: ${fullRemotePath}`);

    try {
      if (this.protocol === 'webdav') {
        await this.client.deleteFile(fullRemotePath);
      } else if (this.protocol === 'ftp') {
        await this.client.remove(fullRemotePath);
      }
      
      console.log(`✅ Arquivo deletado: ${fullRemotePath}`);
    } catch (error) {
      throw new Error(`Erro ao deletar arquivo: ${error.message}`);
    }
  }

  /**
   * Verifica se arquivo existe
   * @param {string} remotePath 
   * @returns {Promise<boolean>}
   */
  async exists(remotePath) {
    if (!this.connected) {
      await this.connect();
    }

    const fullRemotePath = this.config.remotePath 
      ? path.posix.join(this.config.remotePath, remotePath)
      : remotePath;

    try {
      if (this.protocol === 'webdav') {
        return await this.client.exists(fullRemotePath);
      } else if (this.protocol === 'ftp') {
        try {
          await this.client.size(fullRemotePath);
          return true;
        } catch {
          return false;
        }
      }
    } catch {
      return false;
    }
  }

  /**
   * Desconecta
   * @returns {Promise<void>}
   */
  async disconnect() {
    if (this.protocol === 'ftp' && this.client) {
      this.client.close();
    }
    this.client = null;
    this.connected = false;
    console.log('🔌 Desconectado do QNAP');
  }
}

module.exports = QnapClient;

