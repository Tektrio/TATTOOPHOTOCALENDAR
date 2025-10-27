#!/usr/bin/env node

/**
 * Script de Reautenticação com Google
 * Este script abre o navegador para você reautenticar com o Google
 */

const { google } = require('googleapis');
const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

const PORT = process.env.PORT || 3001;

// Verificar credenciais
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error('\n❌ ERRO: Credenciais do Google não configuradas no .env');
  console.error('   Por favor, configure GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET\n');
  process.exit(1);
}

// Criar cliente OAuth2
const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `http://localhost:${PORT}/auth/google/callback`
);

// Verificar tokens atuais
async function checkCurrentTokens() {
  const tokenPath = path.join(__dirname, 'tokens.json');
  
  if (!fs.existsSync(tokenPath)) {
    console.log('⚠️  Nenhum token encontrado');
    return null;
  }
  
  try {
    const tokens = fs.readJsonSync(tokenPath);
    oauth2Client.setCredentials(tokens);
    
    // Verificar se token está expirado
    const now = Date.now();
    const expiryDate = tokens.expiry_date;
    
    if (!expiryDate || expiryDate <= now) {
      console.log('⚠️  Token expirado');
      
      // Tentar renovar com refresh_token
      if (tokens.refresh_token) {
        console.log('🔄 Tentando renovar token automaticamente...');
        try {
          const { credentials } = await oauth2Client.refreshAccessToken();
          await fs.writeJson(tokenPath, credentials, { spaces: 2 });
          console.log('✅ Token renovado com sucesso!');
          return credentials;
        } catch (error) {
          console.log('❌ Falha ao renovar token:', error.message);
          return null;
        }
      }
      return null;
    }
    
    console.log('✅ Token válido encontrado');
    const expiresIn = Math.floor((expiryDate - now) / 1000 / 60);
    console.log(`   Expira em: ${expiresIn} minutos`);
    return tokens;
  } catch (error) {
    console.log('❌ Erro ao verificar tokens:', error.message);
    return null;
  }
}

// Testar conexão com Google
async function testGoogleConnection() {
  try {
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const response = await calendar.calendarList.list();
    
    console.log('\n✅ Conexão com Google Calendar estabelecida!');
    console.log(`   Calendários encontrados: ${response.data.items.length}`);
    
    response.data.items.forEach((cal, index) => {
      console.log(`   ${index + 1}. ${cal.summary}${cal.primary ? ' (Principal)' : ''}`);
    });
    
    return true;
  } catch (error) {
    console.log('\n❌ Falha ao conectar com Google Calendar');
    console.log(`   Erro: ${error.message}`);
    return false;
  }
}

// Main
async function main() {
  console.log('\n🔐 Script de Reautenticação com Google\n');
  console.log('═'.repeat(50));
  
  // 1. Verificar tokens atuais
  console.log('\n📋 PASSO 1: Verificando tokens atuais...');
  const tokens = await checkCurrentTokens();
  
  if (tokens) {
    // 2. Testar conexão
    console.log('\n📋 PASSO 2: Testando conexão com Google...');
    const connected = await testGoogleConnection();
    
    if (connected) {
      console.log('\n🎉 SUCESSO! Você já está conectado ao Google.');
      console.log('   Não é necessário reautenticar.\n');
      return;
    }
  }
  
  // 3. Gerar URL de autenticação
  console.log('\n📋 PASSO 3: Gerando URL de autenticação...');
  
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/userinfo.profile'
    ]
  });
  
  console.log('\n🌐 INSTRUÇÕES PARA REAUTENTICAR:\n');
  console.log('   1. Certifique-se de que o servidor backend está rodando');
  console.log(`      (Porta ${PORT})\n`);
  console.log('   2. Abra esta URL no seu navegador:\n');
  console.log(`      ${authUrl}\n`);
  console.log('   3. Faça login com sua conta Google');
  console.log('   4. Autorize o acesso ao Calendar e Drive');
  console.log('   5. Você será redirecionado e a autenticação será concluída\n');
  
  // Tentar abrir automaticamente no navegador
  const { exec } = require('child_process');
  exec(`open "${authUrl}"`, (error) => {
    if (error) {
      console.log('⚠️  Não foi possível abrir o navegador automaticamente');
      console.log('   Por favor, copie e cole a URL acima no seu navegador\n');
    } else {
      console.log('✅ Navegador aberto! Complete o processo de autenticação.\n');
    }
  });
  
  console.log('═'.repeat(50));
  console.log('\n💡 DICA: Após autorizar, volte ao navegador para verificar o status.\n');
}

// Executar
main().catch(error => {
  console.error('\n❌ ERRO:', error.message);
  process.exit(1);
});

