const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function createFolder() {
  try {
    // Ler tokens
    const tokensPath = path.join(__dirname, 'agenda-hibrida-v2', 'tokens.json');
    const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
    
    // Configurar OAuth2
    const oauth2Client = new google.auth.OAuth2(
      '435554447869-81mao21m5u594r5uimqh169c4n12lhc4.apps.googleusercontent.com',
      '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',
      'http://localhost:3001/auth/google/callback'
    );
    
    oauth2Client.setCredentials(tokens);
    
    // Criar cliente do Drive
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // Criar pasta
    const folderMetadata = {
      name: 'Agenda Híbrida - Teste MCP',
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Pasta de teste criada via MCP do Chrome Canary'
    };
    
    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: 'id, name, webViewLink'
    });
    
    console.log('\n✅ Pasta criada com sucesso!');
    console.log('📁 Nome:', folder.data.name);
    console.log('🆔 ID:', folder.data.id);
    console.log('🔗 Link:', folder.data.webViewLink);
    
    return folder.data;
  } catch (error) {
    console.error('❌ Erro ao criar pasta:', error.message);
    throw error;
  }
}

createFolder();

