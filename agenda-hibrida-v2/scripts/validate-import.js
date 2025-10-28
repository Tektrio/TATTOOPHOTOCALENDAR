#!/usr/bin/env node

/**
 * Script CLI para Validação de Dados Importados
 * Verifica integridade, duplicatas e problemas nos dados do Vagaro
 * 
 * Uso: node scripts/validate-import.js [opcoes]
 * Opções:
 *   --deep      Validação profunda (mais lenta, mais completa)
 *   --fix       Tenta corrigir problemas automaticamente
 *   --report    Gera relatório em JSON
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

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
// FUNÇÕES DE VALIDAÇÃO
// ============================================

function queryDb(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function allDb(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function validateClients(db, options) {
  console.log(c('blue', '\n📋 Validando Clientes...'));
  
  const issues = [];

  // Total de clientes
  const total = await queryDb(db, 'SELECT COUNT(*) as count FROM clients');
  console.log(`   Total: ${c('bright', total.count)}`);

  // Clientes sem nome
  const noName = await queryDb(db, 
    "SELECT COUNT(*) as count FROM clients WHERE name IS NULL OR name = ''"
  );
  if (noName.count > 0) {
    issues.push({ severity: 'error', type: 'missing_name', count: noName.count });
    console.log(`   ${c('red', '✗')} Sem nome: ${c('red', noName.count)}`);
  }

  // Clientes sem contato
  const noContact = await queryDb(db, 
    "SELECT COUNT(*) as count FROM clients WHERE (email IS NULL OR email = '') AND (mobile IS NULL OR mobile = '')"
  );
  if (noContact.count > 0) {
    issues.push({ severity: 'warning', type: 'no_contact', count: noContact.count });
    console.log(`   ${c('yellow', '⚠')} Sem contato (email/telefone): ${c('yellow', noContact.count)}`);
  }

  // Duplicatas de email
  if (options.deep) {
    const dupEmails = await allDb(db, `
      SELECT email, COUNT(*) as count 
      FROM clients 
      WHERE email IS NOT NULL AND email != ''
      GROUP BY LOWER(email)
      HAVING count > 1
    `);
    
    if (dupEmails.length > 0) {
      issues.push({ severity: 'warning', type: 'duplicate_email', count: dupEmails.length });
      console.log(`   ${c('yellow', '⚠')} Emails duplicados: ${c('yellow', dupEmails.length)}`);
    }
  }

  // Clientes do Vagaro
  const fromVagaro = await queryDb(db, 
    "SELECT COUNT(*) as count FROM clients WHERE import_source = 'vagaro'"
  );
  console.log(`   ${c('green', '✓')} Do Vagaro: ${c('green', fromVagaro.count)}`);

  return issues;
}

async function validateTransactions(db, options) {
  console.log(c('blue', '\n💳 Validando Transações...'));
  
  const issues = [];

  // Total de transações
  const total = await queryDb(db, 'SELECT COUNT(*) as count FROM vagaro_transactions');
  console.log(`   Total: ${c('bright', total.count)}`);

  // Transações sem data
  const noDate = await queryDb(db, 
    "SELECT COUNT(*) as count FROM vagaro_transactions WHERE transaction_date IS NULL"
  );
  if (noDate.count > 0) {
    issues.push({ severity: 'error', type: 'missing_date', count: noDate.count });
    console.log(`   ${c('red', '✗')} Sem data: ${c('red', noDate.count)}`);
  }

  // Transações sem cliente vinculado
  const noClient = await queryDb(db, 
    "SELECT COUNT(*) as count FROM vagaro_transactions WHERE client_id IS NULL"
  );
  if (noClient.count > 0) {
    issues.push({ severity: 'warning', type: 'no_client', count: noClient.count });
    console.log(`   ${c('yellow', '⚠')} Sem cliente vinculado: ${c('yellow', noClient.count)}`);
  }

  // Valores totais
  const totals = await queryDb(db, `
    SELECT 
      SUM(gross_amount) as total_gross,
      SUM(net_amount) as total_net,
      SUM(total_fee) as total_fees
    FROM vagaro_transactions
  `);
  
  console.log(`   ${c('green', '✓')} Valor bruto: ${c('green', '$' + (totals.total_gross || 0).toFixed(2))}`);
  console.log(`   ${c('green', '✓')} Valor líquido: ${c('green', '$' + (totals.total_net || 0).toFixed(2))}`);
  console.log(`   ${c('blue', 'ℹ')} Total de taxas: ${c('blue', '$' + (totals.total_fees || 0).toFixed(2))}`);

  return issues;
}

async function validateServices(db, options) {
  console.log(c('blue', '\n🔧 Validando Serviços...'));
  
  const issues = [];

  // Total de serviços
  const total = await queryDb(db, 'SELECT COUNT(*) as count FROM vagaro_services');
  console.log(`   Total: ${c('bright', total.count)}`);

  // Serviços sem nome
  const noName = await queryDb(db, 
    "SELECT COUNT(*) as count FROM vagaro_services WHERE service_name IS NULL OR service_name = ''"
  );
  if (noName.count > 0) {
    issues.push({ severity: 'error', type: 'missing_name', count: noName.count });
    console.log(`   ${c('red', '✗')} Sem nome: ${c('red', noName.count)}`);
  }

  // Top 5 serviços
  if (options.deep) {
    const topServices = await allDb(db, `
      SELECT service_name, total_appointments, service_sales
      FROM vagaro_services
      WHERE is_active = 1
      ORDER BY total_appointments DESC
      LIMIT 5
    `);

    if (topServices.length > 0) {
      console.log(c('magenta', '\n   📊 Top 5 Serviços:'));
      topServices.forEach((service, index) => {
        console.log(`      ${index + 1}. ${service.service_name} - ${service.total_appointments} agendamentos ($${service.service_sales?.toFixed(2)})`);
      });
    }
  }

  return issues;
}

async function validateGiftCards(db, options) {
  console.log(c('blue', '\n🎁 Validando Gift Cards...'));
  
  const issues = [];

  // Total de gift cards
  const total = await queryDb(db, 'SELECT COUNT(*) as count FROM vagaro_gift_cards');
  console.log(`   Total: ${c('bright', total.count)}`);

  // Gift cards ativos
  const active = await queryDb(db, 
    "SELECT COUNT(*) as count, SUM(current_balance) as total_balance FROM vagaro_gift_cards WHERE status = 'outstanding'"
  );
  console.log(`   ${c('green', '✓')} Ativos: ${c('green', active.count)} (saldo: $${(active.total_balance || 0).toFixed(2)})`);

  // Gift cards expirados
  const expired = await queryDb(db, 
    "SELECT COUNT(*) as count FROM vagaro_gift_cards WHERE expire_on IS NOT NULL AND expire_on < date('now')"
  );
  if (expired.count > 0) {
    issues.push({ severity: 'warning', type: 'expired', count: expired.count });
    console.log(`   ${c('yellow', '⚠')} Expirados: ${c('yellow', expired.count)}`);
  }

  return issues;
}

async function validateForms(db, options) {
  console.log(c('blue', '\n📋 Validando Formulários...'));
  
  const issues = [];

  // Total de formulários
  const total = await queryDb(db, 'SELECT COUNT(*) as count FROM vagaro_forms');
  console.log(`   Total: ${c('bright', total.count)}`);

  // Formulários não assinados
  const unsigned = await queryDb(db, 
    "SELECT COUNT(*) as count FROM vagaro_forms WHERE signature_status = 'unsigned'"
  );
  if (unsigned.count > 0) {
    issues.push({ severity: 'warning', type: 'unsigned', count: unsigned.count });
    console.log(`   ${c('yellow', '⚠')} Não assinados: ${c('yellow', unsigned.count)}`);
  }

  // Formulários sem cliente vinculado
  const noClient = await queryDb(db, 
    "SELECT COUNT(*) as count FROM vagaro_forms WHERE client_id IS NULL"
  );
  if (noClient.count > 0) {
    issues.push({ severity: 'info', type: 'no_client', count: noClient.count });
    console.log(`   ${c('blue', 'ℹ')} Sem cliente vinculado: ${c('blue', noClient.count)}`);
  }

  return issues;
}

async function validateDataIntegrity(db, options) {
  console.log(c('blue', '\n🔍 Validando Integridade dos Dados...'));
  
  const issues = [];

  // Transações órfãs (client_id inválido)
  const orphanTransactions = await queryDb(db, `
    SELECT COUNT(*) as count 
    FROM vagaro_transactions 
    WHERE client_id IS NOT NULL 
      AND client_id NOT IN (SELECT id FROM clients)
  `);
  
  if (orphanTransactions.count > 0) {
    issues.push({ severity: 'error', type: 'orphan_transactions', count: orphanTransactions.count });
    console.log(`   ${c('red', '✗')} Transações órfãs: ${c('red', orphanTransactions.count)}`);
  }

  // Gift cards órfãos
  const orphanGiftCards = await queryDb(db, `
    SELECT COUNT(*) as count 
    FROM vagaro_gift_cards 
    WHERE client_id IS NOT NULL 
      AND client_id NOT IN (SELECT id FROM clients)
  `);
  
  if (orphanGiftCards.count > 0) {
    issues.push({ severity: 'error', type: 'orphan_giftcards', count: orphanGiftCards.count });
    console.log(`   ${c('red', '✗')} Gift cards órfãos: ${c('red', orphanGiftCards.count)}`);
  }

  // Forms órfãos
  const orphanForms = await queryDb(db, `
    SELECT COUNT(*) as count 
    FROM vagaro_forms 
    WHERE client_id IS NOT NULL 
      AND client_id NOT IN (SELECT id FROM clients)
  `);
  
  if (orphanForms.count > 0) {
    issues.push({ severity: 'error', type: 'orphan_forms', count: orphanForms.count });
    console.log(`   ${c('red', '✗')} Formulários órfãos: ${c('red', orphanForms.count)}`);
  }

  if (issues.length === 0) {
    console.log(`   ${c('green', '✓')} Integridade OK - Sem registros órfãos`);
  }

  return issues;
}

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

async function validate(options) {
  const startTime = Date.now();

  try {
    console.log(c('cyan', '\n╔═══════════════════════════════════════════════════════════╗'));
    console.log(c('cyan', '║') + c('bright', '          VALIDAÇÃO DE DADOS IMPORTADOS - VAGARO           ') + c('cyan', '║'));
    console.log(c('cyan', '╚═══════════════════════════════════════════════════════════╝'));

    if (options.deep) {
      console.log(c('yellow', '\n⚡ Modo: Validação Profunda (pode demorar mais)\n'));
    }

    // Conectar ao banco
    console.log(c('blue', '🔌 Conectando ao banco de dados...'));
    const db = new sqlite3.Database(DB_PATH);

    // Executar validações
    const allIssues = {
      clients: await validateClients(db, options),
      transactions: await validateTransactions(db, options),
      services: await validateServices(db, options),
      giftcards: await validateGiftCards(db, options),
      forms: await validateForms(db, options),
      integrity: await validateDataIntegrity(db, options)
    };

    // Fechar banco
    await new Promise((resolve) => {
      db.close(resolve);
    });

    // Resumo
    console.log(c('cyan', '\n╔═══════════════════════════════════════════════════════════╗'));
    console.log(c('cyan', '║') + c('bright', '                      RESUMO DA VALIDAÇÃO                  ') + c('cyan', '║'));
    console.log(c('cyan', '╚═══════════════════════════════════════════════════════════╝\n'));

    let totalErrors = 0;
    let totalWarnings = 0;
    let totalInfo = 0;

    Object.values(allIssues).forEach(issues => {
      issues.forEach(issue => {
        if (issue.severity === 'error') totalErrors++;
        else if (issue.severity === 'warning') totalWarnings++;
        else if (issue.severity === 'info') totalInfo++;
      });
    });

    console.log(c('red', `   ✗ Erros Críticos:    ${totalErrors}`));
    console.log(c('yellow', `   ⚠ Avisos:            ${totalWarnings}`));
    console.log(c('blue', `   ℹ Informações:       ${totalInfo}`));

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(c('bright', `\n   ⏱️  Tempo total: ${duration}s`));

    // Gerar relatório JSON
    if (options.report) {
      const reportFile = path.join(__dirname, '..', `validation-report-${Date.now()}.json`);
      fs.writeFileSync(reportFile, JSON.stringify({
        timestamp: new Date().toISOString(),
        duration: duration,
        issues: allIssues,
        summary: {
          errors: totalErrors,
          warnings: totalWarnings,
          info: totalInfo
        }
      }, null, 2));
      
      console.log(c('blue', `\n   📝 Relatório salvo em: ${reportFile}`));
    }

    // Status final
    if (totalErrors === 0) {
      console.log(c('green', '\n✅ Validação concluída - Nenhum erro crítico encontrado!\n'));
    } else {
      console.log(c('red', `\n⚠️  Validação concluída com ${totalErrors} erro(s) crítico(s)!\n`));
    }

  } catch (error) {
    console.error(c('red', `\n❌ ERRO: ${error.message}\n`));
    console.error(error.stack);
    process.exit(1);
  }
}

// ============================================
// EXECUÇÃO
// ============================================

const args = process.argv.slice(2);
const options = {
  deep: args.includes('--deep'),
  fix: args.includes('--fix'),
  report: args.includes('--report')
};

if (args.includes('--help') || args.includes('-h')) {
  console.log(c('blue', '\n📖 Uso: node scripts/validate-import.js [opcoes]\n'));
  console.log('Opções:');
  console.log('  --deep      Validação profunda (mais lenta, mais completa)');
  console.log('  --fix       Tenta corrigir problemas automaticamente (em desenvolvimento)');
  console.log('  --report    Gera relatório detalhado em JSON');
  console.log('  --help      Mostra esta ajuda\n');
  process.exit(0);
}

validate(options)
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(c('red', `\n❌ Erro: ${error.message}\n`));
    process.exit(1);
  });
