const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

async function createTestFolder() {
  try {
    console.log('🔄 Iniciando teste de criação de pasta no Google Drive...\n');
    
    // Ler tokens
    const tokensPath = path.join(__dirname, 'tokens.json');
    if (!fs.existsSync(tokensPath)) {
      console.error('❌ Arquivo tokens.json não encontrado!');
      console.log('💡 Por favor, autentique o Google Drive através do app primeiro.');
      return;
    }
    
    const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
    console.log('✅ Tokens carregados com sucesso');
    
    // Configurar OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID || '435554447869-81mao21m5u594r5uimqh169c4n12lhc4.apps.googleusercontent.com',
      process.env.GOOGLE_CLIENT_SECRET || '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',
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback'
    );
    
    oauth2Client.setCredentials(tokens);
    console.log('✅ OAuth2 configurado\n');
    
    // Criar cliente do Drive
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    console.log('✅ Cliente do Google Drive inicializado\n');
    
    // Criar pasta principal
    console.log('📁 Criando pasta principal "Agenda Híbrida - Portfólio"...');
    const mainFolderMetadata = {
      name: 'Agenda Híbrida - Portfólio',
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Portfolio de tatuagens e trabalhos artísticos'
    };
    
    const mainFolder = await drive.files.create({
      requestBody: mainFolderMetadata,
      fields: 'id, name, webViewLink'
    });
    
    console.log('✅ Pasta principal criada!');
    console.log('   📛 Nome:', mainFolder.data.name);
    console.log('   🆔 ID:', mainFolder.data.id);
    console.log('   🔗 Link:', mainFolder.data.webViewLink);
    console.log('');
    
    // Criar subpastas
    const subfolders = [
      { name: 'Trabalhos Finalizados', description: 'Fotos finais de tatuagens concluídas' },
      { name: 'Desenhos e Projetos', description: 'Sketches e designs aprovados' },
      { name: 'Referências de Clientes', description: 'Imagens de referência fornecidas pelos clientes' },
      { name: 'Portfólio Instagram', description: 'Conteúdo pronto para redes sociais' }
    ];
    
    console.log('📂 Criando subpastas...\n');
    
    for (const subfolder of subfolders) {
      const subfolderMetadata = {
        name: subfolder.name,
        mimeType: 'application/vnd.google-apps.folder',
        description: subfolder.description,
        parents: [mainFolder.data.id]
      };
      
      const createdSubfolder = await drive.files.create({
        requestBody: subfolderMetadata,
        fields: 'id, name, webViewLink'
      });
      
      console.log(`   ✅ ${createdSubfolder.data.name}`);
      console.log(`      🆔 ID: ${createdSubfolder.data.id}`);
      console.log(`      🔗 ${createdSubfolder.data.webViewLink}\n`);
    }
    
    console.log('\n🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ Estrutura de pastas criada no Google Drive:');
    console.log('   📁 Agenda Híbrida - Portfólio');
    console.log('      ├── 📂 Trabalhos Finalizados');
    console.log('      ├── 📂 Desenhos e Projetos');
    console.log('      ├── 📂 Referências de Clientes');
    console.log('      └── 📂 Portfólio Instagram');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('🌐 Acesse agora no navegador:');
    console.log(`   ${mainFolder.data.webViewLink}\n`);
    
    return mainFolder.data;
  } catch (error) {
    console.error('\n❌ ERRO:', error.message);
    if (error.response) {
      console.error('📋 Detalhes:', error.response.data);
    }
    throw error;
  }
}

// Executar teste
createTestFolder()
  .then(() => {
    console.log('✅ Script finalizado com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script finalizado com erro:', error.message);
    process.exit(1);
  });

