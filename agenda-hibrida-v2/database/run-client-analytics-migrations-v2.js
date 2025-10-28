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
        console.log('✅ SQLite: journal_mode = WAL\n');
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

      // Executar toda a migration de uma vez usando exec()
      await new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
          if (err) {
            // Verificar se é um erro de "já existe"
            if (err.message.includes('already exists') || 
                err.message.includes('duplicate column name')) {
              console.log(`   ⚠️  Alguns objetos já existem, continuando...`);
              resolve();
            } else {
              reject(err);
            }
          } else {
            resolve();
          }
        });
      });

      // Registrar migration como executada
      await new Promise((resolve, reject) => {
        db.run('INSERT OR IGNORE INTO migrations (filename) VALUES (?)', [migrationFile], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });

      console.log(`   ✅ Sucesso!`);
      executedCount++;

    } catch (error) {
      console.error(`   ❌ ERRO: ${error.message}`);
      
      // Continuar com as próximas migrações mesmo se houver erro
      console.log(`   ⚠️  Continuando com as próximas migrações...`);
      skippedCount++;
    }
  }

  db.close();

  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║              MIGRATIONS CONCLUÍDAS                         ║');
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  console.log(`✅ Executadas: ${executedCount}`);
  console.log(`⏭️  Puladas: ${skippedCount}`);
  console.log(`📊 Total: ${migrations.length}\n`);
  console.log('🎉 Processo concluído!\n');
}

runMigrations()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Erro fatal ao executar migrations:', error);
    process.exit(1);
  });

