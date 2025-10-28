#!/usr/bin/env node

/**
 * Script CLI para Importação em Massa de Arquivos Vagaro
 * Processa automaticamente todos os arquivos .xlsx de um diretório
 * 
 * Uso: node scripts/import-all-vagaro.js <diretorio>
 * Exemplo: node scripts/import-all-vagaro.js ./vagaro-exports
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const VagaroUniversalImporter = require('../services/vagaroUniversalImporter');

// Configurações
const DB_PATH = path.join(__dirname, '..', 'agenda_hibrida.db');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const c = (color, text) => `${colors[color]}${text}${colors.reset}`;

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function printHeader() {
  console.log('\n' + c('cyan', '╔═══════════════════════════════════════════════════════════╗'));
  console.log(c('cyan', '║') + c('bright', '     IMPORTAÇÃO EM MASSA - VAGARO UNIVERSAL IMPORTER      ') + c('cyan', '║'));
  console.log(c('cyan', '╚═══════════════════════════════════════════════════════════╝') + '\n');
}

function findExcelFiles(directory) {
  if (!fs.existsSync(directory)) {
    throw new Error(`Diretório não encontrado: ${directory}`);
  }

  const files = fs.readdirSync(directory);
  const excelFiles = files.filter(file => {
    const ext = path.extname(file).toLowerCase();
    return ext === '.xlsx' || ext === '.xls';
  });

  return excelFiles.map(file => ({
    name: file,
    path: path.join(directory, file)
  }));
}

function printFileList(files) {
  console.log(c('bright', `📁 Arquivos encontrados: ${files.length}\n`));
  files.forEach((file, index) => {
    console.log(`  ${c('yellow', index + 1)}. ${c('blue', file.name)}`);
  });
  console.log('');
}

function printProgress(current, total, fileName) {
  const percentage = Math.round((current / total) * 100);
  const bar = '█'.repeat(Math.floor(percentage / 2)) + '░'.repeat(50 - Math.floor(percentage / 2));
  
  console.log(c('cyan', `\n┌─ Progresso [${current}/${total}] ${percentage}%`));
  console.log(c('cyan', '│ ') + c('green', bar));
  console.log(c('cyan', '└─ ') + c('bright', fileName) + '\n');
}

function printStats(stats) {
  console.log(c('bright', '\n📊 Estatísticas do Arquivo:\n'));
  
  const types = ['customers', 'transactions', 'services', 'giftcards', 'forms'];
  
  types.forEach(type => {
    const stat = stats[type];
    if (stat && stat.total > 0) {
      console.log(c('magenta', `   ${type.toUpperCase()}:`));
      console.log(`      Total:       ${c('bright', stat.total)}`);
      console.log(`      Criados:     ${c('green', stat.created)}`);
      console.log(`      Atualizados: ${c('blue', stat.updated)}`);
      console.log(`      Ignorados:   ${c('yellow', stat.skipped)}`);
      console.log(`      Erros:       ${c('red', stat.errors.length)}`);
      
      if (stat.errors.length > 0) {
        console.log(c('red', '\n      ⚠️  Primeiros 3 erros:'));
        stat.errors.slice(0, 3).forEach(err => {
          console.log(c('red', `         - Linha ${err.row}: ${err.error}`));
        });
      }
      console.log('');
    }
  });
}

function printSummary(results) {
  console.log(c('cyan', '\n╔═══════════════════════════════════════════════════════════╗'));
  console.log(c('cyan', '║') + c('bright', '                    RESUMO FINAL                           ') + c('cyan', '║'));
  console.log(c('cyan', '╚═══════════════════════════════════════════════════════════╝\n'));

  let totalSuccess = 0;
  let totalFailed = 0;
  let totalCreated = 0;
  let totalUpdated = 0;

  results.forEach(result => {
    if (result.success) {
      totalSuccess++;
      const report = result.report;
      Object.values(report.summary).forEach(sum => {
        totalCreated += sum.created || 0;
        totalUpdated += sum.updated || 0;
      });
    } else {
      totalFailed++;
    }
  });

  console.log(c('bright', '📦 Arquivos Processados:'));
  console.log(`   ${c('green', '✓')} Sucesso:  ${c('green', totalSuccess)}`);
  console.log(`   ${c('red', '✗')} Falhas:   ${c('red', totalFailed)}`);
  console.log(`   ${c('blue', '◉')} Total:    ${c('bright', results.length)}\n`);

  console.log(c('bright', '📊 Registros:'));
  console.log(`   ${c('green', '+')} Criados:      ${c('green', totalCreated)}`);
  console.log(`   ${c('blue', '↻')} Atualizados:  ${c('blue', totalUpdated)}`);
  console.log(`   ${c('bright', '=')} Total:        ${c('bright', totalCreated + totalUpdated)}\n`);
}

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

async function importAll(directory) {
  const startTime = Date.now();

  try {
    printHeader();

    // Encontrar arquivos
    const files = findExcelFiles(directory);

    if (files.length === 0) {
      console.log(c('yellow', '⚠️  Nenhum arquivo Excel (.xlsx, .xls) encontrado no diretório.\n'));
      process.exit(0);
    }

    printFileList(files);

    // Conectar ao banco
    console.log(c('blue', '🔌 Conectando ao banco de dados...\n'));
    const db = new sqlite3.Database(DB_PATH);

    // Processar cada arquivo
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      printProgress(i + 1, files.length, file.name);

      try {
        const importer = new VagaroUniversalImporter(db);
        
        console.log(c('blue', '📥 Importando...'));
        const stats = await importer.importFile(file.path, file.name);
        
        printStats(importer.getStats());
        
        const report = importer.generateReport();

        results.push({
          file: file.name,
          success: true,
          stats: stats,
          report: report
        });

        console.log(c('green', '✅ Arquivo importado com sucesso!\n'));

      } catch (error) {
        console.error(c('red', `\n❌ ERRO: ${error.message}\n`));
        
        results.push({
          file: file.name,
          success: false,
          error: error.message
        });
      }
    }

    // Fechar banco
    await new Promise((resolve) => {
      db.close(resolve);
    });

    // Mostrar resumo
    printSummary(results);

    // Duração total
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(c('bright', `⏱️  Tempo total: ${duration}s\n`));

    // Salvar log em JSON
    const logFile = path.join(directory, `import-log-${Date.now()}.json`);
    fs.writeFileSync(logFile, JSON.stringify(results, null, 2));
    console.log(c('blue', `📝 Log salvo em: ${logFile}\n`));

    console.log(c('green', '🎉 Importação em massa concluída!\n'));

  } catch (error) {
    console.error(c('red', `\n❌ ERRO FATAL: ${error.message}\n`));
    console.error(error.stack);
    process.exit(1);
  }
}

// ============================================
// EXECUÇÃO
// ============================================

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(c('yellow', '\n⚠️  Uso: node scripts/import-all-vagaro.js <diretorio>\n'));
  console.log(c('blue', 'Exemplo: node scripts/import-all-vagaro.js ./vagaro-exports\n'));
  process.exit(0);
}

const directory = path.resolve(args[0]);

importAll(directory)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(c('red', `\n❌ Erro: ${error.message}\n`));
    process.exit(1);
  });
