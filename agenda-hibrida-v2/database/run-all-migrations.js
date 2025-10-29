const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'agenda_hibrida.db');
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

console.log('🔄 Executando migrations do banco de dados...');
console.log(`📁 Banco de dados: ${DB_PATH}`);
console.log(`📂 Diretório de migrations: ${MIGRATIONS_DIR}`);

// Conectar ao banco de dados
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err);
    process.exit(1);
  }
  console.log('✅ Conectado ao banco de dados');
});

// Criar tabela de migrations se não existir
db.run(`
  CREATE TABLE IF NOT EXISTS migrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT UNIQUE NOT NULL,
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`, (err) => {
  if (err) {
    console.error('❌ Erro ao criar tabela migrations:', err);
    process.exit(1);
  }
  
  // Ler todos os arquivos .sql no diretório de migrations
  fs.readdir(MIGRATIONS_DIR, (err, files) => {
    if (err) {
      console.error('❌ Erro ao ler diretório de migrations:', err);
      process.exit(1);
    }
    
    const sqlFiles = files
      .filter(f => f.endsWith('.sql'))
      .sort(); // Executar em ordem alfabética
    
    console.log(`📊 Total de arquivos de migration: ${sqlFiles.length}`);
    
    // Verificar quais migrations já foram executadas
    db.all('SELECT filename FROM migrations', (err, rows) => {
      if (err) {
        console.error('❌ Erro ao consultar migrations executadas:', err);
        process.exit(1);
      }
      
      const executedMigrations = new Set(rows.map(r => r.filename));
      const pendingMigrations = sqlFiles.filter(f => !executedMigrations.has(f));
      
      console.log(`✅ Migrations já executadas: ${executedMigrations.size}`);
      console.log(`⏳ Migrations pendentes: ${pendingMigrations.length}`);
      
      if (pendingMigrations.length === 0) {
        console.log('\n✅ Todas as migrations já foram executadas!');
        db.close();
        return;
      }
      
      // Executar migrations pendentes
      executePendingMigrations(pendingMigrations, 0);
    });
  });
});

function executePendingMigrations(migrations, index) {
  if (index >= migrations.length) {
    console.log('\n✅ Todas as migrations foram executadas com sucesso!');
    db.close();
    return;
  }
  
  const filename = migrations[index];
  const filepath = path.join(MIGRATIONS_DIR, filename);
  
  console.log(`\n🔄 Executando migration ${index + 1}/${migrations.length}: ${filename}`);
  
  // Ler conteúdo do arquivo
  fs.readFile(filepath, 'utf-8', (err, sql) => {
    if (err) {
      console.error(`❌ Erro ao ler migration ${filename}:`, err);
      executePendingMigrations(migrations, index + 1);
      return;
    }
    
    // Separar comandos SQL por ponto e vírgula
    const commands = sql
      .split(';')
      .map(cmd => cmd.trim())
      .filter(cmd => cmd.length > 0 && !cmd.startsWith('--'));
    
    // Executar todos os comandos da migration
    executeCommands(commands, 0, filename, () => {
      // Registrar migration como executada
      db.run('INSERT INTO migrations (filename) VALUES (?)', [filename], (err) => {
        if (err) {
          console.error(`❌ Erro ao registrar migration ${filename}:`, err);
        } else {
          console.log(`✅ Migration ${filename} registrada`);
        }
        
        // Executar próxima migration
        executePendingMigrations(migrations, index + 1);
      });
    });
  });
}

function executeCommands(commands, index, filename, callback) {
  if (index >= commands.length) {
    console.log(`✅ Todos os comandos de ${filename} executados`);
    callback();
    return;
  }
  
  const command = commands[index];
  
  db.run(command, (err) => {
    if (err) {
      // Ignorar erros de tabela/coluna já existente
      if (err.message.includes('already exists') || 
          err.message.includes('duplicate column')) {
        console.log(`⚠️  Comando ${index + 1}/${commands.length}: já existe (ignorado)`);
      } else {
        console.error(`❌ Erro no comando ${index + 1}/${commands.length}:`, err.message);
        console.error('Comando:', command.substring(0, 100) + '...');
      }
    } else {
      console.log(`✅ Comando ${index + 1}/${commands.length} executado`);
    }
    
    // Executar próximo comando
    executeCommands(commands, index + 1, filename, callback);
  });
}

