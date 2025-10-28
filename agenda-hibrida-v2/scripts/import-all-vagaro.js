#!/usr/bin/env node

/**
 * Script CLI para Importação em Massa de Dados Vagaro
 * 
 * Uso:
 *   node scripts/import-all-vagaro.js --dir=/caminho/para/arquivos
 *   node scripts/import-all-vagaro.js --file=/caminho/para/arquivo.xlsx
 * 
 * Opções:
 *   --dir=<caminho>     Diretório com múltiplos arquivos Vagaro
 *   --file=<caminho>    Arquivo único para importar
 *   --verbose           Mostrar detalhes completos
 *   --dry-run           Simular sem salvar no banco
 *   --help              Mostrar ajuda
 */

const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const VagaroUniversalImporter = require('../services/vagaroUniversalImporter');

// Parse argumentos CLI
const args = process.argv.slice(2).reduce((acc, arg) => {
  const [key, value] = arg.split('=');
  acc[key.replace('--', '')] = value || true;
  return acc;
}, {});

// Mostrar ajuda
if (args.help || (!args.dir && !args.file)) {
  console.log(`
╔═════════════════════════════════════════════════════════════╗
║      IMPORTADOR EM MASSA DE DADOS VAGARO - CLI             ║
╚═════════════════════════════════════════════════════════════╝

USO:
  node scripts/import-all-vagaro.js --dir=/path/to/vagaro/exports
  node scripts/import-all-vagaro.js --file=/path/to/CustomersList.xlsx

OPÇÕES:
  --dir=<path>     Diretório contendo arquivos Vagaro
  --file=<path>    Arquivo único para importar
  --verbose        Mostrar logs detalhados
  --dry-run        Simular importação sem salvar
  --help           Mostrar esta mensagem

ARQUIVOS SUPORTADOS:
  • CustomersList.xlsx     - Dados de clientes
  • DepositReport.xlsx     - Transações financeiras
  • Services.xlsx          - Serviços oferecidos
  • GiftCardsManagement.xlsx - Gift cards
  • Unsigned Forms.xlsx    - Formulários

ORDEM DE IMPORTAÇÃO:
  1. Clientes (base para vínculos)
  2. Serviços
  3. Transações (vincula com clientes)
  4. Gift Cards (vincula com clientes)
  5. Formulários (vincula com clientes)

EXEMPLO:
  node scripts/import-all-vagaro.js --dir=./vagaro_dados_download

═══════════════════════════════════════════════════════════════
  `);
  process.exit(0);
}

// Ordem de importação (para manter integridade referencial)
const IMPORT_ORDER = [
  'customerslist',
  'services',
  'depositreport',
  'transaction',
  'giftcard',
  'forms'
];

/**
 * Ordena arquivos pela prioridade de importação
 */
function sortFilesByPriority(files) {
  return files.sort((a, b) => {
    const aLower = a.toLowerCase();
    const bLower = b.toLowerCase();
    
    const aIndex = IMPORT_ORDER.findIndex(keyword => aLower.includes(keyword));
    const bIndex = IMPORT_ORDER.findIndex(keyword => bLower.includes(keyword));
    
    // Se não encontrar, coloca no final
    const aPriority = aIndex === -1 ? 999 : aIndex;
    const bPriority = bIndex === -1 ? 999 : bIndex;
    
    return aPriority - bPriority;
  });
}

/**
 * Busca todos os arquivos Excel em um diretório
 */
async function findExcelFiles(dirPath) {
  const files = [];
  
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      
      if (entry.isDirectory()) {
        // Recursivo em subdiretórios
        const subFiles = await findExcelFiles(fullPath);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (['.xlsx', '.xls'].includes(ext)) {
          files.push({
            path: fullPath,
            name: entry.name
          });
        }
      }
    }
  } catch (error) {
    console.error(`❌ Erro ao ler diretório ${dirPath}:`, error.message);
  }
  
  return files;
}

/**
 * Gera relatório HTML
 */
function generateHTMLReport(results, duration) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const reportPath = path.join(__dirname, '..', 'reports', `vagaro-import-${timestamp}.html`);
  
  let totalCreated = 0;
  let totalUpdated = 0;
  let totalSkipped = 0;
  let totalErrors = 0;
  
  results.forEach(r => {
    if (r.stats) {
      totalCreated += r.stats.created || 0;
      totalUpdated += r.stats.updated || 0;
      totalSkipped += r.stats.skipped || 0;
      totalErrors += r.stats.errors?.length || 0;
    }
  });
  
  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Relatório de Importação Vagaro</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { color: #2c3e50; border-bottom: 3px solid #3498db; padding-bottom: 10px; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 30px 0; }
    .card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .card.success { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); }
    .card.warning { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
    .card.error { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
    .card h3 { margin: 0; font-size: 2em; }
    .card p { margin: 5px 0 0 0; opacity: 0.9; }
    table { width: 100%; border-collapse: collapse; margin-top: 30px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #3498db; color: white; font-weight: bold; }
    tr:hover { background: #f8f9fa; }
    .status { padding: 4px 8px; border-radius: 4px; font-size: 0.85em; font-weight: bold; }
    .status.success { background: #d4edda; color: #155724; }
    .status.partial { background: #fff3cd; color: #856404; }
    .status.failed { background: #f8d7da; color: #721c24; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center; color: #7f8c8d; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Relatório de Importação Vagaro</h1>
    <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
    <p><strong>Duração:</strong> ${duration}</p>
    
    <div class="summary">
      <div class="card success">
        <h3>${totalCreated}</h3>
        <p>Criados</p>
      </div>
      <div class="card">
        <h3>${totalUpdated}</h3>
        <p>Atualizados</p>
      </div>
      <div class="card warning">
        <h3>${totalSkipped}</h3>
        <p>Pulados</p>
      </div>
      <div class="card error">
        <h3>${totalErrors}</h3>
        <p>Erros</p>
      </div>
    </div>
    
    <h2>Detalhes por Arquivo</h2>
    <table>
      <thead>
        <tr>
          <th>Arquivo</th>
          <th>Status</th>
          <th>Criados</th>
          <th>Atualizados</th>
          <th>Pulados</th>
          <th>Erros</th>
        </tr>
      </thead>
      <tbody>
        ${results.map(r => `
          <tr>
            <td>${r.file}</td>
            <td><span class="status ${r.success ? 'success' : 'failed'}">${r.success ? 'Sucesso' : 'Falhou'}</span></td>
            <td>${r.stats?.created || 0}</td>
            <td>${r.stats?.updated || 0}</td>
            <td>${r.stats?.skipped || 0}</td>
            <td>${r.stats?.errors?.length || 0}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div class="footer">
      <p>Gerado automaticamente pelo Importador Vagaro CLI</p>
    </div>
  </div>
</body>
</html>
  `;
  
  return { html, path: reportPath };
}

/**
 * Função principal
 */
async function main() {
  const startTime = Date.now();
  
  console.log('\n╔═════════════════════════════════════════════════════════════╗');
  console.log('║      IMPORTAÇÃO EM MASSA DE DADOS VAGARO                   ║');
  console.log('╚═════════════════════════════════════════════════════════════╝\n');
  
  // Conectar ao banco de dados
  const dbPath = path.join(__dirname, '..', 'agenda_hibrida.db');
  const db = new sqlite3.Database(dbPath);
  
  console.log(`✅ Conectado ao banco: ${dbPath}\n`);
  
  // Criar importador
  const importer = new VagaroUniversalImporter(db);
  
  // Buscar arquivos
  let files = [];
  
  if (args.dir) {
    console.log(`📂 Buscando arquivos em: ${args.dir}\n`);
    files = await findExcelFiles(args.dir);
  } else if (args.file) {
    const fileName = path.basename(args.file);
    files = [{ path: args.file, name: fileName }];
  }
  
  if (files.length === 0) {
    console.log('⚠️  Nenhum arquivo Excel encontrado!\n');
    process.exit(1);
  }
  
  // Ordenar por prioridade
  files = sortFilesByPriority(files.map(f => f.path)).map(filePath => ({
    path: filePath,
    name: path.basename(filePath)
  }));
  
  console.log(`📋 Encontrados ${files.length} arquivo(s) para importar:\n`);
  files.forEach((f, i) => {
    console.log(`   ${i + 1}. ${f.name}`);
  });
  console.log('');
  
  if (args['dry-run']) {
    console.log('⚠️  MODO DRY-RUN: Nenhum dado será salvo no banco\n');
  }
  
  // Importar cada arquivo
  const results = [];
  
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📁 [${i + 1}/${files.length}] ${file.name}`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    
    try {
      if (args['dry-run']) {
        // Apenas ler e analisar
        const data = await importer.readExcelFile(file.path);
        const headers = data.length > 0 ? Object.keys(data[0]) : [];
        const fileType = importer.detectFileType(headers, file.name);
        
        console.log(`   🔍 Tipo detectado: ${fileType}`);
        console.log(`   📊 Total de registros: ${data.length}`);
        console.log(`   ✅ Dry-run OK\n`);
        
        results.push({
          file: file.name,
          success: true,
          stats: { total: data.length, created: 0, updated: 0, skipped: 0, errors: [] }
        });
      } else {
        // Importar de verdade
        const stats = await importer.importFile(file.path, file.name);
        
        console.log(`\n   ✅ Importação concluída!`);
        console.log(`      📊 Total: ${stats.total}`);
        console.log(`      ➕ Criados: ${stats.created}`);
        console.log(`      🔄 Atualizados: ${stats.updated}`);
        console.log(`      ⏭️  Pulados: ${stats.skipped}`);
        console.log(`      ❌ Erros: ${stats.errors.length}\n`);
        
        results.push({
          file: file.name,
          success: true,
          stats: stats
        });
      }
      
    } catch (error) {
      console.error(`\n   ❌ ERRO: ${error.message}\n`);
      
      results.push({
        file: file.name,
        success: false,
        error: error.message
      });
    }
  }
  
  // Fechar banco
  db.close();
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  
  // Sumário final
  console.log('\n╔═════════════════════════════════════════════════════════════╗');
  console.log('║                   SUMÁRIO FINAL                             ║');
  console.log('╚═════════════════════════════════════════════════════════════╝\n');
  
  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;
  
  console.log(`⏱️  Duração total: ${duration}s`);
  console.log(`📁 Arquivos processados: ${files.length}`);
  console.log(`✅ Sucessos: ${successCount}`);
  console.log(`❌ Falhas: ${failCount}\n`);
  
  // Gerar relatório
  const report = importer.generateReport();
  
  console.log('📊 ESTATÍSTICAS GERAIS:\n');
  Object.keys(report.summary).forEach(type => {
    const stats = report.summary[type];
    if (stats.total > 0) {
      console.log(`   ${type.toUpperCase()}:`);
      console.log(`      Total: ${stats.total}`);
      console.log(`      Criados: ${stats.created}`);
      console.log(`      Atualizados: ${stats.updated}`);
      console.log(`      Taxa de sucesso: ${stats.success_rate}\n`);
    }
  });
  
  // Gerar relatório HTML
  if (!args['dry-run']) {
    try {
      const { html, path: reportPath } = generateHTMLReport(results, `${duration}s`);
      const reportsDir = path.dirname(reportPath);
      await fs.mkdir(reportsDir, { recursive: true });
      await fs.writeFile(reportPath, html);
      console.log(`📄 Relatório HTML gerado: ${reportPath}\n`);
    } catch (error) {
      console.error('⚠️  Erro ao gerar relatório HTML:', error.message);
    }
  }
  
  console.log('🎉 Importação concluída!\n');
  
  process.exit(successCount === files.length ? 0 : 1);
}

// Executar
main().catch(error => {
  console.error('\n💥 ERRO FATAL:', error.message);
  console.error(error.stack);
  process.exit(1);
});

