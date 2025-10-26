/**
 * Serviço de autenticação OAuth2 do Google
 * Gerencia tokens de acesso e refresh para Google Calendar API
 */

const { google } = require('googleapis');
const fs = require('fs-extra');
const path = require('path');

// Configurações OAuth
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.readonly',
  'https://www.googleapis.com/auth/calendar.events.readonly'
];

const TOKEN_PATH = path.join(__dirname, '..', 'config', 'google-tokens.json');

/**
 * Cria cliente OAuth2
 * @returns {OAuth2Client}
 */
function createOAuth2Client() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback';

  if (!clientId || !clientSecret) {
    throw new Error('Credenciais do Google OAuth não configuradas. Verifique GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env');
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

/**
 * Gera URL de autorização OAuth
 * @returns {string} - URL para redirecionar o usuário
 */
function getAuthUrl() {
  const oauth2Client = createOAuth2Client();
  
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent' // Força a exibição do consent screen para obter refresh token
  });
}

/**
 * Troca código de autorização por tokens
 * @param {string} code - Código de autorização recebido do callback
 * @returns {Promise<object>} - Tokens (access_token, refresh_token, etc)
 */
async function getTokensFromCode(code) {
  const oauth2Client = createOAuth2Client();
  
  try {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  } catch (error) {
    throw new Error(`Erro ao obter tokens: ${error.message}`);
  }
}

/**
 * Salva tokens no banco de dados
 * @param {object} db - Instância do banco de dados
 * @param {object} tokens - Tokens do OAuth
 * @param {string} userId - ID do usuário (padrão: 'system')
 * @returns {Promise<void>}
 */
async function saveTokensToDb(db, tokens, userId = 'system') {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT OR REPLACE INTO google_oauth_tokens (
        user_id, access_token, refresh_token, token_type, expiry_date, scope, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(query, [
      userId,
      tokens.access_token,
      tokens.refresh_token,
      tokens.token_type || 'Bearer',
      tokens.expiry_date,
      tokens.scope,
      new Date().toISOString()
    ], (err) => {
      if (err) {
        reject(err);
      } else {
        console.log('✅ Tokens salvos no banco de dados');
        resolve();
      }
    });
  });
}

/**
 * Carrega tokens do banco de dados
 * @param {object} db - Instância do banco de dados
 * @param {string} userId - ID do usuário (padrão: 'system')
 * @returns {Promise<object|null>} - Tokens ou null se não existir
 */
async function loadTokensFromDb(db, userId = 'system') {
  return new Promise((resolve, reject) => {
    db.get(
      'SELECT * FROM google_oauth_tokens WHERE user_id = ? ORDER BY updated_at DESC LIMIT 1',
      [userId],
      (err, row) => {
        if (err) {
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          resolve({
            access_token: row.access_token,
            refresh_token: row.refresh_token,
            token_type: row.token_type,
            expiry_date: row.expiry_date,
            scope: row.scope
          });
        }
      }
    );
  });
}

/**
 * Salva tokens em arquivo (backup)
 * @param {object} tokens - Tokens do OAuth
 * @returns {Promise<void>}
 */
async function saveTokensToFile(tokens) {
  try {
    await fs.ensureDir(path.dirname(TOKEN_PATH));
    await fs.writeJson(TOKEN_PATH, tokens, { spaces: 2 });
    console.log('✅ Tokens salvos em arquivo');
  } catch (error) {
    console.error('⚠️  Erro ao salvar tokens em arquivo:', error.message);
  }
}

/**
 * Carrega tokens de arquivo (fallback)
 * @returns {Promise<object|null>} - Tokens ou null
 */
async function loadTokensFromFile() {
  try {
    if (await fs.pathExists(TOKEN_PATH)) {
      return await fs.readJson(TOKEN_PATH);
    }
    return null;
  } catch (error) {
    console.error('⚠️  Erro ao carregar tokens de arquivo:', error.message);
    return null;
  }
}

/**
 * Obtém cliente OAuth autenticado
 * @param {object} db - Instância do banco de dados
 * @param {string} userId - ID do usuário
 * @returns {Promise<OAuth2Client>}
 */
async function getAuthenticatedClient(db, userId = 'system') {
  const oauth2Client = createOAuth2Client();
  
  // Tentar carregar tokens do banco
  let tokens = await loadTokensFromDb(db, userId);
  
  // Fallback para arquivo
  if (!tokens) {
    tokens = await loadTokensFromFile();
  }
  
  if (!tokens) {
    throw new Error('Nenhum token encontrado. Execute o fluxo de autorização primeiro.');
  }
  
  oauth2Client.setCredentials(tokens);
  
  // Configurar refresh automático
  oauth2Client.on('tokens', async (newTokens) => {
    console.log('🔄 Tokens renovados automaticamente');
    
    // Mesclar com tokens existentes (refresh_token pode não vir sempre)
    const updatedTokens = { ...tokens, ...newTokens };
    
    // Salvar tokens atualizados
    await saveTokensToDb(db, updatedTokens, userId);
    await saveTokensToFile(updatedTokens);
  });
  
  return oauth2Client;
}

/**
 * Revoga tokens de acesso
 * @param {object} db - Instância do banco de dados
 * @param {string} userId - ID do usuário
 * @returns {Promise<void>}
 */
async function revokeTokens(db, userId = 'system') {
  const oauth2Client = createOAuth2Client();
  const tokens = await loadTokensFromDb(db, userId);
  
  if (tokens && tokens.access_token) {
    try {
      await oauth2Client.revokeToken(tokens.access_token);
      console.log('✅ Tokens revogados com sucesso');
    } catch (error) {
      console.error('⚠️  Erro ao revogar tokens:', error.message);
    }
  }
  
  // Remover do banco
  return new Promise((resolve, reject) => {
    db.run(
      'DELETE FROM google_oauth_tokens WHERE user_id = ?',
      [userId],
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
}

/**
 * Verifica se o usuário está autenticado
 * @param {object} db - Instância do banco de dados
 * @param {string} userId - ID do usuário
 * @returns {Promise<boolean>}
 */
async function isAuthenticated(db, userId = 'system') {
  const tokens = await loadTokensFromDb(db, userId);
  return tokens !== null;
}

/**
 * Obtém informações do token
 * @param {object} db - Instância do banco de dados
 * @param {string} userId - ID do usuário
 * @returns {Promise<object|null>}
 */
async function getTokenInfo(db, userId = 'system') {
  const tokens = await loadTokensFromDb(db, userId);
  
  if (!tokens) {
    return null;
  }
  
  const now = Date.now();
  const expiresIn = tokens.expiry_date ? Math.floor((tokens.expiry_date - now) / 1000) : null;
  const isExpired = expiresIn ? expiresIn <= 0 : false;
  
  return {
    hasAccessToken: !!tokens.access_token,
    hasRefreshToken: !!tokens.refresh_token,
    expiresIn: expiresIn,
    isExpired: isExpired,
    scope: tokens.scope
  };
}

module.exports = {
  createOAuth2Client,
  getAuthUrl,
  getTokensFromCode,
  saveTokensToDb,
  loadTokensFromDb,
  saveTokensToFile,
  loadTokensFromFile,
  getAuthenticatedClient,
  revokeTokens,
  isAuthenticated,
  getTokenInfo
};
