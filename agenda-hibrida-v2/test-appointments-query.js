const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'agenda_hibrida.db');

console.log('🔍 Testando query de appointments...\n');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar:', err);
    process.exit(1);
  }
});

// Query exata do server.js
const query = `
  SELECT 
    a.id,
    a.client_id,
    a.tattoo_type_id,
    COALESCE(a.client_name, c.name) as client_name,
    COALESCE(a.date, DATE(a.start_datetime)) as date,
    COALESCE(a.time, TIME(a.start_datetime)) as time,
    COALESCE(a.end_time, TIME(a.end_datetime)) as end_time,
    COALESCE(a.service, a.title) as service,
    a.title,
    COALESCE(a.notes, a.description) as notes,
    a.description,
    a.status,
    a.duration,
    a.google_event_id,
    a.google_calendar_id,
    a.ical_uid,
    a.external_source,
    a.external_id,
    a.last_sync_date,
    a.start_datetime,
    a.end_datetime,
    a.estimated_price,
    a.created_at,
    a.updated_at,
    c.name as client_full_name,
    c.email as client_email,
    c.phone as client_phone,
    c.folder_path as client_folder,
    tt.name as tattoo_type,
    tt.color as type_color
  FROM appointments a
  LEFT JOIN clients c ON a.client_id = c.id
  LEFT JOIN tattoo_types tt ON a.tattoo_type_id = tt.id
  ORDER BY 
    COALESCE(a.date, DATE(a.start_datetime)) DESC,
    COALESCE(a.time, TIME(a.start_datetime)) DESC
`;

db.all(query, (err, rows) => {
  if (err) {
    console.error('❌ Erro na query:', err.message);
    console.error('\nDetalhes:', err);
  } else {
    console.log(`✅ Query executada com sucesso!`);
    console.log(`📊 Total de registros: ${rows.length}\n`);
    
    if (rows.length > 0) {
      console.log('📋 Primeiros registros:');
      rows.slice(0, 3).forEach((row, i) => {
        console.log(`\n${i + 1}. ${row.title || 'Sem título'}`);
        console.log(`   Cliente: ${row.client_name || 'N/A'}`);
        console.log(`   Data: ${row.date || 'N/A'} ${row.time || ''}`);
        console.log(`   Status: ${row.status || 'N/A'}`);
      });
    } else {
      console.log('ℹ️  Nenhum agendamento cadastrado (normal para banco novo)');
    }
  }
  
  db.close();
});



