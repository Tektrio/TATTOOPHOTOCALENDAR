const { google } = require('googleapis');
const fs = require('fs-extra');

async function testGoogleDriveAPI() {
  try {
    // Carregar tokens
    const tokens = fs.readJsonSync('./agenda-hibrida-v2/tokens.json');
    
    // Configurar OAuth
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3001/auth/google/callback'
    );
    
    oauth2Client.setCredentials(tokens);
    
    // Criar cliente do Drive
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    // ID da pasta Luiz_Lopes
    const folderId = '1HI9dc3mVSv6QbAqWPRDVDPi1DtgHkz0C';
    
    console.log('🔍 Buscando arquivos na pasta Luiz_Lopes...\n');
    
    const response = await drive.files.list({
      pageSize: 100,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime, webViewLink, thumbnailLink, size, iconLink, parents)',
      orderBy: 'folder,modifiedTime desc',
      q: `trashed=false and '${folderId}' in parents`
    });
    
    const files = response.data.files || [];
    
    console.log(`✅ Total de arquivos encontrados: ${files.length}\n`);
    
    files.forEach((file, index) => {
      console.log(`${index + 1}. ${file.name}`);
      console.log(`   ID: ${file.id}`);
      console.log(`   Tipo: ${file.mimeType}`);
      console.log(`   Tamanho: ${file.size || 'N/A'} bytes`);
      console.log(`   Thumbnail: ${file.thumbnailLink ? 'Sim' : 'Não'}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

testGoogleDriveAPI();

