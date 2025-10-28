const sqlite3 = require('sqlite3').verbose();
const VagaroUniversalImporter = require('./services/vagaroUniversalImporter');

async function test() {
  const db = new sqlite3.Database('./agenda_hibrida.db');
  const importer = new VagaroUniversalImporter(db);
  
  const filePath = '/Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/vagaro_dados_download/download total manual/CustomersList.xlsx';
  
  try {
    console.log('📖 Lendo arquivo...');
    const data = await importer.readExcelFile(filePath);
    console.log(`📊 Total de linhas: ${data.length}`);
    
    console.log('\n🔍 Testando parseCustomerRow...');
    const customerData = importer.parseCustomerRow(data[0], 0);
    console.log('✅ Parser OK!');
    console.log('Nome:', customerData.name);
    console.log('Email:', customerData.email);
    
    console.log('\n🔍 Procurando duplicata...');
    const duplicate = await importer.findDuplicateClient(customerData);
    console.log('Duplicata?', duplicate ? `SIM (ID: ${duplicate.id})` : 'NÃO');
    
    console.log('\n💾 Tentando inserir no banco...');
    
    try {
      await importer.runDb(`
        INSERT INTO clients (
          name, first_name, last_name, email, mobile, day_phone, night_phone,
          address_line1, apt_suite, city, state, zip_code, birthdate, gender,
          customer_since, last_visited, membership, tags, referred_by,
          online_booking_allowed, credit_card_on_file, bank_on_file,
          vagaro_appointments_booked, vagaro_classes_booked, vagaro_check_ins,
          vagaro_points_earned, vagaro_amount_paid, vagaro_no_shows,
          vagaro_employee_seen, import_source, last_import_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        customerData.name, customerData.first_name, customerData.last_name,
        customerData.email, customerData.mobile, customerData.day_phone,
        customerData.night_phone, customerData.address_line1, customerData.apt_suite,
        customerData.city, customerData.state, customerData.zip_code,
        customerData.birthdate, customerData.gender, customerData.customer_since,
        customerData.last_visited, customerData.membership, customerData.tags,
        customerData.referred_by, customerData.online_booking_allowed,
        customerData.credit_card_on_file, customerData.bank_on_file,
        customerData.vagaro_appointments_booked, customerData.vagaro_classes_booked,
        customerData.vagaro_check_ins, customerData.vagaro_points_earned,
        customerData.vagaro_amount_paid, customerData.vagaro_no_shows,
        customerData.vagaro_employee_seen, customerData.import_source,
        customerData.last_import_date
      ]);
      
      console.log('✅ INSERIDO COM SUCESSO!');
      
    } catch (insertError) {
      console.error('❌ ERRO NA INSERÇÃO:', insertError.message);
      console.error('SQL Error:', insertError);
    }
    
  } catch (error) {
    console.error('❌ ERRO GERAL:', error.message);
    console.error(error.stack);
  }
  
  db.close();
}

test();

