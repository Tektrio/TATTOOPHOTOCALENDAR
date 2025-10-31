const QnapClient = require('../lib/qnapClient');
const path = require('path');

/**
 * Serviço de gerenciamento QNAP NAS
 * Wrapper sobre QnapClient com cache de conexões
 */
class QnapService {
  constructor(db) {
    this.db = db;
    this.clients = new Map(); // Cache de clientes conectados
  }

  /**
   * Testa conexão com QNAP
   * @param {object} config - Configuração do QNAP
   * @returns {Promise<object>}
   */
  async testConnection(config) {
    const client = new QnapClient(config);
    try {
      const result = await client.connect();
      
      // Tenta listar arquivos para confirmar permissões
      try {
        await client.listFiles('/');
      } catch (error) {
        await client.disconnect();
        return { 
          success: false, 
          error: `Conectado mas sem permissão de leitura: ${error.message}` 
        };
      }
      
      await client.disconnect();
      
      return { 
        success: true, 
        message: 'Conexão bem-sucedida',
        ...result 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  /**
   * Upload de arquivo para QNAP
   * @param {string} localPath - Caminho local do arquivo
   * @param {string} fileName - Nome do arquivo
   * @param {object} config - Configuração do destino QNAP
   * @returns {Promise<string>} Caminho remoto
   */
  async uploadFile(localPath, fileName, config) {
    const client = this._getOrCreateClient(config);
    
    // Monta caminho remoto: /subFolder/fileName
    const remotePath = config.subFolder 
      ? path.posix.join(config.subFolder, fileName)
      : fileName;

    try {
      const result = await client.uploadFile(localPath, remotePath);
      return result;
    } catch (error) {
      // Remove cliente do cache em caso de erro
      this._removeClient(config);
      throw new Error(`Erro ao enviar para QNAP: ${error.message}`);
    }
  }

  /**
   * Download de arquivo do QNAP
   * @param {string} remotePath - Caminho remoto
   * @param {string} localPath - Caminho local destino
   * @param {object} config - Configuração do destino QNAP
   * @returns {Promise<string>} Caminho local
   */
  async downloadFile(remotePath, localPath, config) {
    const client = this._getOrCreateClient(config);
    
    try {
      const result = await client.downloadFile(remotePath, localPath);
      return result;
    } catch (error) {
      this._removeClient(config);
      throw new Error(`Erro ao baixar do QNAP: ${error.message}`);
    }
  }

  /**
   * Lista arquivos no QNAP
   * @param {string} remotePath - Caminho remoto
   * @param {object} config - Configuração do destino QNAP
   * @returns {Promise<array>}
   */
  async listFiles(remotePath, config) {
    const client = this._getOrCreateClient(config);
    
    try {
      return await client.listFiles(remotePath);
    } catch (error) {
      this._removeClient(config);
      throw new Error(`Erro ao listar arquivos: ${error.message}`);
    }
  }

  /**
   * Deleta arquivo no QNAP
   * @param {string} remotePath - Caminho remoto
   * @param {object} config - Configuração do destino QNAP
   * @returns {Promise<void>}
   */
  async deleteFile(remotePath, config) {
    const client = this._getOrCreateClient(config);
    
    try {
      await client.deleteFile(remotePath);
    } catch (error) {
      this._removeClient(config);
      throw new Error(`Erro ao deletar arquivo: ${error.message}`);
    }
  }

  /**
   * Obtém ou cria cliente QNAP (cache de conexões)
   * @private
   * @param {object} config 
   * @returns {QnapClient}
   */
  _getOrCreateClient(config) {
    const key = `${config.host}_${config.username}_${config.protocol}`;
    
    if (!this.clients.has(key)) {
      const client = new QnapClient(config);
      this.clients.set(key, client);
    }
    
    return this.clients.get(key);
  }

  /**
   * Remove cliente do cache
   * @private
   * @param {object} config 
   */
  _removeClient(config) {
    const key = `${config.host}_${config.username}_${config.protocol}`;
    const client = this.clients.get(key);
    
    if (client) {
      client.disconnect().catch(() => {});
      this.clients.delete(key);
    }
  }

  /**
   * Desconecta todos os clientes
   * @returns {Promise<void>}
   */
  async disconnectAll() {
    const disconnectPromises = [];
    
    for (const client of this.clients.values()) {
      disconnectPromises.push(
        client.disconnect().catch(err => {
          console.warn('Erro ao desconectar cliente QNAP:', err.message);
        })
      );
    }
    
    await Promise.all(disconnectPromises);
    this.clients.clear();
    
    console.log('🔌 Todos os clientes QNAP desconectados');
  }

  /**
   * Obtém informações de espaço (se suportado)
   * @param {object} config 
   * @returns {Promise<object|null>}
   */
  async getStorageInfo(_config) {
    // Implementação futura: obter espaço disponível no QNAP
    // Pode variar dependendo do protocolo e API disponível
    return null;
  }
}

module.exports = QnapService;

