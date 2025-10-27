#!/usr/bin/env node

/**
 * 🧹 Script de Limpeza de Dados de Teste
 * 
 * Remove dados de teste criados durante desenvolvimento, mantendo apenas dados reais.
 * 
 * O que limpa:
 * - Clientes de teste (MCP_*, *Teste*, emails de teste)
 * - Agendamentos vinculados a clientes de teste
 * - Tipos de tatuagem duplicados (já tratado, mas verifica)
 * 
 * Segurança:
 * - Cria backup automático antes de qualquer operação
 * - Modo dry-run disponível para preview
 * - Log detalhado de todas as operações
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

// Padrões de identificação de dados de teste
const TEST_PATTERNS = {
  names: ['MCP', 'Teste', 'Test', 'Demo', 'Example'],
  emails: ['mcp@', 'test@', 'teste@', 'demo@', 'example@', '.test'],
  phones: ['99999999', '00000000', '11111111']
};

// ============================================
// FUNÇÕES DE BACKUP
// ============================================

async function createBackup() {
  console.log('📦 Criando backup do banco de dados...');
  
  // Criar diretório de backups se não existir
  await fs.ensureDir(BACKUP_DIR);
  
  // Nome do backup com timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
  const backupPath = path.join(BACKUP_DIR, `pre-cleanup-${timestamp}.db`);
  
  // Copiar arquivo
  await fs.copy(DB_PATH, backupPath);
  
  console.log(`✅ Backup criado: ${backupPath}`);
  console.log(`📏 Tamanho: ${(await fs.stat(backupPath)).size / 1024 / 1024} MB`);
  
  return backupPath;
}

// ============================================
// FUNÇÕES DE LIMPEZA
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

function runQuery(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
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

async function findTestClients(db) {
  console.log('\n🔍 Identificando clientes de teste...');
  
  const conditions = [];
  const params = [];
  
  // Buscar por padrões no nome
  TEST_PATTERNS.names.forEach(pattern => {
    conditions.push('name LIKE ?');
    params.push(`%${pattern}%`);
  });
  
  // Buscar por padrões no email
  TEST_PATTERNS.emails.forEach(pattern => {
    conditions.push('email LIKE ?');
    params.push(`%${pattern}%`);
  });
  
  // Buscar por padrões no telefone
  TEST_PATTERNS.phones.forEach(pattern => {
    conditions.push('phone LIKE ?');
    params.push(`%${pattern}%`);
  });
  
  const sql = `
    SELECT id, name, email, phone, created_at
    FROM clients
    WHERE ${conditions.join(' OR ')}
    ORDER BY created_at DESC
  `;
  
  const testClients = await runQuery(db, sql, params);
  
  console.log(`📊 Encontrados ${testClients.length} clientes de teste:`);
  testClients.forEach(client => {
    console.log(`   - [${client.id}] ${client.name} (${client.email || 'sem email'})`);
  });
  
  return testClients;
}

async function findRelatedAppointments(db, clientIds) {
  if (clientIds.length === 0) return [];
  
  console.log('\n🔍 Buscando agendamentos vinculados...');
  
  const placeholders = clientIds.map(() => '?').join(',');
  const sql = `
    SELECT a.id, a.title, a.start_datetime, c.name as client_name
    FROM appointments a
    JOIN clients c ON a.client_id = c.id
    WHERE a.client_id IN (${placeholders})
    ORDER BY a.start_datetime DESC
  `;
  
  const appointments = await runQuery(db, sql, clientIds);
  
  console.log(`📊 Encontrados ${appointments.length} agendamentos vinculados:`);
  appointments.forEach(apt => {
    console.log(`   - [${apt.id}] ${apt.title} - ${apt.client_name} (${apt.start_datetime})`);
  });
  
  return appointments;
}

async function findTestAppointments(db) {
  console.log('\n🔍 Buscando agendamentos de teste (por descrição)...');
  
  const sql = `
    SELECT id, title, description, start_datetime
    FROM appointments
    WHERE description LIKE '%teste%'
       OR description LIKE '%test%'
       OR title LIKE '%Teste%'
       OR title LIKE '%Test%'
       OR title LIKE '%MCP%'
    ORDER BY start_datetime DESC
  `;
  
  const testAppointments = await runQuery(db, sql);
  
  console.log(`📊 Encontrados ${testAppointments.length} agendamentos de teste:`);
  testAppointments.forEach(apt => {
    console.log(`   - [${apt.id}] ${apt.title} (${apt.start_datetime})`);
  });
  
  return testAppointments;
}

async function findRelatedFiles(db, clientIds) {
  if (clientIds.length === 0) return [];
  
  console.log('\n🔍 Buscando arquivos vinculados...');
  
  const placeholders = clientIds.map(() => '?').join(',');
  const sql = `
    SELECT f.id, f.filename, f.filepath, c.name as client_name
    FROM files f
    LEFT JOIN clients c ON f.client_id = c.id
    WHERE f.client_id IN (${placeholders})
    ORDER BY f.created_at DESC
  `;
  
  const files = await runQuery(db, sql, clientIds);
  
  console.log(`📊 Encontrados ${files.length} arquivos vinculados:`);
  files.forEach(file => {
    console.log(`   - [${file.id}] ${file.filename} - ${file.client_name}`);
  });
  
  return files;
}

async function checkDuplicateTattooTypes(db) {
  console.log('\n🔍 Verificando duplicatas em Tipos de Tatuagem...');
  
  const sql = `
    SELECT name, COUNT(*) as count
    FROM tattoo_types
    GROUP BY name
    HAVING count > 1
    ORDER BY count DESC
  `;
  
  const duplicates = await runQuery(db, sql);
  
  if (duplicates.length > 0) {
    console.log(`⚠️  Encontradas ${duplicates.length} duplicatas:`);
    duplicates.forEach(dup => {
      console.log(`   - "${dup.name}": ${dup.count} registros`);
    });
  } else {
    console.log('✅ Nenhuma duplicata encontrada em Tipos de Tatuagem');
  }
  
  return duplicates;
}

async function deleteClients(db, clientIds) {
  if (clientIds.length === 0) return 0;
  
  console.log(`\n🗑️  Removendo ${clientIds.length} clientes de teste...`);
  
  const placeholders = clientIds.map(() => '?').join(',');
  const sql = `DELETE FROM clients WHERE id IN (${placeholders})`;
  
  if (DRY_RUN) {
    console.log('   [DRY-RUN] SQL:', sql);
    return 0;
  }
  
  const result = await runStatement(db, sql, clientIds);
  console.log(`✅ ${result.changes} clientes removidos`);
  
  return result.changes;
}

async function deleteAppointments(db, appointmentIds) {
  if (appointmentIds.length === 0) return 0;
  
  console.log(`\n🗑️  Removendo ${appointmentIds.length} agendamentos...`);
  
  const placeholders = appointmentIds.map(() => '?').join(',');
  const sql = `DELETE FROM appointments WHERE id IN (${placeholders})`;
  
  if (DRY_RUN) {
    console.log('   [DRY-RUN] SQL:', sql);
    return 0;
  }
  
  const result = await runStatement(db, sql, appointmentIds);
  console.log(`✅ ${result.changes} agendamentos removidos`);
  
  return result.changes;
}

async function deleteFiles(db, fileIds) {
  if (fileIds.length === 0) return 0;
  
  console.log(`\n🗑️  Removendo ${fileIds.length} arquivos da base de dados...`);
  
  const placeholders = fileIds.map(() => '?').join(',');
  const sql = `DELETE FROM files WHERE id IN (${placeholders})`;
  
  if (DRY_RUN) {
    console.log('   [DRY-RUN] SQL:', sql);
    console.log('   ⚠️  Nota: Arquivos físicos não serão removidos no dry-run');
    return 0;
  }
  
  const result = await runStatement(db, sql, fileIds);
  console.log(`✅ ${result.changes} registros de arquivos removidos`);
  console.log(`   ⚠️  Nota: Arquivos físicos ainda existem em 'uploads/' - remova manualmente se necessário`);
  
  return result.changes;
}

// ============================================
// FUNÇÃO PRINCIPAL
// ============================================

async function cleanup() {
  console.log('🧹 ============================================');
  console.log('🧹 LIMPEZA DE DADOS DE TESTE');
  console.log('🧹 ============================================\n');
  
  if (DRY_RUN) {
    console.log('⚠️  MODO DRY-RUN: Nenhuma alteração será feita\n');
  }
  
  try {
    // 1. Backup
    let backupPath = null;
    if (!DRY_RUN) {
      backupPath = await createBackup();
    } else {
      console.log('📦 [DRY-RUN] Backup seria criado aqui\n');
    }
    
    // 2. Conectar ao banco
    console.log('🔌 Conectando ao banco de dados...');
    const db = await openDatabase();
    console.log('✅ Conectado\n');
    
    // 3. Identificar dados de teste
    const testClients = await findTestClients(db);
    const clientIds = testClients.map(c => c.id);
    
    const relatedAppointments = await findRelatedAppointments(db, clientIds);
    const testAppointments = await findTestAppointments(db);
    
    // Combinar IDs de agendamentos (evitar duplicatas)
    const allAppointmentIds = [
      ...new Set([
        ...relatedAppointments.map(a => a.id),
        ...testAppointments.map(a => a.id)
      ])
    ];
    
    const relatedFiles = await findRelatedFiles(db, clientIds);
    const fileIds = relatedFiles.map(f => f.id);
    
    const duplicateTattooTypes = await checkDuplicateTattooTypes(db);
    
    // 4. Resumo
    console.log('\n📊 ============================================');
    console.log('📊 RESUMO DA LIMPEZA');
    console.log('📊 ============================================');
    console.log(`   Clientes de teste: ${clientIds.length}`);
    console.log(`   Agendamentos: ${allAppointmentIds.length}`);
    console.log(`   Arquivos: ${fileIds.length}`);
    console.log(`   Duplicatas Tipos Tatuagem: ${duplicateTattooTypes.length}`);
    console.log('');
    
    // 5. Confirmar
    if (!DRY_RUN) {
      console.log('⚠️  ATENÇÃO: Esta operação não pode ser desfeita!');
      console.log(`   (Backup disponível em: ${backupPath})\n`);
      
      // Se estiver rodando de forma não-interativa, apenas continue
      // (assumindo que o usuário já aprovou ao executar o script)
    }
    
    // 6. Executar limpeza
    if (clientIds.length > 0 || allAppointmentIds.length > 0 || fileIds.length > 0) {
      console.log('\n🗑️  Executando limpeza...');
      
      // Ordem importante: deletar relacionamentos primeiro
      await deleteFiles(db, fileIds);
      await deleteAppointments(db, allAppointmentIds);
      await deleteClients(db, clientIds);
      
      if (!DRY_RUN) {
        // Vacuum para reclamar espaço
        console.log('\n🔧 Otimizando banco de dados (VACUUM)...');
        await runStatement(db, 'VACUUM');
        console.log('✅ Banco otimizado');
      }
    } else {
      console.log('\n✅ Nenhum dado de teste encontrado! Banco já está limpo.');
    }
    
    // 7. Fechar conexão
    await closeDatabase(db);
    console.log('\n🔌 Conexão fechada');
    
    // 8. Resultado final
    console.log('\n✅ ============================================');
    if (DRY_RUN) {
      console.log('✅ DRY-RUN CONCLUÍDO - Nenhuma alteração foi feita');
      console.log('✅ Execute sem --dry-run para aplicar as mudanças');
    } else {
      console.log('✅ LIMPEZA CONCLUÍDA COM SUCESSO!');
      console.log(`✅ Backup disponível em: ${backupPath}`);
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
  process.exit(1);
}

// Executar limpeza
cleanup();

