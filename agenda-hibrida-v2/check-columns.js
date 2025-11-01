const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'agenda_hibrida.db');

const db = new sqlite3.Database(DB_PATH);

db.all(`PRAGMA table_info(appointments)`, (err, columns) => {
  if (err) {
    console.error('Erro:', err);
  } else {
    console.log('📋 Colunas existentes na tabela appointments:\n');
    columns.forEach(col => {
      console.log(`  - ${col.name.padEnd(25)} (${col.type})`);
    });
    
    console.log('\n🔍 Verificando colunas esperadas...\n');
    
    const expectedColumns = [
      'client_name', 'title', 'description', 'start_datetime', 
      'end_datetime', 'date', 'time', 'end_time', 'service',
      'notes', 'duration', 'tattoo_type_id', 'estimated_price',
      'google_event_id', 'google_calendar_id', 'ical_uid',
      'external_source', 'external_id', 'last_sync_date'
    ];
    
    const existingColumns = columns.map(c => c.name);
    const missing = expectedColumns.filter(col => !existingColumns.includes(col));
    
    if (missing.length > 0) {
      console.log('❌ Colunas faltando:');
      missing.forEach(col => console.log(`  - ${col}`));
    } else {
      console.log('✅ Todas as colunas esperadas existem!');
    }
  }
  db.close();
});



