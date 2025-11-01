#!/usr/bin/env node

/**
 * Script para verificar status das credenciais OAuth do Google
 * Ajuda a diagnosticar problemas de conexão
 */

const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════════');
console.log('🔍 VERIFICANDO CONFIGURAÇÃO OAUTH DO GOOGLE');
console.log('═══════════════════════════════════════════════════════════════\n');

// Verificar arquivo de credenciais
const credentialsPath = path.join(__dirname, 'google-credentials.json');
let credentials = null;

if (fs.existsSync(credentialsPath)) {
  console.log('✅ Arquivo de credenciais encontrado');
  credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
} else {
  console.log('❌ Arquivo google-credentials.json NÃO encontrado');
  process.exit(1);
}

// Verificar dados das credenciais
console.log('\n📋 INFORMAÇÕES DO PROJETO:\n');

const web = credentials.web || {};

console.log(`   Project ID: ${web.project_id || '❌ Não configurado'}`);
console.log(`   Client ID: ${web.client_id ? '✅ Configurado (' + web.client_id.substring(0, 20) + '...)' : '❌ Não configurado'}`);
console.log(`   Client Secret: ${web.client_secret ? '✅ Configurado (oculto)' : '❌ Não configurado'}`);

console.log('\n🔗 REDIRECT URIs:\n');
if (web.redirect_uris && web.redirect_uris.length > 0) {
  web.redirect_uris.forEach((uri, index) => {
    console.log(`   ${index + 1}. ${uri}`);
  });
} else {
  console.log('   ❌ Nenhuma URI configurada');
}

// Verificar tokens salvos
console.log('\n🔑 STATUS DOS TOKENS:\n');

const tokensPath = path.join(__dirname, 'config', 'google-tokens-multi.json');
if (fs.existsSync(tokensPath)) {
  const tokens = JSON.parse(fs.readFileSync(tokensPath, 'utf8'));
  const accounts = tokens.accounts || {};
  const accountCount = Object.keys(accounts).length;
  
  if (accountCount > 0) {
    console.log(`   ✅ ${accountCount} conta(s) conectada(s):`);
    Object.entries(accounts).forEach(([email, data]) => {
      console.log(`      • ${email}`);
      if (data.expiry_date) {
        const expiryDate = new Date(data.expiry_date);
        const now = new Date();
        const isExpired = expiryDate < now;
        console.log(`        Token: ${isExpired ? '⚠️ EXPIRADO' : '✅ Válido'}`);
        console.log(`        Expira em: ${expiryDate.toLocaleString('pt-BR')}`);
      }
    });
  } else {
    console.log('   ⚠️ Nenhuma conta conectada ainda');
  }
} else {
  console.log('   ℹ️ Arquivo de tokens não existe (será criado na primeira conexão)');
}

// Link direto para configuração
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('🔧 RESOLVER ERRO 403');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('Se você está vendo erro 403 (access_denied), siga estes passos:\n');

console.log('1️⃣ Acesse este link no navegador:\n');
console.log(`   🔗 https://console.cloud.google.com/apis/credentials/consent?project=${web.project_id}\n`);

console.log('2️⃣ Faça login com a conta que criou o projeto\n');

console.log('3️⃣ Na seção "Usuários de teste", clique em "+ ADD USERS"\n');

console.log('4️⃣ Digite SEU EMAIL do Google e clique em "SAVE"\n');

console.log('5️⃣ Aguarde 2-3 minutos e tente conectar novamente\n');

console.log('═══════════════════════════════════════════════════════════════');
console.log('📚 DOCUMENTAÇÃO COMPLETA');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log('Para mais detalhes, consulte estes arquivos:\n');
console.log('   • RESOLVER_ERRO_403_AGORA.md (guia rápido)');
console.log('   • GOOGLE_OAUTH_SOLUCAO_COMPLETA.md (guia completo)\n');

console.log('═══════════════════════════════════════════════════════════════\n');


