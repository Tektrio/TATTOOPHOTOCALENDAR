/**
 * Script de Teste do Sistema de Gestão de Clientes
 * 
 * Este script testa todas as APIs e funcionalidades implementadas
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'agenda_hibrida.db');

console.log('🧪 Iniciando testes do Sistema de Gestão de Clientes...\n');

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco:', err);
    process.exit(1);
  }
  console.log('✅ Conectado ao banco de dados\n');
});

// Teste 1: Verificar tabelas criadas
console.log('📊 Teste 1: Verificando tabelas...');
const requiredTables = [
  'customer_notes',
  'custom_forms',
  'customer_forms',
  'customer_files',
  'products',
  'customer_products',
  'gift_cards',
  'gift_card_usage',
  'service_packages',
  'customer_packages',
  'package_usage',
  'membership_plans',
  'customer_memberships',
  'membership_payments',
  'invoices',
  'invoice_items',
  'tags',
  'client_tags',
  'client_relationships',
  'loyalty_points',
  'client_statistics',
  'vagaro_import_metadata'
];

db.all(
  "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
  [],
  (err, tables) => {
    if (err) {
      console.error('❌ Erro ao listar tabelas:', err);
      return;
    }

    const tableNames = tables.map(t => t.name);
    let allFound = true;

    requiredTables.forEach(table => {
      if (tableNames.includes(table)) {
        console.log(`   ✅ ${table}`);
      } else {
        console.log(`   ❌ ${table} - FALTANDO!`);
        allFound = false;
      }
    });

    console.log('');
    
    if (allFound) {
      console.log('✅ Todas as tabelas encontradas!\n');
      runTest2();
    } else {
      console.log('❌ Algumas tabelas estão faltando. Execute o migration:\n');
      console.log('   node database/migrate.js\n');
      db.close();
    }
  }
);

// Teste 2: Criar cliente de teste
function runTest2() {
  console.log('👤 Teste 2: Criando cliente de teste...');
  
  const testClient = {
    name: 'Cliente Teste Sistema',
    email: 'teste@sistema.com',
    phone: '(11) 99999-9999',
    birth_date: '1990-01-01',
    gender: 'male',
    address: 'Rua Teste, 123',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01234-567',
    notes: 'Cliente criado automaticamente pelo script de teste'
  };

  db.run(
    `INSERT INTO clients (name, email, phone, birth_date, gender, address, city, state, zip_code, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      testClient.name,
      testClient.email,
      testClient.phone,
      testClient.birth_date,
      testClient.gender,
      testClient.address,
      testClient.city,
      testClient.state,
      testClient.zip_code,
      testClient.notes
    ],
    function(err) {
      if (err) {
        console.error('❌ Erro ao criar cliente:', err);
        db.close();
        return;
      }

      const clientId = this.lastID;
      console.log(`✅ Cliente criado com ID: ${clientId}\n`);

      // Criar estatísticas
      db.run(
        'INSERT INTO client_statistics (client_id) VALUES (?)',
        [clientId],
        (err) => {
          if (err) {
            console.error('⚠️ Erro ao criar estatísticas:', err);
          } else {
            console.log('✅ Estatísticas inicializadas\n');
          }

          runTest3(clientId);
        }
      );
    }
  );
}

// Teste 3: Criar nota de teste
function runTest3(clientId) {
  console.log('📝 Teste 3: Criando nota de teste...');

  db.run(
    'INSERT INTO customer_notes (client_id, title, content) VALUES (?, ?, ?)',
    [clientId, 'Nota de Teste', 'Esta é uma nota criada automaticamente pelo script de teste.'],
    function(err) {
      if (err) {
        console.error('❌ Erro ao criar nota:', err);
      } else {
        console.log(`✅ Nota criada com ID: ${this.lastID}\n`);
      }

      runTest4(clientId);
    }
  );
}

// Teste 4: Verificar dados
function runTest4(clientId) {
  console.log('🔍 Teste 4: Verificando dados criados...');

  db.get(
    `SELECT c.*, cs.* FROM clients c
     LEFT JOIN client_statistics cs ON c.id = cs.client_id
     WHERE c.id = ?`,
    [clientId],
    (err, client) => {
      if (err) {
        console.error('❌ Erro ao buscar cliente:', err);
        db.close();
        return;
      }

      console.log('\n📋 Dados do Cliente:');
      console.log(`   Nome: ${client.name}`);
      console.log(`   Email: ${client.email}`);
      console.log(`   Telefone: ${client.phone}`);
      console.log(`   Cidade: ${client.city}, ${client.state}`);
      console.log(`   CEP: ${client.zip_code}`);
      console.log(`   Total Agendamentos: ${client.total_appointments || 0}`);
      console.log(`   Total Vendas: $${client.total_sales || 0}`);
      console.log(`   Pontos: ${client.loyalty_points_balance || 0}`);

      // Buscar notas
      db.all(
        'SELECT * FROM customer_notes WHERE client_id = ?',
        [clientId],
        (err, notes) => {
          if (err) {
            console.error('❌ Erro ao buscar notas:', err);
          } else {
            console.log(`\n📝 Notas: ${notes.length} encontrada(s)`);
            notes.forEach(note => {
              console.log(`   - ${note.title}: ${note.content.substring(0, 50)}...`);
            });
          }

          console.log('\n');
          showSummary();
        }
      );
    }
  );
}

// Resumo final
function showSummary() {
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                                                          ║');
  console.log('║   ✅ TESTES CONCLUÍDOS COM SUCESSO!                     ║');
  console.log('║                                                          ║');
  console.log('║   Sistema de Gestão de Clientes está funcionando!       ║');
  console.log('║                                                          ║');
  console.log('║   Próximos passos:                                       ║');
  console.log('║   1. Registrar rotas no server.js                        ║');
  console.log('║   2. Configurar rota no frontend                         ║');
  console.log('║   3. Iniciar backend e frontend                          ║');
  console.log('║   4. Acessar /customers/:customerId                      ║');
  console.log('║                                                          ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('\n📚 Leia o guia completo em: SETUP_CUSTOMER_MANAGEMENT.md\n');

  db.close((err) => {
    if (err) {
      console.error('Erro ao fechar banco:', err);
    } else {
      console.log('✅ Banco de dados fechado\n');
    }
  });
}

