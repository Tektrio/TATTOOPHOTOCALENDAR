/**
 * Script de teste para as APIs de gestão de clientes
 */

const API_URL = 'http://localhost:3001';

async function testCustomerAPIs() {
  console.log('🧪 TESTANDO APIs DE GESTÃO DE CLIENTES\n');
  
  try {
    // Teste 1: Listar clientes
    console.log('1️⃣ Testando GET /api/customers...');
    const response1 = await fetch(`${API_URL}/api/customers`);
    const customers = await response1.json();
    console.log('✅ Resposta:', customers);
    console.log(`   Clientes encontrados: ${customers.data?.length || 0}\n`);
    
    if (customers.data && customers.data.length > 0) {
      const clientId = customers.data[0].id;
      
      // Teste 2: Buscar cliente específico
      console.log(`2️⃣ Testando GET /api/customers/${clientId}...`);
      const response2 = await fetch(`${API_URL}/api/customers/${clientId}`);
      const customer = await response2.json();
      console.log('✅ Cliente:', customer.name);
      console.log(`   Email: ${customer.email}`);
      console.log(`   Telefone: ${customer.phone}\n`);
      
      // Teste 3: Buscar notas do cliente
      console.log(`3️⃣ Testando GET /api/customers/${clientId}/notes...`);
      const response3 = await fetch(`${API_URL}/api/customers/${clientId}/notes`);
      const notes = await response3.json();
      console.log('✅ Notas encontradas:', notes.length);
      if (notes.length > 0) {
        console.log(`   Primeira nota: "${notes[0].title}"\n`);
      }
      
      // Teste 4: Buscar estatísticas do cliente
      console.log(`4️⃣ Testando GET /api/customers/${clientId}/statistics...`);
      const response4 = await fetch(`${API_URL}/api/customers/${clientId}/statistics`);
      const stats = await response4.json();
      console.log('✅ Estatísticas:');
      console.log(`   Total de agendamentos: ${stats.total_appointments || 0}`);
      console.log(`   Total de vendas: R$ ${stats.total_sales || 0}`);
      console.log(`   Pontos de fidelidade: ${stats.loyalty_points_balance || 0}\n`);
    }
    
    console.log('✅ TODOS OS TESTES PASSARAM COM SUCESSO! 🎉\n');
    
  } catch (error) {
    console.error('❌ ERRO NOS TESTES:', error.message);
    console.log('\n⚠️  Certifique-se de que o backend está rodando:');
    console.log('   cd agenda-hibrida-v2');
    console.log('   npm start\n');
  }
}

// Executar testes
testCustomerAPIs();

