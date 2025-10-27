/**
 * Script para aplicar índices de performance no banco de dados
 * Migration 003: Performance Indexes
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'agenda_hibrida.db');
const MIGRATION_FILE = path.join(__dirname, '..', 'database', 'migrations', '003-add-performance-indexes.sql');

console.log('🚀 Iniciando aplicação de índices de performance...\n');

// Verificar se banco existe
if (!fs.existsSync(DB_PATH)) {
  console.error('❌ Banco de dados não encontrado:', DB_PATH);
  process.exit(1);
}

// Verificar se migration existe
if (!fs.existsSync(MIGRATION_FILE)) {
  console.error('❌ Arquivo de migration não encontrado:', MIGRATION_FILE);
  process.exit(1);
}

// Conectar ao banco
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco:', err.message);
    process.exit(1);
  }
  console.log('✅ Conectado ao banco de dados');
});

// Ler arquivo SQL
const migrationSQL = fs.readFileSync(MIGRATION_FILE, 'utf8');

// Dividir em comandos individuais
const commands = migrationSQL
  .split(';')
  .map(cmd => cmd.trim())
  .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

console.log(`📝 ${commands.length} comandos SQL a executar\n`);

// Executar comandos sequencialmente
let successCount = 0;
let errorCount = 0;

function executeCommand(index) {
  if (index >= commands.length) {
    // Finalizar
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Comandos executados: ${successCount}`);
    console.log(`❌ Comandos com erro: ${errorCount}`);
    console.log('='.repeat(60) + '\n');

    if (errorCount === 0) {
      console.log('🎉 Índices de performance aplicados com sucesso!\n');
      
      // Verificar índices criados
      db.all(`SELECT name, sql FROM sqlite_master WHERE type='index' AND name LIKE 'idx_%' ORDER BY name`, [], (err, rows) => {
        if (err) {
          console.error('❌ Erro ao listar índices:', err.message);
        } else {
          console.log(`\n📊 Total de índices criados: ${rows.length}\n`);
          rows.forEach(row => {
            console.log(`  ✓ ${row.name}`);
          });
        }
        
        // Fechar conexão
        db.close((err) => {
          if (err) {
            console.error('❌ Erro ao fechar banco:', err.message);
            process.exit(1);
          }
          console.log('\n✅ Migração concluída com sucesso!');
          process.exit(0);
        });
      });
    } else {
      console.log('⚠️  Migração concluída com erros.');
      db.close();
      process.exit(1);
    }
    return;
  }

  const command = commands[index];
  
  // Extrair tipo de comando (para logging)
  let commandType = 'COMANDO';
  if (command.toUpperCase().includes('CREATE INDEX')) {
    const match = command.match(/CREATE INDEX IF NOT EXISTS\s+(\w+)/i);
    commandType = match ? `CRIANDO ÍNDICE: ${match[1]}` : 'CRIANDO ÍNDICE';
  } else if (command.toUpperCase().includes('ANALYZE')) {
    commandType = 'ANALISANDO BANCO';
  } else if (command.toUpperCase().includes('VACUUM')) {
    commandType = 'COMPACTANDO BANCO';
  }

  console.log(`[${index + 1}/${commands.length}] ${commandType}...`);

  db.run(command, (err) => {
    if (err) {
      // Ignorar erro "already exists" para índices
      if (err.message.includes('already exists')) {
        console.log(`  ℹ️  Índice já existe, pulando...`);
        successCount++;
      } else {
        console.error(`  ❌ Erro: ${err.message}`);
        errorCount++;
      }
    } else {
      console.log(`  ✓ Sucesso`);
      successCount++;
    }

    // Próximo comando
    executeCommand(index + 1);
  });
}

// Iniciar execução
executeCommand(0);

