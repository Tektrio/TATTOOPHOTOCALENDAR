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
    console.log('\n🔍 Primeiras 3 linhas:');
    console.log(JSON.stringify(data.slice(0, 3), null, 2));
    
    console.log('\n\n🔍 Testando parseCustomerRow na primeira linha...');
    const customerData = importer.parseCustomerRow(data[0], 0);
    console.log('✅ Parser funcionou!');
    console.log(JSON.stringify(customerData, null, 2));
    
  } catch (error) {
    console.error('❌ ERRO:', error.message);
    console.error(error.stack);
  }
  
  db.close();
}

test();

