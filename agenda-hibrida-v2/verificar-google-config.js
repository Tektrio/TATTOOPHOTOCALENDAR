#!/usr/bin/env node

/**
 * Script de Verificação da Configuração Google
 * Verifica todas as configurações necessárias para conectar com Google
 */

const fs = require('fs-extra');
const path = require('path');
require('dotenv').config();

console.log('\n🔍 Verificação de Configuração Google\n');
console.log('═'.repeat(60));

const issues = [];
const warnings = [];
const success = [];

// 1. Verificar arquivo .env
console.log('\n📋 1. Verificando arquivo .env...');
if (!fs.existsSync('.env')) {
  issues.push('❌ Arquivo .env não encontrado');
} else {
  success.push('✅ Arquivo .env existe');
}

// 2. Verificar GOOGLE_CLIENT_ID
console.log('📋 2. Verificando GOOGLE_CLIENT_ID...');
if (!process.env.GOOGLE_CLIENT_ID) {
  issues.push('❌ GOOGLE_CLIENT_ID não configurado no .env');
} else if (process.env.GOOGLE_CLIENT_ID === 'your_google_client_id_here') {
  issues.push('❌ GOOGLE_CLIENT_ID ainda está com valor padrão');
} else {
  success.push(`✅ GOOGLE_CLIENT_ID configurado`);
  console.log(`   Valor: ${process.env.GOOGLE_CLIENT_ID.substring(0, 20)}...`);
}

// 3. Verificar GOOGLE_CLIENT_SECRET
console.log('📋 3. Verificando GOOGLE_CLIENT_SECRET...');
if (!process.env.GOOGLE_CLIENT_SECRET) {
  issues.push('❌ GOOGLE_CLIENT_SECRET não configurado no .env');
} else if (process.env.GOOGLE_CLIENT_SECRET === 'your_google_client_secret_here') {
  issues.push('❌ GOOGLE_CLIENT_SECRET ainda está com valor padrão');
} else {
  success.push(`✅ GOOGLE_CLIENT_SECRET configurado`);
  console.log(`   Valor: ${process.env.GOOGLE_CLIENT_SECRET.substring(0, 10)}...`);
}

// 4. Verificar GOOGLE_REDIRECT_URI
console.log('📋 4. Verificando GOOGLE_REDIRECT_URI...');
const port = process.env.PORT || 3001;
const expectedRedirect = `http://localhost:${port}/auth/google/callback`;

if (!process.env.GOOGLE_REDIRECT_URI) {
  warnings.push(`⚠️  GOOGLE_REDIRECT_URI não configurado (usando padrão: ${expectedRedirect})`);
} else {
  success.push(`✅ GOOGLE_REDIRECT_URI configurado: ${process.env.GOOGLE_REDIRECT_URI}`);
}

// 5. Verificar arquivo tokens.json
console.log('📋 5. Verificando tokens.json...');
const tokenPath = path.join(__dirname, 'tokens.json');
if (!fs.existsSync(tokenPath)) {
  warnings.push('⚠️  tokens.json não encontrado (primeira autenticação necessária)');
} else {
  try {
    const tokens = fs.readJsonSync(tokenPath);
    const now = Date.now();
    const expiryDate = tokens.expiry_date;
    
    if (!expiryDate) {
      warnings.push('⚠️  tokens.json existe mas não tem data de expiração');
    } else if (expiryDate <= now) {
      const expiredFor = Math.floor((now - expiryDate) / 1000 / 60 / 60);
      warnings.push(`⚠️  Token expirado há ${expiredFor} horas`);
    } else {
      const expiresIn = Math.floor((expiryDate - now) / 1000 / 60);
      success.push(`✅ Token válido (expira em ${expiresIn} minutos)`);
    }
    
    if (!tokens.refresh_token) {
      warnings.push('⚠️  tokens.json não tem refresh_token (reautenticação completa necessária)');
    } else {
      success.push('✅ Refresh token presente');
    }
  } catch (error) {
    issues.push(`❌ Erro ao ler tokens.json: ${error.message}`);
  }
}

// 6. Verificar porta do servidor
console.log('📋 6. Verificando configuração de porta...');
success.push(`✅ Porta configurada: ${port}`);

// Resumo
console.log('\n═'.repeat(60));
console.log('\n📊 RESUMO DA VERIFICAÇÃO:\n');

if (success.length > 0) {
  console.log('✅ SUCESSOS:\n');
  success.forEach(item => console.log(`   ${item}`));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  AVISOS:\n');
  warnings.forEach(item => console.log(`   ${item}`));
  console.log('');
}

if (issues.length > 0) {
  console.log('❌ PROBLEMAS ENCONTRADOS:\n');
  issues.forEach(item => console.log(`   ${item}`));
  console.log('');
}

// Ações recomendadas
console.log('═'.repeat(60));
console.log('\n💡 AÇÕES RECOMENDADAS:\n');

if (issues.length > 0) {
  console.log('🔴 AÇÃO URGENTE - Problemas críticos encontrados:');
  console.log('');
  console.log('   1. Abra o Google Cloud Console:');
  console.log('      https://console.cloud.google.com/apis/credentials');
  console.log('');
  console.log('   2. Crie ou habilite um OAuth 2.0 Client ID');
  console.log('');
  console.log('   3. Configure as URIs de redirecionamento:');
  console.log(`      - ${expectedRedirect}`);
  console.log('      - http://localhost:3000/auth/google/callback');
  console.log('');
  console.log('   4. Copie Client ID e Client Secret');
  console.log('');
  console.log('   5. Atualize o arquivo .env:');
  console.log('      nano .env');
  console.log('');
  console.log('   6. Após configurar, execute:');
  console.log('      node reautenticar-google.js');
  console.log('');
} else if (warnings.length > 0) {
  console.log('🟡 AÇÃO NECESSÁRIA - Reautenticação recomendada:');
  console.log('');
  console.log('   1. Certifique-se de que o servidor está rodando:');
  console.log('      npm start');
  console.log('');
  console.log('   2. Em outro terminal, execute:');
  console.log('      node reautenticar-google.js');
  console.log('');
  console.log('   3. Siga as instruções no navegador');
  console.log('');
} else {
  console.log('🟢 TUDO CERTO!');
  console.log('');
  console.log('   Sua configuração parece estar correta.');
  console.log('   Se ainda tiver problemas de conexão, tente:');
  console.log('');
  console.log('   node reautenticar-google.js');
  console.log('');
}

console.log('═'.repeat(60));
console.log('');

// Exit code
process.exit(issues.length > 0 ? 1 : 0);

