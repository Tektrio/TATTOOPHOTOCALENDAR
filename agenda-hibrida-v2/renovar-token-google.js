#!/usr/bin/env node

/**
 * Script para Renovar Token do Google usando Refresh Token
 * Tenta renovar o access_token usando o refresh_token existente
 */

const { google } = require('googleapis');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 3001;
const TOKEN_PATH = path.join(__dirname, 'tokens.json');

console.log('\n🔄 Script de Renovação de Token Google\n');
console.log('═'.repeat(60));

async function renovarToken() {
  try {
    // 1. Verificar credenciais
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      console.error('\n❌ ERRO: Credenciais não configuradas no .env');
      console.log('   Configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET\n');
      return false;
    }

    console.log('\n✅ Credenciais encontradas no .env');
    console.log(`   Client ID: ${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...`);

    // 2. Carregar tokens existentes
    if (!fs.existsSync(TOKEN_PATH)) {
      console.error('\n❌ ERRO: Arquivo tokens.json não encontrado');
      console.log('   É necessário fazer autenticação completa primeiro\n');
      console.log('   Execute: node reautenticar-google.js\n');
      return false;
    }

    const tokens = fs.readJsonSync(TOKEN_PATH);
    console.log('\n✅ Tokens existentes encontrados');

    // 3. Verificar refresh_token
    if (!tokens.refresh_token) {
      console.error('\n❌ ERRO: refresh_token não encontrado');
      console.log('   É necessário fazer autenticação completa primeiro\n');
      console.log('   Execute: node reautenticar-google.js\n');
      return false;
    }

    console.log('✅ Refresh token presente');

    // 4. Criar cliente OAuth2
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `http://localhost:${PORT}/auth/google/callback`
    );

    oauth2Client.setCredentials(tokens);

    console.log('\n🔄 Tentando renovar access_token...');

    // 5. Tentar renovar o token
    try {
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      console.log('\n✅ Token renovado com sucesso!');
      
      // Mesclar novos tokens com os existentes
      const updatedTokens = {
        ...tokens,
        ...credentials
      };

      // Salvar tokens atualizados
      await fs.writeJson(TOKEN_PATH, updatedTokens, { spaces: 2 });
      console.log('✅ Novos tokens salvos em tokens.json');

      // 6. Testar conexão
      console.log('\n📋 Testando conexão com Google Calendar...');
      
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
      const response = await calendar.calendarList.list();
      
      console.log('✅ Conexão estabelecida com sucesso!');
      console.log(`   Calendários encontrados: ${response.data.items.length}`);
      
      response.data.items.forEach((cal, index) => {
        console.log(`   ${index + 1}. ${cal.summary}${cal.primary ? ' (Principal)' : ''}`);
      });

      // 7. Informações de expiração
      const expiryDate = updatedTokens.expiry_date;
      if (expiryDate) {
        const now = Date.now();
        const expiresIn = Math.floor((expiryDate - now) / 1000 / 60);
        console.log(`\n⏰ Novo token expira em: ${expiresIn} minutos`);
      }

      console.log('\n🎉 SUCESSO! Token renovado e funcionando!\n');
      console.log('═'.repeat(60));
      console.log('\n✅ Você pode usar o sistema normalmente agora.\n');
      
      return true;

    } catch (refreshError) {
      console.error('\n❌ FALHA ao renovar token');
      console.error(`   Erro: ${refreshError.message}`);
      
      if (refreshError.message.includes('invalid_grant')) {
        console.log('\n📋 O refresh_token pode estar revogado ou expirado.');
        console.log('   Você precisa fazer autenticação completa novamente.\n');
      } else if (refreshError.message.includes('invalid_client')) {
        console.log('\n📋 As credenciais OAuth podem estar incorretas.');
        console.log('   Verifique GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET no .env\n');
      } else if (refreshError.message.includes('disabled_client')) {
        console.log('\n📋 O OAuth Client está DESABILITADO no Google Cloud Console.');
        console.log('\n   SOLUÇÃO:');
        console.log('   1. Acesse: https://console.cloud.google.com/apis/credentials');
        console.log('   2. Faça login com: tattoophotocalendar@gmail.com');
        console.log('   3. Selecione o projeto');
        console.log('   4. Encontre o OAuth Client ID');
        console.log('   5. Habilite ou crie um novo\n');
      }
      
      console.log('═'.repeat(60));
      console.log('\n❌ Execute: node reautenticar-google.js\n');
      
      return false;
    }

  } catch (error) {
    console.error('\n❌ ERRO INESPERADO:', error.message);
    console.error(error);
    return false;
  }
}

// Executar
renovarToken().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('\n❌ ERRO FATAL:', error.message);
  process.exit(1);
});

