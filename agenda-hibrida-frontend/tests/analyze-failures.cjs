const fs = require('fs');

console.log('📊 Analisando resultados dos testes E2E...\n');

// Verificar se o arquivo existe
if (!fs.existsSync('baseline-tests.log')) {
  console.error('❌ Arquivo baseline-tests.log não encontrado!');
  process.exit(1);
}

const log = fs.readFileSync('baseline-tests.log', 'utf8');

// Extrair estatísticas principais
const passedMatch = log.match(/(\d+) passed/);
const failedMatch = log.match(/(\d+) failed/);
const skippedMatch = log.match(/(\d+) skipped/);

// Extrair causas de falha
const timeoutErrors = (log.match(/Timeout \d+ms exceeded/g) || []).length;
const selectorErrors = (log.match(/waiting for selector/g) || []).length;
const connectionErrors = (log.match(/ECONNREFUSED|ERR_CONNECTION_REFUSED/g) || []).length;
const locatorErrors = (log.match(/Locator\.click: Error: strict mode violation/g) || []).length;

// Contar erros por tipo de teste
const navigationErrors = (log.match(/01-navigation\.spec\.js.*failed/gi) || []).length;
const clientsErrors = (log.match(/02-clients\.spec\.js.*failed/gi) || []).length;
const appointmentsErrors = (log.match(/03-appointments\.spec\.js.*failed/gi) || []).length;
const integrationErrors = (log.match(/04-integration-flow\.spec\.js.*failed/gi) || []).length;
const googleSyncErrors = (log.match(/05-google-sync\.spec\.js.*failed/gi) || []).length;
const importErrors = (log.match(/06-import-preview\.spec\.js.*failed/gi) || []).length;
const dragDropErrors = (log.match(/07-drag-and-drop\.spec\.js.*failed/gi) || []).length;

const passed = passedMatch ? parseInt(passedMatch[1]) : 0;
const failed = failedMatch ? parseInt(failedMatch[1]) : 0;
const skipped = skippedMatch ? parseInt(skippedMatch[1]) : 0;
const total = passed + failed + skipped;

console.log('═══════════════════════════════════════════════════════════');
console.log('                  ANÁLISE BASELINE');
console.log('═══════════════════════════════════════════════════════════\n');

console.log('📈 ESTATÍSTICAS GERAIS:');
console.log(`   Total de testes: ${total}`);
console.log(`   ✅ Passaram: ${passed} (${total > 0 ? Math.round(passed/total*100) : 0}%)`);
console.log(`   ❌ Falharam: ${failed} (${total > 0 ? Math.round(failed/total*100) : 0}%)`);
console.log(`   ⏭️  Pulados: ${skipped} (${total > 0 ? Math.round(skipped/total*100) : 0}%)`);

console.log('\n🔍 CAUSAS PRINCIPAIS DE FALHA:');
console.log(`   ⏱️  Timeouts: ${timeoutErrors}`);
console.log(`   🎯 Seletores não encontrados: ${selectorErrors}`);
console.log(`   🔌 Erros de conexão: ${connectionErrors}`);
console.log(`   📍 Erros de locator (strict mode): ${locatorErrors}`);

console.log('\n📁 FALHAS POR SUÍTE:');
console.log(`   01-navigation.spec.js: ${navigationErrors} falhas`);
console.log(`   02-clients.spec.js: ${clientsErrors} falhas`);
console.log(`   03-appointments.spec.js: ${appointmentsErrors} falhas`);
console.log(`   04-integration-flow.spec.js: ${integrationErrors} falhas`);
console.log(`   05-google-sync.spec.js: ${googleSyncErrors} falhas`);
console.log(`   06-import-preview.spec.js: ${importErrors} falhas`);
console.log(`   07-drag-and-drop.spec.js: ${dragDropErrors} falhas`);

console.log('\n═══════════════════════════════════════════════════════════');

const analysis = {
  total,
  passed,
  failed,
  skipped,
  percentages: {
    passed: total > 0 ? Math.round(passed/total*100) : 0,
    failed: total > 0 ? Math.round(failed/total*100) : 0,
    skipped: total > 0 ? Math.round(skipped/total*100) : 0
  },
  errors: {
    timeouts: timeoutErrors,
    selectors: selectorErrors,
    connections: connectionErrors,
    locators: locatorErrors
  },
  failuresBySuite: {
    navigation: navigationErrors,
    clients: clientsErrors,
    appointments: appointmentsErrors,
    integration: integrationErrors,
    googleSync: googleSyncErrors,
    import: importErrors,
    dragDrop: dragDropErrors
  }
};

fs.writeFileSync('baseline-analysis.json', JSON.stringify(analysis, null, 2));
console.log('\n✅ Análise salva em baseline-analysis.json\n');

// Identificar problema principal
console.log('🎯 RECOMENDAÇÕES:');
if (connectionErrors > failed * 0.5) {
  console.log('   ⚠️  PROBLEMA PRINCIPAL: Servidores não estão rodando!');
  console.log('   💡 SOLUÇÃO: Configurar Playwright webServer (FASE 1)');
} else if (selectorErrors > failed * 0.3) {
  console.log('   ⚠️  PROBLEMA PRINCIPAL: Seletores CSS desatualizados');
  console.log('   💡 SOLUÇÃO: Adicionar data-testid nos componentes (FASE 4)');
} else if (timeoutErrors > failed * 0.3) {
  console.log('   ⚠️  PROBLEMA PRINCIPAL: Componentes demoram muito a carregar');
  console.log('   💡 SOLUÇÃO: Aumentar timeouts (FASE 6)');
}

if (skipped > 0) {
  console.log(`   ⚠️  ${skipped} testes pulados - faltam fixtures ou Google Calendar`);
  console.log('   💡 SOLUÇÃO: Criar fixtures (FASE 2) e configurar Google (FASE 7)');
}

console.log('\n');

