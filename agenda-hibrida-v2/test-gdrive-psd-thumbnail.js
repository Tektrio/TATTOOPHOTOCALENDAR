const fs = require('fs-extra');
const path = require('path');
const { google } = require('googleapis');
const { readPsd } = require('ag-psd');
const sharp = require('sharp');

// TESTE ESPECÍFICO: Baixar e processar PSD do Google Drive

async function testGDrivePsdThumbnail() {
  console.log('🔍 TESTE: Thumbnail de PSD do Google Drive\n');
  
  try {
    // 1. Carregar credenciais OAuth
    console.log('1️⃣ Carregando credenciais OAuth...');
    const tokenPath = path.join(__dirname, 'config', 'google-tokens.json');
    
    if (!fs.existsSync(tokenPath)) {
      console.error('❌ Arquivo google-tokens.json não encontrado!');
      return;
    }
    
    const tokens = fs.readJsonSync(tokenPath);
    console.log('✅ Tokens carregados');
    
    // 2. Configurar cliente OAuth2
    console.log('\n2️⃣ Configurando cliente Google Drive...');
    const CLIENT_ID = '563834730073-g8p2k2tjtqpgv7vmvfvbp7dcs2vhg1gr.apps.googleusercontent.com';
    const CLIENT_SECRET = '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';
    const REDIRECT_URI = 'http://localhost:3001/auth/google/callback';
    
    const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
    oauth2Client.setCredentials(tokens);
    
    const driveClient = google.drive({ version: 'v3', auth: oauth2Client });
    console.log('✅ Cliente configurado');
    
    // 3. Listar arquivos PSD na raiz do Google Drive
    console.log('\n3️⃣ Listando arquivos PSD na raiz...');
    const filesList = await driveClient.files.list({
      q: "mimeType='image/vnd.adobe.photoshop' and 'root' in parents and trashed=false",
      fields: 'files(id, name, size, mimeType)',
      pageSize: 10
    });
    
    if (!filesList.data.files || filesList.data.files.length === 0) {
      console.log('⚠️ Nenhum arquivo PSD encontrado na raiz do Google Drive');
      return;
    }
    
    console.log(`✅ Encontrados ${filesList.data.files.length} arquivos PSD:`);
    filesList.data.files.forEach((file, i) => {
      console.log(`   ${i + 1}. ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB) - ID: ${file.id}`);
    });
    
    // 4. Testar o primeiro PSD
    const testFile = filesList.data.files[0];
    console.log(`\n4️⃣ Testando: ${testFile.name}`);
    console.log(`   ID: ${testFile.id}`);
    console.log(`   Tamanho: ${(testFile.size / 1024 / 1024).toFixed(2)} MB`);
    
    // 5. Baixar arquivo temporário
    console.log('\n5️⃣ Baixando arquivo temporário...');
    const tempDir = path.join(__dirname, 'temp_downloads');
    await fs.ensureDir(tempDir);
    const tempFilePath = path.join(tempDir, `test_${testFile.name}`);
    
    const response = await driveClient.files.get({
      fileId: testFile.id,
      alt: 'media'
    }, {
      responseType: 'stream'
    });
    
    await new Promise((resolve, reject) => {
      const dest = fs.createWriteStream(tempFilePath);
      let downloaded = 0;
      const totalSize = parseInt(testFile.size);
      
      response.data
        .on('data', (chunk) => {
          downloaded += chunk.length;
          const percent = ((downloaded / totalSize) * 100).toFixed(1);
          process.stdout.write(`\r   Progresso: ${percent}% (${(downloaded / 1024 / 1024).toFixed(2)} MB / ${(totalSize / 1024 / 1024).toFixed(2)} MB)`);
        })
        .on('end', () => {
          console.log('\n✅ Download concluído');
          resolve();
        })
        .on('error', reject)
        .pipe(dest);
    });
    
    // 6. Extrair thumbnail do PSD
    console.log('\n6️⃣ Extraindo thumbnail do PSD...');
    const psdBuffer = await fs.readFile(tempFilePath);
    console.log(`   Buffer lido: ${(psdBuffer.length / 1024 / 1024).toFixed(2)} MB`);
    
    console.log('   Fazendo parse do PSD...');
    const psd = readPsd(psdBuffer, {
      skipCompositeImageData: true,
      skipLayerImageData: true,
      skipThumbnail: false,
      skipLayerThumbnails: true
    });
    
    console.log('   ✅ Parse concluído');
    
    // 7. Verificar thumbnail
    console.log('\n7️⃣ Verificando thumbnail embutido...');
    if (psd.thumbnail) {
      console.log(`   ✅ THUMBNAIL ENCONTRADO!`);
      console.log(`   Dimensões: ${psd.thumbnail.width} x ${psd.thumbnail.height} px`);
      console.log(`   Canvas: ${psd.width} x ${psd.height} px`);
      
      // 8. Gerar thumbnail com Sharp
      console.log('\n8️⃣ Gerando thumbnail com Sharp...');
      const thumbnailDir = path.join(__dirname, 'psd_thumbnails_cache');
      await fs.ensureDir(thumbnailDir);
      const thumbnailPath = path.join(thumbnailDir, `test_thumb_${testFile.id}.png`);
      
      await sharp(psd.thumbnail.canvas.toBuffer('image/png'))
        .resize(300, 300, { 
          fit: 'cover',
          position: 'center'
        })
        .png({ quality: 80, compressionLevel: 9 })
        .toFile(thumbnailPath);
      
      console.log(`   ✅ Thumbnail gerado: ${thumbnailPath}`);
      console.log(`   Tamanho: ${(fs.statSync(thumbnailPath).size / 1024).toFixed(2)} KB`);
      
    } else {
      console.log(`   ❌ SEM THUMBNAIL EMBUTIDO!`);
      console.log(`   Este PSD foi salvo sem "Maximizar Compatibilidade"`);
      
      if (psd.imageData) {
        console.log(`   ⚠️ Imagem composta disponível: ${psd.width} x ${psd.height} px`);
        console.log(`   ⚠️ Usar imageData para arquivos grandes pode travar!`);
      }
    }
    
    // 9. Limpar arquivo temporário
    console.log('\n9️⃣ Limpando arquivos temporários...');
    await fs.remove(tempFilePath);
    console.log('   ✅ Arquivo temporário removido');
    
    console.log('\n✅ ✅ ✅ TESTE CONCLUÍDO COM SUCESSO! ✅ ✅ ✅');
    
  } catch (error) {
    console.error('\n❌ ❌ ❌ ERRO NO TESTE! ❌ ❌ ❌');
    console.error(`Tipo: ${error.name}`);
    console.error(`Mensagem: ${error.message}`);
    console.error(`Stack: ${error.stack}`);
  }
}

// Executar teste
testGDrivePsdThumbnail();

