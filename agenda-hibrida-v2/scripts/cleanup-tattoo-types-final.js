#!/usr/bin/env node

/**
 * Script para consolidar tipos de tatuagem redundantes
 * Mantém apenas tipos únicos e remove duplicatas conceituais
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '..', 'agenda_hibrida.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Consolidando tipos de tatuagem...\n');

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
    // Verificar se há agendamentos ou orçamentos vinculados
    console.log('🔍 Verificando dependências...');
    const appointmentsCount = await allQuery('SELECT COUNT(*) as count FROM appointments WHERE tattoo_type_id IS NOT NULL');
    const budgetsCount = await allQuery('SELECT COUNT(*) as count FROM budgets WHERE tattoo_type_id IS NOT NULL');
    
    console.log(`   - Agendamentos com tipo: ${appointmentsCount[0].count}`);
    console.log(`   - Orçamentos com tipo: ${budgetsCount[0].count}\n`);
    
    // Listar tipos atuais
    console.log('📋 Tipos atuais:');
    const currentTypes = await allQuery('SELECT id, name, duration_hours, base_price, description FROM tattoo_types ORDER BY id');
    currentTypes.forEach(t => {
      console.log(`   ID ${t.id}: ${t.name} - ${t.duration_hours}h • R$ ${t.base_price} ${t.description ? `(${t.description})` : ''}`);
    });
    console.log('');
    
    // Mapeamento de consolidação
    // Vamos manter apenas os 4 tipos principais mais os úteis
    const consolidationMap = {
      // Manter: Pequena (ID 7)
      1: 7, // "Pequena (até 5cm)" → "Pequena"
      
      // Manter: Média (ID 8)
      2: 8, // "Média (5-15cm)" → "Média"
      
      // Manter: Grande (ID 9)
      3: 9, // "Grande (15-30cm)" → "Grande"
      
      // Manter: Extra Grande (ID 4 - útil manter separado)
      // Manter: Sessão de Retoque (ID 5 - útil manter)
      // Manter: Realista (ID 35 - tipo especial)
      
      // Manter: Sessão Completa (ID 10)
      // Outros tipos já estão únicos
    };
    
    console.log('🔄 Consolidando tipos redundantes...');
    
    await runQuery('BEGIN TRANSACTION');
    
    try {
      // Atualizar foreign keys para consolidar
      for (const [oldId, newId] of Object.entries(consolidationMap)) {
        console.log(`   Consolidando ID ${oldId} → ID ${newId}`);
        
        // Atualizar appointments
        await runQuery('UPDATE appointments SET tattoo_type_id = ? WHERE tattoo_type_id = ?', [newId, oldId]);
        
        // Atualizar budgets
        await runQuery('UPDATE budgets SET tattoo_type_id = ? WHERE tattoo_type_id = ?', [newId, oldId]);
        
        // Remover tipo antigo
        await runQuery('DELETE FROM tattoo_types WHERE id = ?', [oldId]);
      }
      
      // Atualizar descrições dos tipos principais para ficar mais claro
      await runQuery(`
        UPDATE tattoo_types 
        SET description = 'Tatuagens pequenas até 5cm'
        WHERE id = 7
      `);
      
      await runQuery(`
        UPDATE tattoo_types 
        SET description = 'Tatuagens médias de 5-15cm'
        WHERE id = 8
      `);
      
      await runQuery(`
        UPDATE tattoo_types 
        SET description = 'Tatuagens grandes de 15-30cm'
        WHERE id = 9
      `);
      
      await runQuery(`
        UPDATE tattoo_types 
        SET description = 'Tatuagens extra grandes acima de 30cm'
        WHERE id = 4
      `);
      
      await runQuery('COMMIT');
      console.log('✅ Consolidação concluída!\n');
      
    } catch (error) {
      await runQuery('ROLLBACK');
      throw error;
    }
    
    // Listar tipos finais
    console.log('📋 Tipos finais consolidados:');
    const finalTypes = await allQuery('SELECT id, name, duration_hours, base_price, color, description FROM tattoo_types ORDER BY base_price');
    finalTypes.forEach(t => {
      console.log(`   ✓ ${t.name}: ${t.duration_hours}h • R$ ${t.base_price} - ${t.description || 'Sem descrição'}`);
    });
    console.log('');
    
    console.log(`✨ Consolidação concluída! Tipos finais: ${finalTypes.length}`);
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

main();

