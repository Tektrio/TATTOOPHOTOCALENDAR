#!/usr/bin/env node

/**
 * Script para configurar as novas credenciais do Google OAuth
 * Atualiza o arquivo .env com as credenciais criadas em 26/10/2025
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🔐 CONFIGURAÇÃO DAS NOVAS CREDENCIAIS GOOGLE OAUTH\n');
  console.log('📋 Informações das credenciais criadas em 26/10/2025:');
  console.log('   - Projeto: My First Project (polar-program-476423-i0)');
  console.log('   - Email: photocalendar25@gmail.com');
  console.log('   - Client ID: 1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com\n');

  // Verificar se o arquivo .env existe
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Arquivo .env não encontrado!');
    console.log('💡 Copie o arquivo .env.example para .env primeiro:\n');
    console.log('   cp .env.example .env\n');
    rl.close();
    process.exit(1);
  }

  console.log('📄 Arquivo .env encontrado!\n');

  // Solicitar Client Secret
  console.log('🔑 Você precisa do Client Secret do arquivo JSON que foi baixado.');
  console.log('   Procure o arquivo client_secret_*.json na pasta Downloads.\n');
  
  const clientSecret = await question('Digite o Client Secret: ');

  if (!clientSecret || clientSecret.trim() === '') {
    console.error('\n❌ Client Secret não pode estar vazio!');
    rl.close();
    process.exit(1);
  }

  // Ler arquivo .env
  let envContent = fs.readFileSync(envPath, 'utf8');

  // Atualizar credenciais
  const newClientId = '1073557089506-5hk15al23til3ab4d5rs6c27eq6opdvp.apps.googleusercontent.com';
  const newClientSecret = clientSecret.trim();
  const redirectUri = 'http://localhost:3001/auth/google/callback';

  // Fazer backup
  const backupPath = `${envPath}.backup.${Date.now()}`;
  fs.writeFileSync(backupPath, envContent);
  console.log(`\n✅ Backup criado em: ${path.basename(backupPath)}`);

  // Substituir valores
  envContent = envContent.replace(
    /GOOGLE_CLIENT_ID=.*/,
    `GOOGLE_CLIENT_ID=${newClientId}`
  );
  
  envContent = envContent.replace(
    /GOOGLE_CLIENT_SECRET=.*/,
    `GOOGLE_CLIENT_SECRET=${newClientSecret}`
  );
  
  envContent = envContent.replace(
    /GOOGLE_REDIRECT_URI=.*/,
    `GOOGLE_REDIRECT_URI=${redirectUri}`
  );

  // Salvar arquivo atualizado
  fs.writeFileSync(envPath, envContent);

  console.log('\n✅ Arquivo .env atualizado com sucesso!');
  console.log('\n📋 Configurações atualizadas:');
  console.log(`   GOOGLE_CLIENT_ID=${newClientId}`);
  console.log(`   GOOGLE_CLIENT_SECRET=${newClientSecret.substring(0, 10)}...`);
  console.log(`   GOOGLE_REDIRECT_URI=${redirectUri}`);

  console.log('\n🎯 Próximos passos:\n');
  console.log('   1. Reinicie o servidor se estiver rodando');
  console.log('   2. Execute o fluxo de autenticação OAuth:');
  console.log('      node reautenticar-google.js');
  console.log('   3. Faça login com: photocalendar25@gmail.com');
  console.log('\n   4. Para testar o Google Drive:');
  console.log('      node test-gdrive-connection.js\n');

  rl.close();
}

main().catch(error => {
  console.error('\n❌ Erro:', error.message);
  rl.close();
  process.exit(1);
});

