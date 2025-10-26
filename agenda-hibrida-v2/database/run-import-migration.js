/**
 * Script para executar migração de suporte a importações
 * Adiciona colunas e tabelas necessárias para Vagaro, ICS e Google Calendar
 */

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'agenda_hibrida.db');
const MIGRATION_PATH = path.join(__dirname, 'migration-imports.sql');

console.log('🔄 Iniciando migration de importações...');
console.log(`📁 Banco de dados: ${DB_PATH}`);
console.log(`📄 Migration: ${MIGRATION_PATH}`);

// Verificar se o banco existe
if (!fs.existsSync(DB_PATH)) {
  console.error('❌ Banco de dados não encontrado. Execute primeiro: npm run migrate');
  process.exit(1);
}

// Conectar ao banco de dados
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err);
    process.exit(1);
  }
  console.log('✅ Conectado ao banco de dados');
});

// Ler o arquivo de migração
const migration = fs.readFileSync(MIGRATION_PATH, 'utf-8');

// Remover comentários de linha
const cleanedMigration = migration
  .split('\n')
  .filter(line => !line.trim().startsWith('--'))
  .join('\n');

// Separar comandos SQL por ponto e vírgula
const commands = cleanedMigration
  .split(';')
  .map(cmd => cmd.trim())
  .filter(cmd => cmd.length > 0);

console.log(`📊 Total de comandos SQL: ${commands.length}`);

// Função para executar comandos em série
function executeCommands(index = 0) {
  if (index >= commands.length) {
    console.log('✅ Migration concluída com sucesso!');
    
    // Verificar estrutura final
    db.all(`
      SELECT name, sql 
      FROM sqlite_master 
      WHERE type='table' 
      AND name IN ('google_oauth_tokens', 'import_logs', 'sync_settings')
    `, (err, tables) => {
      if (err) {
        console.error('❌ Erro ao verificar tabelas:', err);
      } else {
        console.log('\n📊 Novas tabelas criadas:');
        tables.forEach(table => {
          console.log(`   ✅ ${table.name}`);
        });
      }
      
      // Fechar conexão
      db.close((err) => {
        if (err) {
          console.error('❌ Erro ao fechar banco de dados:', err);
        } else {
          console.log('\n✅ Banco de dados atualizado e fechado com sucesso!');
          console.log('\n🎉 Sistema pronto para importações!');
          console.log('\n📝 Próximos passos:');
          console.log('   1. Configure as variáveis de ambiente (.env)');
          console.log('   2. Adicione suas credenciais do Google OAuth');
          console.log('   3. Execute: npm install (para instalar novas dependências)');
          console.log('   4. Inicie o servidor: npm start');
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
      // Ignorar alguns erros comuns
      if (err.message.includes('duplicate column name') ||
          err.message.includes('already exists') ||
          err.message.includes('UNIQUE constraint failed')) {
        console.log(`⚠️  Comando ${index + 1}/${commands.length} - já existente (ignorado)`);
      } else {
        console.error(`❌ Erro ao executar comando ${index + 1}:`, err.message);
        console.error('Comando:', command.substring(0, 150) + '...');
      }
    } else {
      console.log(`✅ Comando ${index + 1}/${commands.length} executado`);
    }
    
    // Executar próximo comando
    executeCommands(index + 1);
  });
}

// Iniciar execução
executeCommands();
