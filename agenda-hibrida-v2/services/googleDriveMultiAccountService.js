const { google } = require('googleapis');
const fs = require('fs-extra');
const path = require('path');
const { assignColor } = require('../utils/colorAssigner');

/**
 * Serviço de gerenciamento de múltiplas contas Google Drive
 * Suporta OAuth para até 4 contas simultâneas com cores diferentes
 */
class GoogleDriveMultiAccountService {
  constructor(db) {
    this.db = db;
    this.oauthClients = new Map(); // Cache de clientes OAuth
  }

  /**
   * Inicia processo de adicionar nova conta Google Drive
   * @param {string} name - Nome da conta (ex: "Backup", "Compartilhada")
   * @param {number} accountNumber - Número da conta (1, 2, 3, 4...)
   * @returns {Promise<object>} { authUrl, accountNumber, suggestedColor, suggestedName }
   */
  async addAccount(name, accountNumber) {
    // Atribui cor automaticamente
    const color = assignColor(accountNumber);

    // Cria OAuth2 client
    const oauth2Client = this._createOAuthClient();
    
    // Gera URL de autorização
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.appdata'
      ],
      prompt: 'consent' // Força refresh token
    });

    console.log(`🔐 OAuth URL gerada para conta "${name}"`);

    return {
      authUrl,
      accountNumber,
      suggestedColor: color,
      suggestedName: name
    };
  }

  /**
   * Completa OAuth e salva tokens no destino
   * @param {string} code - Código de autorização do OAuth
   * @param {number} destinationId - ID do destino no banco
   * @returns {Promise<object>}
   */
  async completeOAuth(code, destinationId) {
    const oauth2Client = this._createOAuthClient();
    
    try {
      // Troca código por tokens
      const { tokens } = await oauth2Client.getToken(code);
      
      console.log('✅ Tokens OAuth obtidos com sucesso');

      // Obtém informações do usuário
      oauth2Client.setCredentials(tokens);
      const drive = google.drive({ version: 'v3', auth: oauth2Client });
      const aboutResponse = await drive.about.get({ fields: 'user,storageQuota' });
      
      const userInfo = {
        email: aboutResponse.data.user.emailAddress,
        displayName: aboutResponse.data.user.displayName,
        storageQuota: aboutResponse.data.storageQuota
      };

      console.log(`📧 Conta conectada: ${userInfo.email}`);

      // Busca config atual do destino
      const destination = await this._getDestination(destinationId);
      const config = JSON.parse(destination.config || '{}');
      
      // Adiciona tokens e info do usuário
      config.tokens = tokens;
      config.userInfo = userInfo;

      // Atualiza no banco
      await this._updateDestinationConfig(destinationId, config);

      return { 
        success: true, 
        accountId: destinationId,
        userInfo 
      };
    } catch (error) {
      throw new Error(`Erro ao completar OAuth: ${error.message}`);
    }
  }

  /**
   * Upload de arquivo para conta específica
   * @param {string} localPath - Caminho local do arquivo
   * @param {string} fileName - Nome do arquivo
   * @param {object} config - Configuração com tokens
   * @returns {Promise<string>} ID do arquivo no Google Drive
   */
  async uploadFile(localPath, fileName, config) {
    if (!config.tokens) {
      throw new Error('Conta não autenticada - tokens ausentes');
    }

    const oauth2Client = this._createOAuthClient();
    oauth2Client.setCredentials(config.tokens);

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const fileMetadata = {
      name: fileName,
      parents: config.folderId ? [config.folderId] : []
    };

    const media = {
      body: fs.createReadStream(localPath)
    };

    try {
      console.log(`📤 Enviando ${fileName} para Google Drive...`);

      const response = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id,name,size,mimeType'
      });

      console.log(`✅ Upload concluído: ${response.data.id}`);

      return response.data.id;
    } catch (error) {
      // Tenta refresh token se expirado
      if (error.code === 401 || error.message.includes('invalid_grant')) {
        console.log('🔄 Token expirado, renovando...');
        const newConfig = await this._refreshTokens(oauth2Client, config);
        
        // Retry com novos tokens
        return this.uploadFile(localPath, fileName, newConfig);
      }
      
      throw new Error(`Erro no upload: ${error.message}`);
    }
  }

  /**
   * Download de arquivo do Google Drive
   * @param {string} fileId - ID do arquivo no Drive
   * @param {string} localPath - Caminho local destino
   * @param {object} config - Configuração com tokens
   * @returns {Promise<string>} Caminho local
   */
  async downloadFile(fileId, localPath, config) {
    if (!config.tokens) {
      throw new Error('Conta não autenticada');
    }

    const oauth2Client = this._createOAuthClient();
    oauth2Client.setCredentials(config.tokens);

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
      const response = await drive.files.get(
        { fileId, alt: 'media' },
        { responseType: 'stream' }
      );

      await fs.ensureDir(path.dirname(localPath));

      return new Promise((resolve, reject) => {
        const dest = fs.createWriteStream(localPath);
        response.data
          .on('end', () => {
            console.log(`✅ Download concluído: ${localPath}`);
            resolve(localPath);
          })
          .on('error', reject)
          .pipe(dest);
      });
    } catch (error) {
      if (error.code === 401) {
        const newConfig = await this._refreshTokens(oauth2Client, config);
        return this.downloadFile(fileId, localPath, newConfig);
      }
      throw new Error(`Erro no download: ${error.message}`);
    }
  }

  /**
   * Lista arquivos na conta
   * @param {object} config - Configuração com tokens
   * @param {string} [folderId] - ID da pasta (opcional)
   * @returns {Promise<array>}
   */
  async listFiles(config, folderId = null) {
    if (!config.tokens) {
      throw new Error('Conta não autenticada');
    }

    const oauth2Client = this._createOAuthClient();
    oauth2Client.setCredentials(config.tokens);

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    try {
      const query = folderId ? `'${folderId}' in parents` : undefined;
      
      const response = await drive.files.list({
        q: query,
        fields: 'files(id, name, size, mimeType, createdTime)',
        pageSize: 100
      });

      return response.data.files || [];
    } catch (error) {
      if (error.code === 401) {
        const newConfig = await this._refreshTokens(oauth2Client, config);
        return this.listFiles(newConfig, folderId);
      }
      throw new Error(`Erro ao listar arquivos: ${error.message}`);
    }
  }

  /**
   * Renova tokens expirados automaticamente
   * @private
   * @param {OAuth2Client} oauth2Client 
   * @param {object} config 
   * @returns {Promise<object>} Nova configuração com tokens atualizados
   */
  async _refreshTokens(oauth2Client, config) {
    try {
      console.log('🔄 Renovando tokens OAuth...');
      
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Atualiza config
      config.tokens = credentials;
      
      // TODO: Atualizar no banco também
      // Isso requer saber o destination_id, que não temos aqui
      // Por enquanto, apenas retornamos o config atualizado
      
      console.log('✅ Tokens renovados com sucesso');
      
      return config;
    } catch (error) {
      throw new Error(`Erro ao renovar tokens: ${error.message}`);
    }
  }

  /**
   * Cria cliente OAuth2
   * @private
   * @returns {OAuth2Client}
   */
  _createOAuthClient() {
    try {
      const credentials = require('../google-credentials.json');
      
      return new google.auth.OAuth2(
        credentials.web.client_id,
        credentials.web.client_secret,
        credentials.web.redirect_uris[0]
      );
    } catch (error) {
      throw new Error('Arquivo google-credentials.json não encontrado ou inválido');
    }
  }

  /**
   * Obtém destino do banco
   * @private
   */
  async _getDestination(id) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM sync_destinations WHERE id = ?', 
        [id], 
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  /**
   * Atualiza configuração do destino
   * @private
   */
  async _updateDestinationConfig(id, config) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'UPDATE sync_destinations SET config = ? WHERE id = ?',
        [JSON.stringify(config), id],
        (err) => {
          if (err) reject(err);
          else resolve();
        }
      );
    });
  }

  /**
   * Revoga acesso de uma conta
   * @param {object} config - Configuração com tokens
   * @returns {Promise<boolean>}
   */
  async revokeAccess(config) {
    if (!config.tokens) {
      return false;
    }

    const oauth2Client = this._createOAuthClient();
    oauth2Client.setCredentials(config.tokens);

    try {
      await oauth2Client.revokeCredentials();
      console.log('✅ Acesso revogado');
      return true;
    } catch (error) {
      console.error('Erro ao revogar acesso:', error.message);
      return false;
    }
  }
}

module.exports = GoogleDriveMultiAccountService;

