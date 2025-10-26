const { google } = require('googleapis');
const fs = require('fs-extra');

async function testGoogleDriveConnection() {
  console.log('🔍 Testando conexão com Google Drive...\n');

  try {
    // 1. Verificar se o arquivo tokens.json existe
    if (!fs.existsSync('./tokens.json')) {
      console.error('❌ Arquivo tokens.json não encontrado!');
      console.log('   Execute a autenticação primeiro: http://localhost:3001/auth/google\n');
      return false;
    }
    console.log('✅ Arquivo tokens.json encontrado');

    // 2. Carregar tokens
    const tokens = fs.readJsonSync('./tokens.json');
    console.log('✅ Tokens carregados');
    console.log(`   - Access Token: ${tokens.access_token ? 'Presente' : 'Ausente'}`);
    console.log(`   - Refresh Token: ${tokens.refresh_token ? 'Presente' : 'Ausente'}`);
    console.log(`   - Token expira em: ${new Date(tokens.expiry_date).toLocaleString('pt-BR')}`);
    
    // 3. Verificar se o token está expirado
    const now = Date.now();
    const expired = tokens.expiry_date < now;
    if (expired) {
      console.log('⚠️  Token expirado, mas refresh_token disponível');
    } else {
      console.log('✅ Token válido');
    }

    // 4. Configurar OAuth2 Client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID || '435554447869-81mao21m5u594r5uimqh169c4n12lhc4.apps.googleusercontent.com',
      process.env.GOOGLE_CLIENT_SECRET || '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',
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3001/auth/google/callback'
    );
    oauth2Client.setCredentials(tokens);
    console.log('✅ OAuth2 Client configurado');

    // 5. Criar cliente do Google Drive
    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    console.log('✅ Cliente Google Drive criado');

    // 6. Testar conexão - buscar informações da conta
    console.log('\n📊 Testando acesso à API...');
    const aboutResponse = await drive.about.get({
      fields: 'storageQuota, user'
    });
    
    console.log('✅ Conexão com Google Drive bem-sucedida!');
    console.log('\n👤 Informações da conta:');
    console.log(`   - Nome: ${aboutResponse.data.user.displayName}`);
    console.log(`   - Email: ${aboutResponse.data.user.emailAddress}`);
    
    const quota = aboutResponse.data.storageQuota;
    const usedGB = (quota.usage / 1024 / 1024 / 1024).toFixed(2);
    const limitGB = (quota.limit / 1024 / 1024 / 1024).toFixed(2);
    const percentage = ((quota.usage / quota.limit) * 100).toFixed(1);
    
    console.log(`\n💾 Armazenamento:`);
    console.log(`   - Usado: ${usedGB} GB`);
    console.log(`   - Total: ${limitGB} GB`);
    console.log(`   - Percentual: ${percentage}%`);

    // 7. Testar listagem de arquivos
    console.log('\n📁 Testando listagem de arquivos...');
    const filesResponse = await drive.files.list({
      pageSize: 10,
      fields: 'files(id, name, mimeType, createdTime)',
      orderBy: 'modifiedTime desc'
    });
    
    const files = filesResponse.data.files || [];
    console.log(`✅ Encontrados ${files.length} arquivos recentes`);
    
    if (files.length > 0) {
      console.log('\n📋 Últimos arquivos:');
      files.slice(0, 5).forEach((file, index) => {
        const icon = file.mimeType === 'application/vnd.google-apps.folder' ? '📁' : '📄';
        console.log(`   ${index + 1}. ${icon} ${file.name}`);
      });
    }

    // 8. Salvar tokens atualizados (caso tenham sido renovados)
    const currentTokens = oauth2Client.credentials;
    if (currentTokens.access_token !== tokens.access_token) {
      fs.writeJsonSync('./tokens.json', currentTokens);
      console.log('\n✅ Tokens atualizados e salvos');
    }

    console.log('\n✅ TESTE CONCLUÍDO COM SUCESSO!\n');
    console.log('🎉 Google Drive está conectado e funcionando perfeitamente!\n');
    
    return true;

  } catch (error) {
    console.error('\n❌ ERRO ao testar conexão com Google Drive:');
    console.error(`   Tipo: ${error.name}`);
    console.error(`   Mensagem: ${error.message}`);
    
    if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Detalhes: ${JSON.stringify(error.response.data, null, 2)}`);
    }
    
    if (error.message.includes('invalid_grant')) {
      console.log('\n💡 Solução: O token expirou. Execute a autenticação novamente:');
      console.log('   1. Acesse: http://localhost:3001/auth/google');
      console.log('   2. Faça login com sua conta Google');
      console.log('   3. Execute este teste novamente\n');
    } else if (error.message.includes('403')) {
      console.log('\n💡 Solução: Problema de permissões:');
      console.log('   1. Verifique se o app está publicado no Google Cloud Console');
      console.log('   2. Ou adicione seu email como testador');
      console.log('   3. Ou use uma conta Google Workspace\n');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.log('\n💡 Solução: Problema de conectividade:');
      console.log('   1. Verifique sua conexão com a internet');
      console.log('   2. Verifique se o firewall não está bloqueando a conexão\n');
    }
    
    console.log('\n📝 Para mais informações, consulte:');
    console.log('   - Google Drive API: https://developers.google.com/drive/api');
    console.log('   - OAuth 2.0: https://developers.google.com/identity/protocols/oauth2\n');
    
    return false;
  }
}

// Carregar variáveis de ambiente
require('dotenv').config();

// Executar teste
testGoogleDriveConnection()
  .then(success => {
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Erro fatal:', error);
    process.exit(1);
  });

