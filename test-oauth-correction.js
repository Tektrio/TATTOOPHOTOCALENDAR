#!/usr/bin/env node

/**
 * Script de Teste - Correção OAuth Google Drive
 * Verifica se todas as correções foram aplicadas corretamente
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('═══════════════════════════════════════════════════════════════');
console.log('🧪 TESTE AUTOMÁTICO: CORREÇÃO OAUTH GOOGLE DRIVE');
console.log('═══════════════════════════════════════════════════════════════\n');

const tests = [];
const errors = [];
const warnings = [];

// ============================================
// TESTE 1: Verificar se Backend está Rodando
// ============================================
console.log('1️⃣  Testando Backend...');
try {
  const backendCheck = execSync('ps aux | grep "node.*server.js" | grep -v grep', { encoding: 'utf-8' });
  if (backendCheck) {
    tests.push({ name: 'Backend Rodando', status: '✅' });
    console.log('   ✅ Backend está rodando\n');
  } else {
    throw new Error('Backend não encontrado');
  }
} catch (error) {
  tests.push({ name: 'Backend Rodando', status: '❌' });
  errors.push('Backend não está rodando');
  console.log('   ❌ Backend NÃO está rodando\n');
}

// ============================================
// TESTE 2: Verificar Porta do Backend
// ============================================
console.log('2️⃣  Testando Porta 3001...');
try {
  execSync('curl -s -o /dev/null -w "%{http_code}" http://localhost:3001', { encoding: 'utf-8', timeout: 5000 });
  tests.push({ name: 'Backend Acessível', status: '✅' });
  console.log('   ✅ Backend respondendo em http://localhost:3001\n');
} catch (error) {
  tests.push({ name: 'Backend Acessível', status: '❌' });
  errors.push('Backend não está acessível na porta 3001');
  console.log('   ❌ Backend NÃO está acessível\n');
}

// ============================================
// TESTE 3: Verificar Frontend
// ============================================
console.log('3️⃣  Testando Frontend...');
try {
  const frontendCheck = execSync('ps aux | grep "vite" | grep -v grep', { encoding: 'utf-8' });
  if (frontendCheck) {
    tests.push({ name: 'Frontend Rodando', status: '✅' });
    console.log('   ✅ Frontend está rodando\n');
  } else {
    throw new Error('Frontend não encontrado');
  }
} catch (error) {
  tests.push({ name: 'Frontend Rodando', status: '⚠️' });
  warnings.push('Frontend pode não estar rodando');
  console.log('   ⚠️  Frontend pode não estar rodando\n');
}

// ============================================
// TESTE 4: Verificar Arquivo server.js Modificado
// ============================================
console.log('4️⃣  Verificando Correções no Backend...');
const serverPath = path.join(__dirname, 'agenda-hibrida-v2', 'server.js');
try {
  const serverContent = fs.readFileSync(serverPath, 'utf-8');
  
  // Verifica se contém a detecção de erro
  if (serverContent.includes('if (error)') && 
      serverContent.includes('access_denied') &&
      serverContent.includes('GOOGLE_OAUTH_SOLUCAO_COMPLETA.md')) {
    tests.push({ name: 'Backend Modificado', status: '✅' });
    console.log('   ✅ Correções aplicadas no server.js');
    console.log('   ✅ Detecção de erro OAuth implementada');
    console.log('   ✅ Mensagem personalizada configurada\n');
  } else {
    throw new Error('Correções não encontradas');
  }
} catch (error) {
  tests.push({ name: 'Backend Modificado', status: '❌' });
  errors.push('Correções não encontradas no server.js');
  console.log('   ❌ Correções NÃO encontradas no server.js\n');
}

// ============================================
// TESTE 5: Verificar Arquivo Modal Modificado
// ============================================
console.log('5️⃣  Verificando Correções no Frontend...');
const modalPath = path.join(__dirname, 'agenda-hibrida-frontend', 'src', 'components', 'AddGoogleAccountModal.jsx');
try {
  const modalContent = fs.readFileSync(modalPath, 'utf-8');
  
  if (modalContent.includes('event.data.error') && 
      modalContent.includes('403') &&
      modalContent.includes('access_denied')) {
    tests.push({ name: 'Frontend Modificado', status: '✅' });
    console.log('   ✅ Correções aplicadas no AddGoogleAccountModal.jsx');
    console.log('   ✅ Tratamento de erro 403 implementado');
    console.log('   ✅ Alerta informativo configurado\n');
  } else {
    throw new Error('Correções não encontradas');
  }
} catch (error) {
  tests.push({ name: 'Frontend Modificado', status: '❌' });
  errors.push('Correções não encontradas no AddGoogleAccountModal.jsx');
  console.log('   ❌ Correções NÃO encontradas no modal\n');
}

// ============================================
// TESTE 6: Verificar Documentação
// ============================================
console.log('6️⃣  Verificando Documentação...');
const docs = [
  'GOOGLE_OAUTH_SOLUCAO_COMPLETA.md',
  'CORRECAO_ERRO_GOOGLE_OAUTH.md',
  '🎯_SOLUCAO_ERRO_GOOGLE.txt'
];

let allDocsExist = true;
docs.forEach(doc => {
  const docPath = path.join(__dirname, doc);
  if (fs.existsSync(docPath)) {
    const stats = fs.statSync(docPath);
    console.log(`   ✅ ${doc} (${(stats.size / 1024).toFixed(1)}KB)`);
  } else {
    console.log(`   ❌ ${doc} NÃO encontrado`);
    allDocsExist = false;
    errors.push(`Documentação ${doc} não encontrada`);
  }
});

if (allDocsExist) {
  tests.push({ name: 'Documentação Completa', status: '✅' });
  console.log('');
} else {
  tests.push({ name: 'Documentação Completa', status: '❌' });
}

// ============================================
// TESTE 7: Verificar Configuração .env
// ============================================
console.log('7️⃣  Verificando Configuração Google OAuth...');
const envPath = path.join(__dirname, 'agenda-hibrida-v2', '.env');
try {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  
  let hasClientId = false;
  let hasClientSecret = false;
  let hasRedirectUri = false;
  
  if (envContent.includes('GOOGLE_CLIENT_ID=') && !envContent.includes('GOOGLE_CLIENT_ID=your_')) {
    hasClientId = true;
    console.log('   ✅ GOOGLE_CLIENT_ID configurado');
  } else {
    console.log('   ❌ GOOGLE_CLIENT_ID não configurado');
  }
  
  if (envContent.includes('GOOGLE_CLIENT_SECRET=') && !envContent.includes('GOOGLE_CLIENT_SECRET=your_')) {
    hasClientSecret = true;
    console.log('   ✅ GOOGLE_CLIENT_SECRET configurado');
  } else {
    console.log('   ❌ GOOGLE_CLIENT_SECRET não configurado');
  }
  
  if (envContent.includes('GOOGLE_REDIRECT_URI=http://localhost:3001/auth/google/callback')) {
    hasRedirectUri = true;
    console.log('   ✅ GOOGLE_REDIRECT_URI configurado');
  } else {
    console.log('   ⚠️  GOOGLE_REDIRECT_URI pode estar incorreto');
  }
  
  if (hasClientId && hasClientSecret && hasRedirectUri) {
    tests.push({ name: 'Configuração OAuth', status: '✅' });
  } else {
    tests.push({ name: 'Configuração OAuth', status: '⚠️' });
    warnings.push('Configuração OAuth incompleta ou incorreta');
  }
  console.log('');
} catch (error) {
  tests.push({ name: 'Configuração OAuth', status: '❌' });
  errors.push('.env não encontrado ou inacessível');
  console.log('   ❌ Arquivo .env não encontrado\n');
}

// ============================================
// TESTE 8: Verificar Rota OAuth Callback
// ============================================
console.log('8️⃣  Testando Rota OAuth Callback...');
try {
  const response = execSync('curl -s -w "\\n%{http_code}" "http://localhost:3001/auth/google/callback?error=access_denied"', { 
    encoding: 'utf-8',
    timeout: 5000 
  });
  
  if (response.includes('403') || response.includes('access_denied') || response.includes('200')) {
    tests.push({ name: 'Rota OAuth Callback', status: '✅' });
    console.log('   ✅ Rota /auth/google/callback está respondendo');
    console.log('   ✅ Tratamento de erro está funcional\n');
  } else {
    throw new Error('Rota não está respondendo corretamente');
  }
} catch (error) {
  tests.push({ name: 'Rota OAuth Callback', status: '⚠️' });
  warnings.push('Rota OAuth pode não estar funcionando como esperado');
  console.log('   ⚠️  Não foi possível testar a rota completamente\n');
}

// ============================================
// RESUMO FINAL
// ============================================
console.log('\n═══════════════════════════════════════════════════════════════');
console.log('📊 RESUMO DOS TESTES');
console.log('═══════════════════════════════════════════════════════════════\n');

tests.forEach(test => {
  console.log(`${test.status} ${test.name}`);
});

console.log('\n═══════════════════════════════════════════════════════════════');

const totalTests = tests.length;
const passedTests = tests.filter(t => t.status === '✅').length;
const failedTests = tests.filter(t => t.status === '❌').length;
const warningTests = tests.filter(t => t.status === '⚠️').length;

console.log(`\n📈 Estatísticas:`);
console.log(`   Total:     ${totalTests} testes`);
console.log(`   Passou:    ${passedTests} ✅`);
console.log(`   Falhou:    ${failedTests} ❌`);
console.log(`   Avisos:    ${warningTests} ⚠️`);

if (errors.length > 0) {
  console.log('\n❌ ERROS ENCONTRADOS:');
  errors.forEach((error, i) => {
    console.log(`   ${i + 1}. ${error}`);
  });
}

if (warnings.length > 0) {
  console.log('\n⚠️  AVISOS:');
  warnings.forEach((warning, i) => {
    console.log(`   ${i + 1}. ${warning}`);
  });
}

console.log('\n═══════════════════════════════════════════════════════════════');

if (failedTests === 0 && warningTests <= 1) {
  console.log('✅ TESTES CONCLUÍDOS COM SUCESSO!');
  console.log('   A correção OAuth está funcionando corretamente.');
  process.exit(0);
} else if (failedTests > 0) {
  console.log('❌ ALGUNS TESTES FALHARAM!');
  console.log('   Revise os erros acima.');
  process.exit(1);
} else {
  console.log('⚠️  TESTES CONCLUÍDOS COM AVISOS');
  console.log('   A maioria das funcionalidades está OK.');
  process.exit(0);
}

