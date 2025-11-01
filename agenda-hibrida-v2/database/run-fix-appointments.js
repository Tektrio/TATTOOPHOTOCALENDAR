const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'agenda_hibrida.db');
const MIGRATION_PATH = path.join(__dirname, 'migrations', '005-fix-appointments-complete.sql');

console.log('🔄 Executando correção do schema de appointments...');
console.log(`📁 Banco de dados: ${DB_PATH}`);
console.log(`📄 Migration: ${MIGRATION_PATH}`);

// Conectar ao banco de dados
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err);
    process.exit(1);
  }
  console.log('✅ Conectado ao banco de dados');
});

// Ler o arquivo de migration
const migration = fs.readFileSync(MIGRATION_PATH, 'utf-8');

// Separar comandos SQL por ponto e vírgula
const commands = migration
  .split(';')
  .map(cmd => cmd.trim())
  .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));

console.log(`📊 Total de comandos SQL: ${commands.length}`);

// Contador de sucessos e erros
let successCount = 0;
let errorCount = 0;
let duplicateCount = 0;

// Função para executar comandos em série
function executeCommands(index = 0) {
  if (index >= commands.length) {
    console.log('\n✅ Migration concluída!');
    console.log(`\n📊 Resumo:`);
    console.log(`   - ✅ Sucessos: ${successCount}`);
    console.log(`   - ⚠️  Colunas já existentes: ${duplicateCount}`);
    console.log(`   - ❌ Erros: ${errorCount}`);
    
    // Verificar schema final
    console.log('\n🔍 Verificando schema da tabela appointments...');
    db.all(`PRAGMA table_info(appointments)`, (err, columns) => {
      if (err) {
        console.error('❌ Erro ao verificar schema:', err);
      } else {
        console.log(`\n📋 Colunas da tabela appointments (${columns.length} total):`);
        columns.forEach(col => {
          console.log(`   - ${col.name} (${col.type})`);
        });
      }
      
      // Fechar conexão
      db.close((err) => {
        if (err) {
          console.error('❌ Erro ao fechar banco de dados:', err);
        } else {
          console.log('\n✅ Banco de dados fechado com sucesso!');
          console.log('\n🎉 Sistema pronto para uso!');
        }
      });
    });
    
    return;
  }
  
  const command = commands[index];
  if (!command) {
    executeCommands(index + 1);
    return;
  }
  
  db.run(command, (err) => {
    if (err) {
      // Ignorar erros de coluna já existente
      if (err.message.includes('duplicate column name')) {
        duplicateCount++;
        // Extrair nome da coluna do comando
        const match = command.match(/ADD COLUMN (\w+)/i);
        const columnName = match ? match[1] : '?';
        console.log(`⚠️  Coluna ${columnName} já existe (pulando)`);
      } else if (err.message.includes('already exists')) {
        duplicateCount++;
        console.log(`⚠️  Índice já existe (pulando)`);
      } else {
        errorCount++;
        console.error(`❌ Erro ao executar comando ${index + 1}:`, err.message);
        console.error('Comando:', command.substring(0, 100) + '...');
      }
    } else {
      successCount++;
      // Identificar tipo de comando
      if (command.toUpperCase().includes('ALTER TABLE')) {
        const match = command.match(/ADD COLUMN (\w+)/i);
        const columnName = match ? match[1] : '?';
        console.log(`✅ [${index + 1}/${commands.length}] Coluna ${columnName} adicionada`);
      } else if (command.toUpperCase().includes('CREATE INDEX')) {
        const match = command.match(/CREATE INDEX (?:IF NOT EXISTS )?(\w+)/i);
        const indexName = match ? match[1] : '?';
        console.log(`✅ [${index + 1}/${commands.length}] Índice ${indexName} criado`);
      } else if (command.toUpperCase().includes('UPDATE')) {
        console.log(`✅ [${index + 1}/${commands.length}] Dados migrados`);
      } else {
        console.log(`✅ [${index + 1}/${commands.length}] Comando executado`);
      }
    }
    
    // Executar próximo comando
    executeCommands(index + 1);
  });
}

// Iniciar execução
executeCommands();



