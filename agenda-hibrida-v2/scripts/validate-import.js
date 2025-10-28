#!/usr/bin/env node

/**
 * Script de Validação de Dados Importados do Vagaro
 * 
 * Verifica integridade e consistência dos dados após importação
 * 
 * Uso:
 *   node scripts/validate-import.js
 *   node scripts/validate-import.js --verbose
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Parse argumentos
const args = process.argv.slice(2).reduce((acc, arg) => {
  acc[arg.replace('--', '')] = true;
  return acc;
}, {});

const verbose = args.verbose;

/**
 * Helper para queries
 */
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

/**
 * Validações
 */
async function main() {
  console.log('\n╔═════════════════════════════════════════════════════════════╗');
  console.log('║         VALIDAÇÃO DE DADOS IMPORTADOS DO VAGARO            ║');
  console.log('╚═════════════════════════════════════════════════════════════╝\n');
  
  const dbPath = path.join(__dirname, '..', 'agenda_hibrida.db');
  const db = new sqlite3.Database(dbPath);
  
  const issues = [];
  
  // 1. Validar Clientes
  console.log('📋 1. Validando CLIENTES...');
  
  const clientsTotal = await queryDb(db, 'SELECT COUNT(*) as count FROM clients');
  const clientsVagaro = await queryDb(db, 'SELECT COUNT(*) as count FROM clients WHERE import_source = "vagaro"');
  
  console.log(`   ✅ Total de clientes: ${clientsTotal.count}`);
  console.log(`   ✅ Clientes do Vagaro: ${clientsVagaro.count}`);
  
  // Clientes sem nome
  const clientsNoName = await queryDb(db, 'SELECT COUNT(*) as count FROM clients WHERE name IS NULL OR name = ""');
  if (clientsNoName.count > 0) {
    issues.push(`⚠️  ${clientsNoName.count} cliente(s) sem nome`);
  }
  
  // Clientes duplicados por email
  const duplicateEmails = await allDb(db, `
    SELECT email, COUNT(*) as count 
    FROM clients 
    WHERE email IS NOT NULL AND email != ''
    GROUP BY LOWER(email)
    HAVING count > 1
  `);
  if (duplicateEmails.length > 0) {
    issues.push(`⚠️  ${duplicateEmails.length} email(s) duplicado(s)`);
    if (verbose) {
      duplicateEmails.forEach(d => console.log(`      - ${d.email}: ${d.count} ocorrências`));
    }
  }
  
  // 2. Validar Transações
  console.log('\n💳 2. Validando TRANSAÇÕES...');
  
  const transTotal = await queryDb(db, 'SELECT COUNT(*) as count FROM vagaro_transactions');
  const transWithClient = await queryDb(db, 'SELECT COUNT(*) as count FROM vagaro_transactions WHERE client_id IS NOT NULL');
  
  console.log(`   ✅ Total de transações: ${transTotal.count}`);
  console.log(`   ✅ Vinculadas a clientes: ${transWithClient.count}`);
  
  if (transTotal.count > 0) {
    const linkageRate = (transWithClient.count / transTotal.count * 100).toFixed(2);
    console.log(`   📊 Taxa de vinculação: ${linkageRate}%`);
    
    if (linkageRate < 50) {
      issues.push(`⚠️  Baixa taxa de vinculação de transações (${linkageRate}%)`);
    }
  }
  
  // Validar valores
  const transNegative = await queryDb(db, 'SELECT COUNT(*) as count FROM vagaro_transactions WHERE net_amount < 0');
  if (transNegative.count > 0) {
    console.log(`   ℹ️  ${transNegative.count} transação(ões) com valor negativo (reembolsos)`);
  }
  
  // Somar valores totais
  const totalGross = await queryDb(db, 'SELECT SUM(gross_amount) as total FROM vagaro_transactions');
  const totalNet = await queryDb(db, 'SELECT SUM(net_amount) as total FROM vagaro_transactions');
  const totalFees = await queryDb(db, 'SELECT SUM(total_fee) as total FROM vagaro_transactions');
  
  if (verbose && transTotal.count > 0) {
    console.log(`   💰 Valor bruto total: $${(totalGross.total || 0).toFixed(2)}`);
    console.log(`   💰 Valor líquido total: $${(totalNet.total || 0).toFixed(2)}`);
    console.log(`   💸 Total em taxas: $${(totalFees.total || 0).toFixed(2)}`);
  }
  
  // 3. Validar Serviços
  console.log('\n🔧 3. Validando SERVIÇOS...');
  
  const servicesTotal = await queryDb(db, 'SELECT COUNT(*) as count FROM vagaro_services');
  const servicesActive = await queryDb(db, 'SELECT COUNT(*) as count FROM vagaro_services WHERE is_active = 1');
  
  console.log(`   ✅ Total de serviços: ${servicesTotal.count}`);
  console.log(`   ✅ Serviços ativos: ${servicesActive.count}`);
  
  if (servicesTotal.count > 0) {
    const topServices = await allDb(db, `
      SELECT service_name, total_appointments, service_sales
      FROM vagaro_services
      WHERE is_active = 1
      ORDER BY total_appointments DESC
      LIMIT 3
    `);
    
    if (verbose && topServices.length > 0) {
      console.log('   📊 Top 3 serviços:');
      topServices.forEach((s, i) => {
        console.log(`      ${i + 1}. ${s.service_name} - ${s.total_appointments} agendamentos - $${s.service_sales}`);
      });
    }
  }
  
  // 4. Validar Gift Cards
  console.log('\n🎁 4. Validando GIFT CARDS...');
  
  const giftsTotal = await queryDb(db, 'SELECT COUNT(*) as count FROM vagaro_gift_cards');
  const giftsActive = await queryDb(db, 'SELECT COUNT(*) as count FROM vagaro_gift_cards WHERE status = "outstanding"');
  const giftsTotalBalance = await queryDb(db, 'SELECT SUM(current_balance) as total FROM vagaro_gift_cards WHERE status = "outstanding"');
  
  console.log(`   ✅ Total de gift cards: ${giftsTotal.count}`);
  console.log(`   ✅ Gift cards ativos: ${giftsActive.count}`);
  if (giftsActive.count > 0) {
    console.log(`   💰 Saldo total ativo: $${(giftsTotalBalance.total || 0).toFixed(2)}`);
  }
  
  // Gift cards expirados
  const giftsExpired = await queryDb(db, `
    SELECT COUNT(*) as count 
    FROM vagaro_gift_cards 
    WHERE expire_on IS NOT NULL 
    AND expire_on < date('now')
    AND status = 'outstanding'
  `);
  if (giftsExpired.count > 0) {
    issues.push(`⚠️  ${giftsExpired.count} gift card(s) ativo(s) mas expirado(s)`);
  }
  
  // 5. Validar Formulários
  console.log('\n📋 5. Validando FORMULÁRIOS...');
  
  const formsTotal = await queryDb(db, 'SELECT COUNT(*) as count FROM vagaro_forms');
  const formsUnsigned = await queryDb(db, 'SELECT COUNT(*) as count FROM vagaro_forms WHERE signature_status = "unsigned"');
  
  console.log(`   ✅ Total de formulários: ${formsTotal.count}`);
  console.log(`   ⚠️  Não assinados: ${formsUnsigned.count}`);
  
  if (formsTotal.count > 0) {
    const signatureRate = ((formsTotal.count - formsUnsigned.count) / formsTotal.count * 100).toFixed(2);
    console.log(`   📊 Taxa de assinatura: ${signatureRate}%`);
  }
  
  // 6. Integridade Referencial
  console.log('\n🔗 6. Verificando INTEGRIDADE REFERENCIAL...');
  
  // Transações órfãs (cliente não existe)
  const orphanTrans = await queryDb(db, `
    SELECT COUNT(*) as count 
    FROM vagaro_transactions t
    WHERE t.client_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM clients c WHERE c.id = t.client_id)
  `);
  if (orphanTrans.count > 0) {
    issues.push(`❌ ${orphanTrans.count} transação(ões) com client_id inválido`);
  } else {
    console.log('   ✅ Transações: todas com vínculos válidos');
  }
  
  // Gift cards órfãos
  const orphanGifts = await queryDb(db, `
    SELECT COUNT(*) as count 
    FROM vagaro_gift_cards g
    WHERE g.client_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM clients c WHERE c.id = g.client_id)
  `);
  if (orphanGifts.count > 0) {
    issues.push(`❌ ${orphanGifts.count} gift card(s) com client_id inválido`);
  } else {
    console.log('   ✅ Gift Cards: todos com vínculos válidos');
  }
  
  // Formulários órfãos
  const orphanForms = await queryDb(db, `
    SELECT COUNT(*) as count 
    FROM vagaro_forms f
    WHERE f.client_id IS NOT NULL
    AND NOT EXISTS (SELECT 1 FROM clients c WHERE c.id = f.client_id)
  `);
  if (orphanForms.count > 0) {
    issues.push(`❌ ${orphanForms.count} formulário(s) com client_id inválido`);
  } else {
    console.log('   ✅ Formulários: todos com vínculos válidos');
  }
  
  // 7. Relatório Final
  console.log('\n╔═════════════════════════════════════════════════════════════╗');
  console.log('║                   RESULTADO FINAL                           ║');
  console.log('╚═════════════════════════════════════════════════════════════╝\n');
  
  if (issues.length === 0) {
    console.log('✅ PARABÉNS! Nenhum problema encontrado.');
    console.log('   Todos os dados estão íntegros e consistentes.\n');
  } else {
    console.log(`⚠️  ${issues.length} PROBLEMA(S) ENCONTRADO(S):\n`);
    issues.forEach((issue, i) => {
      console.log(`   ${i + 1}. ${issue}`);
    });
    console.log('\n💡 Recomendação: Revise os dados e reimporte se necessário.\n');
  }
  
  db.close();
  
  process.exit(issues.length === 0 ? 0 : 1);
}

// Executar
main().catch(error => {
  console.error('\n💥 ERRO:', error.message);
  console.error(error.stack);
  process.exit(1);
});

