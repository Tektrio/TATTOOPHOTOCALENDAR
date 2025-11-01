const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'agenda_hibrida.db');

console.log('🔧 Adicionando coluna client_name...\n');

const db = new sqlite3.Database(DB_PATH);

db.run(`ALTER TABLE appointments ADD COLUMN client_name TEXT`, (err) => {
  if (err) {
    if (err.message.includes('duplicate column')) {
      console.log('⚠️  Coluna client_name já existe');
    } else {
      console.error('❌ Erro:', err.message);
    }
  } else {
    console.log('✅ Coluna client_name adicionada com sucesso!');
  }
  
  // Preencher client_name com dados existentes
  console.log('\n🔄 Preenchendo client_name dos agendamentos...');
  
  db.run(`
    UPDATE appointments 
    SET client_name = (
      SELECT name FROM clients WHERE clients.id = appointments.client_id
    )
    WHERE client_name IS NULL AND client_id IS NOT NULL
  `, (err) => {
    if (err) {
      console.error('❌ Erro ao preencher:', err.message);
    } else {
      console.log('✅ Dados preenchidos!');
    }
    
    // Verificar resultado
    db.get('SELECT COUNT(*) as total, COUNT(client_name) as with_name FROM appointments', (err, row) => {
      if (!err) {
        console.log(`\n📊 Resultado:`);
        console.log(`   Total de agendamentos: ${row.total}`);
        console.log(`   Com client_name: ${row.with_name}`);
      }
      db.close(() => {
        console.log('\n✅ Concluído!');
      });
    });
  });
});



