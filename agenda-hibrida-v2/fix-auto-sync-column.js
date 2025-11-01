const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'agenda_hibrida.db');
const db = new sqlite3.Database(dbPath);

console.log('🔧 Adicionando coluna auto_sync_enabled...\n');

db.serialize(() => {
  // Adicionar coluna auto_sync_enabled na tabela local_storage_config
  db.run(`
    ALTER TABLE local_storage_config ADD COLUMN auto_sync_enabled BOOLEAN DEFAULT 1
  `, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.error('❌ Erro:', err.message);
    } else {
      console.log('✅ Coluna auto_sync_enabled adicionada\n');
    }
  });

  // Inserir configuração padrão
  db.run(`
    INSERT OR IGNORE INTO local_storage_config (key, value, value_type, description)
    VALUES ('auto_sync_enabled', 'true', 'boolean', 'Habilitar sincronização automática')
  `, (err) => {
    if (err) {
      console.error('❌ Erro ao inserir configuração:', err.message);
    } else {
      console.log('✅ Configuração padrão inserida\n');
    }

    db.close((err) => {
      if (err) console.error('❌ Erro ao fechar banco:', err.message);
      else console.log('✅ Correção concluída!');
    });
  });
});

