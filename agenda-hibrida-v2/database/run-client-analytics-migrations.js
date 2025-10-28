#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, '..', 'agenda_hibrida.db');
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

const migrations = [
  '018-client-waiting-list.sql',
  '019-client-availability.sql',
  '020-client-projects.sql',
  '021-client-photos.sql',
  '022-client-documents.sql',
  '023-client-health.sql',
  '024-client-preferences.sql',
  '025-client-communications.sql',
  '026-client-private-notes.sql'
];

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║   EXECUTANDO MIGRATIONS - SISTEMA DE ANÁLISE CLIENTES    ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

async function runMigrations() {
  const db = new sqlite3.Database(DB_PATH);

  // Ativar WAL mode
  await new Promise((resolve, reject) => {
    db.run('PRAGMA journal_mode = WAL', (err) => {
      if (err) reject(err);
      else {
        console.log('✅ SQLite: journal_mode = WAL');
        resolve();
      }
    });
  });

  // Garantir que tabela de migrations existe
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

  for (const migrationFile of migrations) {
    // Verificar se já foi executada
    const alreadyExecuted = await new Promise((resolve, reject) => {
      db.get('SELECT filename FROM migrations WHERE filename = ?', [migrationFile], (err, row) => {
        if (err) reject(err);
        else resolve(!!row);
      });
    });

    if (alreadyExecuted) {
      console.log(`⏭️  PULANDO: ${migrationFile} (já executada)`);
      skippedCount++;
      continue;
    }

    try {
      console.log(`\n📝 Executando: ${migrationFile}`);
      
      const migrationPath = path.join(MIGRATIONS_DIR, migrationFile);
      const sql = fs.readFileSync(migrationPath, 'utf8');
      
      // Dividir em statements
      const statements = sql
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      // Executar statements sequencialmente dentro de uma transação
      await new Promise((resolve, reject) => {
        db.run('BEGIN TRANSACTION', async (err) => {
          if (err) {
            reject(err);
            return;
          }

          try {
            // Executar cada statement sequencialmente
            for (const statement of statements) {
              await new Promise((resolveStmt, rejectStmt) => {
                db.run(statement, (err) => {
                  if (err) {
                    // Se tabela/coluna/índice já existe, apenas avisa e continua
                    if (err.message.includes('already exists') || 
                        err.message.includes('duplicate') ||
                        err.code === 'SQLITE_ERROR' && err.message.includes('unique')) {
                      console.log(`   ⚠️  Objeto já existe, pulando...`);
                      resolveStmt();
                    } else {
                      rejectStmt(err);
                    }
                  } else {
                    resolveStmt();
                  }
                });
              });
            }

            // Commit da transação
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
          } catch (error) {
            db.run('ROLLBACK');
            reject(error);
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

  db.close();

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║              MIGRATIONS CONCLUÍDAS                         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  console.log(`✅ Executadas: ${executedCount}`);
  console.log(`⏭️  Puladas: ${skippedCount}`);
  console.log(`📊 Total: ${migrations.length}\n`);
  console.log('🎉 Processo concluído com sucesso!\n');
}

runMigrations()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal ao executar migrations:', error);
    process.exit(1);
  });
