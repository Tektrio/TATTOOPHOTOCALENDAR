#!/usr/bin/env node

/**
 * Script para corrigir duplicação de registros em tattoo_types
 * 
 * Este script:
 * 1. Remove duplicatas mantendo apenas o registro mais antigo (menor ID)
 * 2. Adiciona constraint UNIQUE na coluna 'name'
 * 3. Valida os resultados
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'agenda_hibrida.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Iniciando correção de duplicatas em tattoo_types...\n');

// Função para executar query e retornar Promise
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function(err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

function allQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function main() {
  try {
    // 1. Verificar duplicatas antes
    console.log('📊 Status ANTES da limpeza:');
    const beforeDuplicates = await allQuery(`
      SELECT name, COUNT(*) as count 
      FROM tattoo_types 
      GROUP BY name 
      HAVING count > 1
    `);
    
    if (beforeDuplicates.length === 0) {
      console.log('✅ Nenhuma duplicata encontrada!');
      process.exit(0);
    }
    
    beforeDuplicates.forEach(row => {
      console.log(`   - ${row.name}: ${row.count} registros`);
    });
    
    const totalBefore = await allQuery('SELECT COUNT(*) as total FROM tattoo_types');
    console.log(`   📈 Total de registros: ${totalBefore[0].total}\n`);
    
    // 2. Remover duplicatas mantendo apenas o registro com menor ID
    console.log('🧹 Removendo duplicatas...');
    await runQuery(`
      DELETE FROM tattoo_types 
      WHERE id NOT IN (
        SELECT MIN(id) 
        FROM tattoo_types 
        GROUP BY name
      )
    `);
    console.log('✅ Duplicatas removidas!\n');
    
    // 3. Verificar após limpeza
    console.log('📊 Status APÓS a limpeza:');
    const afterDuplicates = await allQuery(`
      SELECT name, COUNT(*) as count 
      FROM tattoo_types 
      GROUP BY name 
      HAVING count > 1
    `);
    
    if (afterDuplicates.length === 0) {
      console.log('✅ Nenhuma duplicata restante!');
    } else {
      console.log('⚠️  Ainda há duplicatas:');
      afterDuplicates.forEach(row => {
        console.log(`   - ${row.name}: ${row.count} registros`);
      });
    }
    
    const totalAfter = await allQuery('SELECT COUNT(*) as total FROM tattoo_types');
    console.log(`   📈 Total de registros: ${totalAfter[0].total}`);
    console.log(`   🗑️  Registros removidos: ${totalBefore[0].total - totalAfter[0].total}\n`);
    
    // 4. Listar registros finais
    console.log('📋 Registros finais em tattoo_types:');
    const finalRecords = await allQuery('SELECT id, name, duration_hours, base_price FROM tattoo_types ORDER BY name');
    finalRecords.forEach(record => {
      console.log(`   ✓ ID ${record.id}: ${record.name} (${record.duration_hours}h • R$ ${record.base_price})`);
    });
    console.log('');
    
    // 5. Criar nova tabela com constraint UNIQUE
    console.log('🔒 Adicionando constraint UNIQUE...');
    
    // SQLite não suporta ALTER TABLE ADD CONSTRAINT, então precisamos recriar a tabela
    await runQuery('BEGIN TRANSACTION');
    
    try {
      // Criar tabela temporária com constraint
      await runQuery(`
        CREATE TABLE tattoo_types_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          duration_hours INTEGER,
          base_price REAL,
          color TEXT,
          description TEXT
        )
      `);
      
      // Copiar dados
      await runQuery(`
        INSERT INTO tattoo_types_new (id, name, duration_hours, base_price, color, description)
        SELECT id, name, duration_hours, base_price, color, description
        FROM tattoo_types
      `);
      
      // Dropar tabela antiga
      await runQuery('DROP TABLE tattoo_types');
      
      // Renomear nova tabela
      await runQuery('ALTER TABLE tattoo_types_new RENAME TO tattoo_types');
      
      await runQuery('COMMIT');
      console.log('✅ Constraint UNIQUE adicionado com sucesso!\n');
      
    } catch (error) {
      await runQuery('ROLLBACK');
      throw error;
    }
    
    // 6. Verificar constraint foi criado
    console.log('🔍 Verificando schema da tabela:');
    const schema = await allQuery(`SELECT sql FROM sqlite_master WHERE type='table' AND name='tattoo_types'`);
    console.log(schema[0].sql);
    console.log('');
    
    // 7. Testar inserção de duplicata
    console.log('🧪 Testando constraint UNIQUE...');
    try {
      await runQuery(`INSERT INTO tattoo_types (name, duration_hours, base_price) VALUES ('Pequena', 2, 200)`);
      console.log('❌ ERRO: Constraint não funcionou! Duplicata foi inserida.');
    } catch (error) {
      if (error.message.includes('UNIQUE')) {
        console.log('✅ Constraint funcionando! Duplicata foi rejeitada corretamente.');
      } else {
        throw error;
      }
    }
    
    console.log('\n✨ Correção concluída com sucesso!');
    console.log('📝 Próximo passo: Atualizar código do server.js para garantir que INSERT OR IGNORE funcione corretamente.\n');
    
  } catch (error) {
    console.error('❌ Erro durante a correção:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();

