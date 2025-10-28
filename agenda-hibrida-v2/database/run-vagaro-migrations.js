#!/usr/bin/env node

/**
 * Script para executar migrations do Vagaro
 * Executa as migrations 008-012 de forma segura
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, '..', 'agenda_hibrida.db');
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

const migrations = [
  '008-vagaro-complete-clients.sql',
  '009-vagaro-transactions.sql',
  '010-vagaro-services.sql',
  '011-vagaro-giftcards.sql',
  '012-vagaro-forms.sql'
];

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║         EXECUTANDO MIGRATIONS DO VAGARO                    ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

async function runMigrations() {
  // Abrir banco de dados
  const db = new sqlite3.Database(DB_PATH);
  
  // Configurar WAL mode
  await new Promise((resolve, reject) => {
    db.run('PRAGMA journal_mode = WAL', (err) => {
      if (err) reject(err);
      else {
        console.log('✅ SQLite: journal_mode = WAL');
        resolve();
      }
    });
  });

  // Criar tabela de controle de migrations se não existir
  await new Promise((resolve, reject) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE NOT NULL,
        executed_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

  let executedCount = 0;
  let skippedCount = 0;

  // Executar cada migration
  for (const migrationFile of migrations) {
    // Verificar se já foi executada
    const alreadyExecuted = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM migrations WHERE filename = ?', [migrationFile], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    if (alreadyExecuted) {
      console.log(`⏭️  PULANDO: ${migrationFile} (já executada)`);
      skippedCount++;
      continue;
    }

    console.log(`\n📝 Executando: ${migrationFile}`);

    try {
      // Ler arquivo SQL
      const migrationPath = path.join(MIGRATIONS_DIR, migrationFile);
      const sql = fs.readFileSync(migrationPath, 'utf8');

      // Dividir em statements individuais
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      // Executar dentro de transação
      await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run('BEGIN TRANSACTION');
          
          let hasError = false;
          
          statements.forEach((statement) => {
            if (hasError) return;
            
            db.run(statement, (err) => {
              if (err) {
                // Ignorar erros de coluna/tabela duplicada
                if (err.message.includes('duplicate column') || 
                    err.message.includes('already exists')) {
                  console.log(`   ⚠️  ${err.message.includes('duplicate column') ? 'Coluna' : 'Objeto'} já existe, pulando...`);
                } else {
                  hasError = true;
                  db.run('ROLLBACK');
                  reject(err);
                }
              }
            });
          });
          
          if (!hasError) {
            db.run('COMMIT', (err) => {
              if (err) {
                db.run('ROLLBACK');
                reject(err);
              } else {
                // Registrar migration como executada
                db.run('INSERT INTO migrations (filename) VALUES (?)', [migrationFile], (err) => {
                  if (err) reject(err);
                  else resolve();
                });
              }
            });
          }
        });
      });

      console.log(`   ✅ Sucesso!`);
      executedCount++;

    } catch (error) {
      console.error(`   ❌ ERRO: ${error.message}`);
      throw error;
    }
  }

  // Fechar banco
  await new Promise((resolve) => {
    db.close(resolve);
  });

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║              MIGRATIONS CONCLUÍDAS                         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`\n✅ Executadas: ${executedCount}`);
  console.log(`⏭️  Puladas: ${skippedCount}`);
  console.log(`📊 Total: ${migrations.length}\n`);
}

// Executar migrations
runMigrations()
  .then(() => {
    console.log('🎉 Processo concluído com sucesso!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ ERRO FATAL:', error.message);
    console.error(error.stack);
    process.exit(1);
  });

