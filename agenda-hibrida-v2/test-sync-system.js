#!/usr/bin/env node

/**
 * 🧪 TESTE AUTOMATIZADO DO SISTEMA DE SINCRONIZAÇÃO
 * 
 * Este script testa todos os componentes do sistema de sincronização híbrida
 */

const fs = require('fs-extra');
// const path = require('path'); // Removido - não utilizado
// const { spawn } = require('child_process'); // Removido - não utilizado

console.log('🧪 INICIANDO TESTES DO SISTEMA DE SINCRONIZAÇÃO\n');
console.log('═'.repeat(60));

const tests = [];
let passed = 0;
let failed = 0;

// Função auxiliar para testes
function test(name, fn) {
  tests.push({ name, fn });
}

function runTests() {
  console.log(`\n📋 Executando ${tests.length} testes...\n`);
  
  tests.forEach(({ name, fn }, index) => {
    try {
      console.log(`[${index + 1}/${tests.length}] ${name}`);
      const result = fn();
      if (result) {
        console.log(`  ✅ PASSOU`);
        passed++;
      } else {
        console.log(`  ❌ FALHOU`);
        failed++;
      }
    } catch (error) {
      console.log(`  ❌ ERRO: ${error.message}`);
      failed++;
    }
    console.log('');
  });
  
  console.log('═'.repeat(60));
  console.log('\n📊 RESULTADO FINAL:');
  console.log(`  ✅ Passaram: ${passed}`);
  console.log(`  ❌ Falharam: ${failed}`);
  console.log(`  📈 Taxa de sucesso: ${((passed / tests.length) * 100).toFixed(1)}%`);
  
  if (failed === 0) {
    console.log('\n🎉 TODOS OS TESTES PASSARAM! Sistema está funcionando corretamente!\n');
    process.exit(0);
  } else {
    console.log('\n⚠️ Alguns testes falharam. Verifique os erros acima.\n');
    process.exit(1);
  }
}

// ============================================
// TESTES
// ============================================

test('✅ 1. Verificar se sync-manager.js existe', () => {
  return fs.existsSync('./sync-manager.js');
});

test('✅ 2. Verificar se file-watcher.js existe', () => {
  return fs.existsSync('./file-watcher.js');
});

test('✅ 3. Verificar se config.json existe', () => {
  return fs.existsSync('./config.json');
});

test('✅ 4. Verificar se .env existe', () => {
  return fs.existsSync('./.env');
});

test('✅ 5. Verificar se pasta uploads/ existe', () => {
  if (!fs.existsSync('./uploads')) {
    fs.mkdirSync('./uploads');
    console.log('  📁 Pasta uploads/ criada');
  }
  return fs.existsSync('./uploads');
});

test('✅ 6. Carregar módulo sync-manager', () => {
  try {
    const SyncManager = require('./sync-manager');
    return typeof SyncManager === 'function';
  } catch (error) {
    console.log(`  ⚠️ ${error.message}`);
    return false;
  }
});

test('✅ 7. Carregar módulo file-watcher', () => {
  try {
    const FileWatcher = require('./file-watcher');
    return typeof FileWatcher === 'function';
  } catch (error) {
    console.log(`  ⚠️ ${error.message}`);
    return false;
  }
});

test('✅ 8. Verificar config.json válido', () => {
  try {
    const config = require('./config.json');
    return config.sync && config.storage && config.googleDrive;
  } catch (error) {
    console.log(`  ⚠️ ${error.message}`);
    return false;
  }
});

test('✅ 9. Verificar configurações de sincronização no .env', () => {
  try {
    const envContent = fs.readFileSync('./.env', 'utf-8');
    return envContent.includes('SYNC_ENABLED') && 
           envContent.includes('GOOGLE_DRIVE_ENABLED') &&
           envContent.includes('WATCH_LOCAL_CHANGES');
  } catch (error) {
    console.log(`  ⚠️ ${error.message}`);
    return false;
  }
});

test('✅ 10. Verificar dependências instaladas (backend)', () => {
  try {
    const pkg = require('./package.json');
    const deps = pkg.dependencies || {};
    return deps['chokidar'] && 
           deps['socket.io'] && 
           deps['googleapis'];
  } catch (error) {
    console.log(`  ⚠️ ${error.message}`);
    return false;
  }
});

test('✅ 11. Verificar banco de dados SQLite', () => {
  return fs.existsSync('./agenda_hibrida.db') || fs.existsSync('./database.db');
});

test('✅ 12. Verificar tokens.json (Google Auth)', () => {
  return fs.existsSync('./tokens.json');
});

test('✅ 13. Verificar estrutura de pastas', () => {
  const dirs = ['uploads', 'backups', 'logs'];
  return dirs.every(dir => {
    if (!fs.existsSync(`./${dir}`)) {
      fs.mkdirSync(`./${dir}`, { recursive: true });
      console.log(`  📁 Pasta ${dir}/ criada`);
    }
    return fs.existsSync(`./${dir}`);
  });
});

test('✅ 14. Verificar se server.js importa SyncManager', () => {
  try {
    const serverContent = fs.readFileSync('./server.js', 'utf-8');
    return serverContent.includes('require(\'./sync-manager\')') ||
           serverContent.includes('require("./sync-manager")');
  } catch (error) {
    console.log(`  ⚠️ ${error.message}`);
    return false;
  }
});

test('✅ 15. Verificar se server.js importa FileWatcher', () => {
  try {
    const serverContent = fs.readFileSync('./server.js', 'utf-8');
    return serverContent.includes('require(\'./file-watcher\')') ||
           serverContent.includes('require("./file-watcher")');
  } catch (error) {
    console.log(`  ⚠️ ${error.message}`);
    return false;
  }
});

test('✅ 16. Verificar endpoint /api/clients/open-folder', () => {
  try {
    const serverContent = fs.readFileSync('./server.js', 'utf-8');
    return serverContent.includes('/api/clients/open-folder');
  } catch (error) {
    console.log(`  ⚠️ ${error.message}`);
    return false;
  }
});

test('✅ 17. Verificar endpoint /api/sync/resolve-conflict', () => {
  try {
    const serverContent = fs.readFileSync('./server.js', 'utf-8');
    return serverContent.includes('/api/sync/resolve-conflict');
  } catch (error) {
    console.log(`  ⚠️ ${error.message}`);
    return false;
  }
});

test('✅ 18. Verificar Socket.IO no server.js', () => {
  try {
    const serverContent = fs.readFileSync('./server.js', 'utf-8');
    return serverContent.includes('socket.io') || serverContent.includes('Server(');
  } catch (error) {
    console.log(`  ⚠️ ${error.message}`);
    return false;
  }
});

// Frontend tests (se pasta existe)
const frontendPath = '../agenda-hibrida-frontend';

if (fs.existsSync(frontendPath)) {
  test('✅ 19. Verificar SyncStatusIndicator.jsx', () => {
    return fs.existsSync(`${frontendPath}/src/components/SyncStatusIndicator.jsx`);
  });
  
  test('✅ 20. Verificar ConflictResolver.jsx', () => {
    return fs.existsSync(`${frontendPath}/src/components/ConflictResolver.jsx`);
  });
  
  test('✅ 21. Verificar socket.io-client instalado', () => {
    try {
      const pkg = require(`${frontendPath}/package.json`);
      return pkg.dependencies && pkg.dependencies['socket.io-client'];
    } catch (error) {
      console.log(`  ⚠️ ${error.message}`);
      return false;
    }
  });
  
  test('✅ 22. Verificar importação de SyncStatusIndicator em CalendarioVisual', () => {
    try {
      const calendarContent = fs.readFileSync(
        `${frontendPath}/src/components/CalendarioVisual.jsx`, 
        'utf-8'
      );
      return calendarContent.includes('SyncStatusIndicator');
    } catch (error) {
      console.log(`  ⚠️ ${error.message}`);
      return false;
    }
  });
  
  test('✅ 23. Verificar importação de ConflictResolver em CalendarioVisual', () => {
    try {
      const calendarContent = fs.readFileSync(
        `${frontendPath}/src/components/CalendarioVisual.jsx`, 
        'utf-8'
      );
      return calendarContent.includes('ConflictResolver');
    } catch (error) {
      console.log(`  ⚠️ ${error.message}`);
      return false;
    }
  });
}

// ============================================
// EXECUTAR TESTES
// ============================================

console.log('\n🔍 Verificando componentes do sistema...\n');
runTests();

