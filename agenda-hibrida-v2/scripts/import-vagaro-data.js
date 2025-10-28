#!/usr/bin/env node

/**
 * CLI Script para Importação de Dados do Vagaro
 * Uso: node scripts/import-vagaro-data.js --type=customers --file=data.xlsx [--update]
 */

const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');
const Database = require('better-sqlite3');
const VagaroBatchImporter = require('../services/vagaro-batch-importer');

// Parse argumentos CLI
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  acc[key.replace('--', '')] = value || true;
  return acc;
}, {});

// Validações
if (args.help || !args.type || !args.file) {
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          IMPORTADOR DE DADOS VAGARO - CLI                     ║
╚═══════════════════════════════════════════════════════════════╝

USO:
  node scripts/import-vagaro-data.js --type=<tipo> --file=<arquivo> [opções]

TIPOS DE IMPORTAÇÃO:
  customers      - Importar clientes
  transactions   - Importar transações financeiras
  employees      - Importar funcionários
  appointments   - Importar agendamentos (futuro)

OPÇÕES:
  --file=<path>     - Caminho do arquivo Excel (.xlsx ou .xls)
  --type=<tipo>     - Tipo de dados a importar
  --update          - Atualizar registros existentes (default: skip)
  --sheet=<nome>    - Nome da planilha (default: primeira)
  --dry-run         - Simular importação sem salvar
  --verbose         - Mostrar detalhes completos
  --help            - Mostrar esta ajuda

EXEMPLOS:
  # Importar clientes de um arquivo Excel
  node scripts/import-vagaro-data.js --type=customers --file=vagaro-clients.xlsx

  # Importar transações com atualização de duplicatas
  node scripts/import-vagaro-data.js --type=transactions --file=vagaro-sales.xlsx --update

  # Importar funcionários com modo verbose
  node scripts/import-vagaro-data.js --type=employees --file=staff.xlsx --verbose

  # Dry-run (simulação)
  node scripts/import-vagaro-data.js --type=customers --file=test.xlsx --dry-run

╔═══════════════════════════════════════════════════════════════╗
║ FORMATO DO ARQUIVO EXCEL                                      ║
╚═══════════════════════════════════════════════════════════════╝

CLIENTES (Customers):
  - Colunas requeridas: name (ou first_name + last_name)
  - Colunas opcionais: email, phone, address, city, state, zip,
    birth_date, gender, notes, customer_id, member_since

TRANSAÇÕES (Transactions):
  - Colunas requeridas: transaction_date (ou date), total (ou amount)
  - Colunas opcionais: customer_email, customer_name, service_name,
    payment_method, transaction_type, employee_name, invoice_number

FUNCIONÁRIOS (Employees):
  - Colunas requeridas: name (ou employee_name, staff_name)
  - Colunas opcionais: email, phone, role, commission_rate, hire_date,
    employee_id, is_active

NOTAS:
  - Primeira linha deve conter os cabeçalhos
  - Campos vazios serão tratados como NULL
  - Sistema detecta automaticamente duplicatas
  - Use --update para sobrescrever dados existentes

═══════════════════════════════════════════════════════════════
  `);
  process.exit(0);
}

const { type, file, update, sheet, verbose } = args;
const dryRun = args['dry-run'];

// Validar tipo
const validTypes = ['customers', 'transactions', 'employees', 'appointments'];
if (!validTypes.includes(type)) {
  console.error(`❌ Erro: Tipo inválido "${type}". Use um destes: ${validTypes.join(', ')}`);
  process.exit(1);
}

// Validar arquivo
if (!fs.existsSync(file)) {
  console.error(`❌ Erro: Arquivo não encontrado: ${file}`);
  process.exit(1);
}

const ext = path.extname(file).toLowerCase();
if (!['.xlsx', '.xls', '.csv'].includes(ext)) {
  console.error(`❌ Erro: Formato de arquivo inválido. Use .xlsx, .xls ou .csv`);
  process.exit(1);
}

// Banner
console.log(`
╔═══════════════════════════════════════════════════════════════╗
║          IMPORTADOR DE DADOS VAGARO                           ║
╚═══════════════════════════════════════════════════════════════╝
`);

console.log(`📋 Tipo de Importação: ${type.toUpperCase()}`);
console.log(`📁 Arquivo: ${file}`);
console.log(`🔄 Modo: ${dryRun ? 'SIMULAÇÃO (Dry-Run)' : update ? 'IMPORTAR + ATUALIZAR' : 'IMPORTAR (Skip Duplicatas)'}`);
console.log(`\n───────────────────────────────────────────────────────────────\n`);

async function main() {
  try {
    // Ler arquivo Excel
    console.log('📖 Lendo arquivo Excel...');
    const workbook = XLSX.readFile(file);
    const sheetName = sheet || workbook.SheetNames[0];
    
    if (!workbook.SheetNames.includes(sheetName)) {
      console.error(`❌ Erro: Planilha "${sheetName}" não encontrada no arquivo`);
      console.log(`   Planilhas disponíveis: ${workbook.SheetNames.join(', ')}`);
      process.exit(1);
    }

    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    console.log(`✅ Arquivo lido com sucesso`);
    console.log(`   📊 Planilha: ${sheetName}`);
    console.log(`   📈 Total de linhas: ${rows.length}`);

    if (rows.length === 0) {
      console.error('\n❌ Erro: Nenhum dado encontrado no arquivo');
      process.exit(1);
    }

    // Mostrar preview das colunas
    const columns = Object.keys(rows[0]);
    console.log(`   📝 Colunas detectadas (${columns.length}): ${columns.slice(0, 8).join(', ')}${columns.length > 8 ? '...' : ''}`);

    if (verbose) {
      console.log('\n📋 Preview dos dados (primeiras 3 linhas):');
      console.table(rows.slice(0, 3));
    }

    if (dryRun) {
      console.log('\n🔍 MODO DRY-RUN: Nenhum dado será salvo no banco');
      console.log(`✅ Arquivo validado com sucesso - ${rows.length} linhas prontas para importação`);
      process.exit(0);
    }

    // Conectar ao banco
    console.log('\n💾 Conectando ao banco de dados...');
    const dbPath = path.join(__dirname, '../database/scheduler.db');
    
    if (!fs.existsSync(dbPath)) {
      console.error(`❌ Erro: Banco de dados não encontrado: ${dbPath}`);
      console.log('   Certifique-se de rodar as migrations primeiro');
      process.exit(1);
    }

    const db = new Database(dbPath);
    const importer = new VagaroBatchImporter(db);

    // Executar importação
    console.log(`\n🚀 Iniciando importação de ${type}...`);
    console.log('   ⏳ Aguarde, isso pode levar alguns minutos...\n');

    const startTime = Date.now();
    let result;

    switch (type) {
      case 'customers':
        result = await importer.importCustomers(rows, path.basename(file), { updateExisting: !!update });
        break;
      case 'transactions':
        result = await importer.importTransactions(rows, path.basename(file), { updateExisting: !!update });
        break;
      case 'employees':
        result = await importer.importEmployees(rows, path.basename(file), { updateExisting: !!update });
        break;
      default:
        console.error(`❌ Tipo "${type}" ainda não implementado`);
        process.exit(1);
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    // Resultados
    console.log('───────────────────────────────────────────────────────────────');
    console.log('✅ IMPORTAÇÃO CONCLUÍDA COM SUCESSO!');
    console.log('───────────────────────────────────────────────────────────────\n');

    const { stats, logId } = result;

    // Estatísticas
    const successRate = ((stats.successful / stats.total) * 100).toFixed(1);
    
    console.log('📊 ESTATÍSTICAS:');
    console.log(`   📋 Total de linhas: ${stats.total}`);
    console.log(`   ✅ Importadas: ${stats.successful} (${successRate}%)`);
    console.log(`   ⏭️  Puladas (duplicatas): ${stats.skipped}`);
    console.log(`   ❌ Falhas: ${stats.failed}`);
    console.log(`   ⏱️  Duração: ${duration}s`);
    console.log(`   📝 Log ID: ${logId}`);

    // Status visual
    console.log('\n📈 PROGRESSO:');
    const barLength = 50;
    const successBars = Math.floor((stats.successful / stats.total) * barLength);
    const skipBars = Math.floor((stats.skipped / stats.total) * barLength);
    const failBars = Math.floor((stats.failed / stats.total) * barLength);
    
    const bar = '█'.repeat(successBars) + '░'.repeat(skipBars) + '▓'.repeat(failBars) + ' '.repeat(barLength - successBars - skipBars - failBars);
    console.log(`   [${bar}]`);
    console.log(`   ✅ Sucesso  ░ Puladas  ▓ Falhas`);

    // Erros detalhados
    if (stats.failed > 0) {
      console.log('\n⚠️  ATENÇÃO: Algumas linhas falharam na importação');
      console.log(`   📋 Verifique o log de erros no banco (import_log_id: ${logId})`);
      
      if (verbose) {
        const errors = db.prepare('SELECT * FROM import_errors WHERE import_log_id = ? LIMIT 10').all(logId);
        console.log('\n❌ PRIMEIROS ERROS (máx 10):');
        console.table(errors.map(e => ({
          Linha: e.row_number,
          Tipo: e.error_type,
          Erro: e.error_message.substring(0, 60)
        })));
      }
    }

    // Recomendações
    console.log('\n💡 PRÓXIMOS PASSOS:');
    if (stats.failed > 0) {
      console.log('   1. Revise os erros no banco de dados');
      console.log('   2. Corrija os dados problemáticos no arquivo Excel');
      console.log('   3. Execute a importação novamente com --update');
    }
    console.log(`   • Veja os dados importados na interface web`);
    console.log(`   • Use --verbose para mais detalhes em futuras importações`);

    console.log('\n═══════════════════════════════════════════════════════════════\n');

    db.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERRO FATAL NA IMPORTAÇÃO:');
    console.error(`   ${error.message}`);
    
    if (verbose) {
      console.error('\n📋 Stack trace:');
      console.error(error.stack);
    }
    
    console.log('\n💡 DICAS:');
    console.log('   • Verifique se o formato do arquivo está correto');
    console.log('   • Certifique-se de que as migrations foram executadas');
    console.log('   • Use --verbose para mais detalhes');
    console.log('   • Use --dry-run para validar o arquivo antes de importar');
    
    process.exit(1);
  }
}

// Executar
main();

