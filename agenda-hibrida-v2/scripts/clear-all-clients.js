#!/usr/bin/env node

/**
 * 🧹 Script de Limpeza Total de Clientes
 * 
 * Remove TODOS os clientes e dados relacionados do banco de dados.
 * Útil para resetar o sistema antes de fazer importações de teste.
 * 
 * O que remove:
 * - Todos os clientes
 * - Todos os agendamentos vinculados
 * - Todos os arquivos vinculados
 * - Todas as estatísticas de clientes
 * 
 * Segurança:
 * - Cria backup automático antes de qualquer operação
 * - Modo dry-run disponível para preview
 * - Log detalhado de todas as operações
 * 
 * Uso:
 *   node scripts/clear-all-clients.js              # Executa a limpeza
 *   node scripts/clear-all-clients.js --dry-run    # Apenas mostra o que seria removido
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs-extra');
const path = require('path');

// ============================================
// CONFIGURAÇÕES
// ============================================

const DB_PATH = path.join(__dirname, '..', 'agenda_hibrida.db');
const BACKUP_DIR = path.join(__dirname, '..', 'backups');
const DRY_RUN = process.argv.includes('--dry-run');

// ============================================
// FUNÇÕES DE BACKUP
// ============================================

async function createBackup() {
  console.log('📦 Criando backup do banco de dados...');
  
  // Criar diretório de backups se não existir
  await fs.ensureDir(BACKUP_DIR);
  
  // Nome do backup com timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupPath = path.join(BACKUP_DIR, `before-clear-clients-${timestamp}.db`);
  
  // Copiar banco
  await fs.copy(DB_PATH, backupPath);
  
  console.log(`✅ Backup criado: ${backupPath}`);
  return backupPath;
}

// ============================================
// FUNÇÕES DE BANCO DE DADOS
// ============================================

function openDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) reject(err);
      else resolve(db);
    });
  });
}

function closeDatabase(db) {
  return new Promise((resolve, reject) => {
    db.close((err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

function runStatement(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

function getRow(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

function getAllRows(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// ============================================
// FUNÇÕES DE ANÁLISE
// ============================================

async function analyzeData(db) {
  console.log('\n📊 Analisando dados...\n');
  
  // Contar clientes
  const clientsCount = await getRow(db, 'SELECT COUNT(*) as total FROM clients');
  console.log(`   👥 Clientes: ${clientsCount.total}`);
  
  // Contar agendamentos
  const appointmentsCount = await getRow(db, 
    'SELECT COUNT(*) as total FROM appointments WHERE client_id IS NOT NULL'
  );
  console.log(`   📅 Agendamentos vinculados: ${appointmentsCount.total}`);
  
  // Contar arquivos
  const filesCount = await getRow(db, 
    'SELECT COUNT(*) as total FROM files WHERE client_id IS NOT NULL'
  );
  console.log(`   📁 Arquivos vinculados: ${filesCount.total}`);
  
  // Contar estatísticas
  const statsCount = await getRow(db, 
    'SELECT COUNT(*) as total FROM client_statistics'
  );
  console.log(`   📈 Estatísticas de clientes: ${statsCount.total}`);
  
  return {
    clients: clientsCount.total,
    appointments: appointmentsCount.total,
    files: filesCount.total,
    statistics: statsCount.total
  };
}

// ============================================
// FUNÇÕES DE LIMPEZA
// ============================================

async function clearAppointments(db, clientIds) {
  if (clientIds.length === 0) return 0;
  
  console.log(`\n🗑️  Removendo agendamentos vinculados aos clientes...`);
  
  const placeholders = clientIds.map(() => '?').join(',');
  const sql = `DELETE FROM appointments WHERE client_id IN (${placeholders})`;
  
  if (DRY_RUN) {
    console.log('   [DRY-RUN] SQL:', sql.slice(0, 100) + '...');
    return 0;
  }
  
  const result = await runStatement(db, sql, clientIds);
  console.log(`✅ ${result.changes} agendamentos removidos`);
  
  return result.changes;
}

async function clearFiles(db, clientIds) {
  if (clientIds.length === 0) return 0;
  
  console.log(`\n🗑️  Removendo arquivos vinculados aos clientes...`);
  
  const placeholders = clientIds.map(() => '?').join(',');
  const sql = `DELETE FROM files WHERE client_id IN (${placeholders})`;
  
  if (DRY_RUN) {
    console.log('   [DRY-RUN] SQL:', sql.slice(0, 100) + '...');
    return 0;
  }
  
  const result = await runStatement(db, sql, clientIds);
  console.log(`✅ ${result.changes} arquivos removidos`);
  
  return result.changes;
}

async function clearClientStatistics(db) {
  console.log(`\n🗑️  Removendo estatísticas de clientes...`);
  
  const sql = 'DELETE FROM client_statistics';
  
  if (DRY_RUN) {
    console.log('   [DRY-RUN] SQL:', sql);
    return 0;
  }
  
  const result = await runStatement(db, sql);
  console.log(`✅ ${result.changes} registros de estatísticas removidos`);
  
  return result.changes;
}

async function clearClients(db) {
  console.log(`\n🗑️  Removendo todos os clientes...`);
  
  const sql = 'DELETE FROM clients';
  
  if (DRY_RUN) {
    console.log('   [DRY-RUN] SQL:', sql);
    return 0;
  }
  
  const result = await runStatement(db, sql);
  console.log(`✅ ${result.changes} clientes removidos`);
  
  return result.changes;
}

async function optimizeDatabase(db) {
  console.log('\n🔧 Otimizando banco de dados (VACUUM)...');
  
  if (DRY_RUN) {
    console.log('   [DRY-RUN] VACUUM');
    return;
  }
  
  await runStatement(db, 'VACUUM');
  console.log('✅ Banco otimizado');
}

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

async function clearAllClients() {
  console.log('🧹 ============================================');
  console.log('🧹 LIMPEZA TOTAL DE CLIENTES');
  console.log('🧹 ============================================\n');
  
  if (DRY_RUN) {
    console.log('⚠️  MODO DRY-RUN: Nenhuma alteração será feita\n');
  }
  
  try {
    // 1. Verificar se o banco existe
    if (!await fs.pathExists(DB_PATH)) {
      console.error(`❌ Banco de dados não encontrado: ${DB_PATH}`);
      process.exit(1);
    }
    
    // 2. Abrir banco
    console.log('🔌 Conectando ao banco de dados...');
    const db = await openDatabase();
    console.log('✅ Conectado');
    
    // 3. Analisar dados
    const stats = await analyzeData(db);
    
    if (stats.clients === 0) {
      console.log('\n✅ Nenhum cliente encontrado! Banco já está limpo.');
      await closeDatabase(db);
      process.exit(0);
    }
    
    // 4. Criar backup (apenas se não for dry-run)
    let backupPath = null;
    if (!DRY_RUN) {
      backupPath = await createBackup();
    }
    
    console.log('');
    
    // 5. Confirmar
    if (!DRY_RUN) {
      console.log('⚠️  ATENÇÃO: Esta operação irá remover:');
      console.log(`   - ${stats.clients} clientes`);
      console.log(`   - ${stats.appointments} agendamentos`);
      console.log(`   - ${stats.files} arquivos`);
      console.log(`   - ${stats.statistics} registros de estatísticas`);
      console.log('');
      console.log('⚠️  Esta operação não pode ser desfeita!');
      console.log(`   (Backup disponível em: ${backupPath})\n`);
    }
    
    // 6. Buscar IDs dos clientes
    console.log('\n📋 Buscando IDs dos clientes...');
    const clientRows = await getAllRows(db, 'SELECT id FROM clients');
    const clientIds = clientRows.map(row => row.id);
    console.log(`✅ ${clientIds.length} clientes encontrados`);
    
    // 7. Executar limpeza
    if (clientIds.length > 0) {
      console.log('\n🗑️  Executando limpeza...');
      
      // Ordem importante: deletar relacionamentos primeiro
      await clearFiles(db, clientIds);
      await clearAppointments(db, clientIds);
      await clearClientStatistics(db);
      await clearClients(db);
      
      if (!DRY_RUN) {
        await optimizeDatabase(db);
      }
    }
    
    // 8. Fechar conexão
    await closeDatabase(db);
    console.log('\n🔌 Conexão fechada');
    
    // 9. Resultado final
    console.log('\n✅ ============================================');
    if (DRY_RUN) {
      console.log('✅ DRY-RUN CONCLUÍDO - Nenhuma alteração foi feita');
      console.log('✅ Execute sem --dry-run para aplicar as mudanças');
    } else {
      console.log('✅ LIMPEZA CONCLUÍDA COM SUCESSO!');
      console.log(`✅ Backup disponível em: ${backupPath}`);
      console.log('✅ O banco está pronto para importação de novos dados');
    }
    console.log('✅ ============================================\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ ERRO durante limpeza:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

// ============================================
// EXECUTAR
// ============================================

// Verificar se o banco existe
if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ Banco de dados não encontrado: ${DB_PATH}`);
  console.error('   Execute este script a partir do diretório raiz do backend');
  process.exit(1);
}

// Executar limpeza
clearAllClients();

