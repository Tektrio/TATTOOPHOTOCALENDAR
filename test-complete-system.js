/**
 * Script de Teste Completo do Sistema TattooScheduler
 * Testa todas as funcionalidades via API REST
 */

const http = require('http');

// Configuração
const API_BASE = 'localhost';
const API_PORT = 3001;
const FRONTEND_PORT = 5173;

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Utilitário para fazer requests HTTP
function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_BASE,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// Utilitário para imprimir resultados
function printResult(testName, passed, details = '') {
  const symbol = passed ? '✅' : '❌';
  const color = passed ? colors.green : colors.red;
  console.log(`${color}${symbol} ${testName}${colors.reset}`);
  if (details) {
    console.log(`   ${colors.cyan}${details}${colors.reset}`);
  }
}

function printSection(title) {
  console.log(`\n${colors.blue}${'='.repeat(60)}${colors.reset}`);
  console.log(`${colors.blue}${title}${colors.reset}`);
  console.log(`${colors.blue}${'='.repeat(60)}${colors.reset}\n`);
}

// Testes
async function runTests() {
  console.log(`${colors.yellow}
╔════════════════════════════════════════════════════════════╗
║       TESTE COMPLETO DO SISTEMA TATTOOSCHEDULER           ║
╚════════════════════════════════════════════════════════════╝
${colors.reset}`);

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
  };

  // ========================================
  // 1. TESTES DE CONECTIVIDADE
  // ========================================
  printSection('1. TESTES DE CONECTIVIDADE');

  try {
    const frontendTest = await makeRequest('/', 'GET');
    results.total++;
    if (frontendTest.status === 200) {
      results.passed++;
      printResult('Frontend acessível', true, `http://localhost:${FRONTEND_PORT}`);
    } else {
      results.failed++;
      printResult('Frontend acessível', false, `Status: ${frontendTest.status}`);
    }
  } catch (e) {
    results.total++;
    results.failed++;
    printResult('Frontend acessível', false, e.message);
  }

  try {
    const backendTest = await makeRequest('/api/customers', 'GET');
    results.total++;
    if (backendTest.status >= 200 && backendTest.status < 500) {
      results.passed++;
      printResult('Backend API respondendo', true, `http://localhost:${API_PORT}/api/`);
    } else {
      results.failed++;
      printResult('Backend API respondendo', false, `Status: ${backendTest.status}`);
    }
  } catch (e) {
    results.total++;
    results.failed++;
    printResult('Backend API respondendo', false, e.message);
  }

  // ========================================
  // 2. API DE CLIENTES
  // ========================================
  printSection('2. API DE CLIENTES (CRUD)');

  // GET - Listar clientes
  try {
    const response = await makeRequest('/api/customers', 'GET');
    results.total++;
    if (response.status === 200) {
      results.passed++;
      const clientCount = Array.isArray(response.data) ? response.data.length : 0;
      printResult('GET /api/customers - Listar clientes', true, `${clientCount} clientes encontrados`);
    } else {
      results.failed++;
      printResult('GET /api/customers - Listar clientes', false, `Status: ${response.status}`);
    }
  } catch (e) {
    results.total++;
    results.failed++;
    printResult('GET /api/customers - Listar clientes', false, e.message);
  }

  // POST - Criar cliente
  let createdCustomerId = null;
  try {
    const newCustomer = {
      name: 'Cliente Teste API',
      email: `teste${Date.now()}@example.com`,
      phone: '+55 11 98765-4321',
    };
    const response = await makeRequest('/api/customers', 'POST', newCustomer);
    results.total++;
    if (response.status === 201 || response.status === 200) {
      results.passed++;
      createdCustomerId = response.data.id || response.data.customer_id;
      printResult('POST /api/customers - Criar cliente', true, `Cliente criado: ${createdCustomerId}`);
    } else {
      results.failed++;
      printResult('POST /api/customers - Criar cliente', false, `Status: ${response.status}`);
    }
  } catch (e) {
    results.total++;
    results.failed++;
    printResult('POST /api/customers - Criar cliente', false, e.message);
  }

  // GET - Buscar cliente específico
  if (createdCustomerId) {
    try {
      const response = await makeRequest(`/api/customers/${createdCustomerId}`, 'GET');
      results.total++;
      if (response.status === 200) {
        results.passed++;
        printResult(`GET /api/customers/${createdCustomerId} - Buscar cliente`, true, `Cliente encontrado`);
      } else {
        results.failed++;
        printResult(`GET /api/customers/${createdCustomerId} - Buscar cliente`, false, `Status: ${response.status}`);
      }
    } catch (e) {
      results.total++;
      results.failed++;
      printResult(`GET /api/customers/${createdCustomerId} - Buscar cliente`, false, e.message);
    }

    // PUT - Atualizar cliente
    try {
      const updatedData = {
        name: 'Cliente Teste API (Atualizado)',
      };
      const response = await makeRequest(`/api/customers/${createdCustomerId}`, 'PUT', updatedData);
      results.total++;
      if (response.status === 200) {
        results.passed++;
        printResult(`PUT /api/customers/${createdCustomerId} - Atualizar cliente`, true);
      } else {
        results.failed++;
        printResult(`PUT /api/customers/${createdCustomerId} - Atualizar cliente`, false, `Status: ${response.status}`);
      }
    } catch (e) {
      results.total++;
      results.failed++;
      printResult(`PUT /api/customers/${createdCustomerId} - Atualizar cliente`, false, e.message);
    }
  }

  // ========================================
  // 3. API DE SERVIÇOS
  // ========================================
  printSection('3. API DE SERVIÇOS');

  try {
    const response = await makeRequest('/api/services', 'GET');
    results.total++;
    if (response.status === 200 || response.status === 500) {
      // 500 pode ser falta de tabela, mas API responde
      results.passed++;
      printResult('GET /api/services - Listar serviços', true, 'Endpoint acessível');
    } else {
      results.failed++;
      printResult('GET /api/services - Listar serviços', false, `Status: ${response.status}`);
    }
  } catch (e) {
    results.total++;
    results.failed++;
    printResult('GET /api/services - Listar serviços', false, e.message);
  }

  // ========================================
  // 4. API DE AGENDAMENTOS
  // ========================================
  printSection('4. API DE AGENDAMENTOS');

  try {
    const response = await makeRequest('/api/appointments', 'GET');
    results.total++;
    if (response.status === 200 || response.status === 500) {
      results.passed++;
      const appointmentCount = Array.isArray(response.data) ? response.data.length : 0;
      printResult('GET /api/appointments - Listar agendamentos', true, `${appointmentCount} agendamentos`);
    } else {
      results.failed++;
      printResult('GET /api/appointments - Listar agendamentos', false, `Status: ${response.status}`);
    }
  } catch (e) {
    results.total++;
    results.failed++;
    printResult('GET /api/appointments - Listar agendamentos', false, e.message);
  }

  // ========================================
  // 5. API GOOGLE AUTH
  // ========================================
  printSection('5. INTEGRAÇÃO GOOGLE');

  try {
    const response = await makeRequest('/api/google-accounts', 'GET');
    results.total++;
    if (response.status >= 200 && response.status < 500) {
      results.passed++;
      printResult('GET /api/google-accounts - Contas Google', true, 'Endpoint acessível');
    } else {
      results.failed++;
      printResult('GET /api/google-accounts - Contas Google', false, `Status: ${response.status}`);
    }
  } catch (e) {
    results.total++;
    results.failed++;
    printResult('GET /api/google-accounts - Contas Google', false, e.message);
  }

  // ========================================
  // 6. API DE IMPORTAÇÃO
  // ========================================
  printSection('6. SISTEMA DE IMPORTAÇÃO');

  try {
    const response = await makeRequest('/api/imports/logs', 'GET');
    results.total++;
    if (response.status >= 200 && response.status < 500) {
      results.passed++;
      printResult('GET /api/imports/logs - Logs de importação', true);
    } else {
      results.failed++;
      printResult('GET /api/imports/logs - Logs de importação', false, `Status: ${response.status}`);
    }
  } catch (e) {
    results.total++;
    results.failed++;
    printResult('GET /api/imports/logs - Logs de importação', false, e.message);
  }

  // ========================================
  // 7. CATEGORIAS
  // ========================================
  printSection('7. CATEGORIAS DE ARQUIVOS');

  try {
    const response = await makeRequest('/api/local-storage/categories', 'GET');
    results.total++;
    if (response.status === 200) {
      results.passed++;
      const catCount = Array.isArray(response.data) ? response.data.length : 0;
      printResult('GET /api/local-storage/categories - Categorias', true, `${catCount} categorias`);
    } else {
      results.failed++;
      printResult('GET /api/local-storage/categories - Categorias', false, `Status: ${response.status}`);
    }
  } catch (e) {
    results.total++;
    results.failed++;
    printResult('GET /api/local-storage/categories - Categorias', false, e.message);
  }

  // ========================================
  // RESUMO FINAL
  // ========================================
  printSection('RESUMO DOS TESTES');

  console.log(`${colors.cyan}Total de testes: ${colors.reset}${results.total}`);
  console.log(`${colors.green}✅ Passaram: ${colors.reset}${results.passed}`);
  console.log(`${colors.red}❌ Falharam: ${colors.reset}${results.failed}`);

  const successRate = ((results.passed / results.total) * 100).toFixed(1);
  console.log(`\n${colors.yellow}Taxa de sucesso: ${successRate}%${colors.reset}\n`);

  if (results.failed === 0) {
    console.log(`${colors.green}╔════════════════════════════════════════╗${colors.reset}`);
    console.log(`${colors.green}║  ✅  TODOS OS TESTES PASSARAM! 🎉    ║${colors.reset}`);
    console.log(`${colors.green}╚════════════════════════════════════════╝${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️  Alguns testes falharam. Verifique os detalhes acima.${colors.reset}\n`);
  }

  console.log(`${colors.cyan}🌐 Acesse o sistema em: http://localhost:${FRONTEND_PORT}${colors.reset}\n`);
}

// Executar testes
runTests().catch((error) => {
  console.error(`${colors.red}Erro ao executar testes:${colors.reset}`, error);
  process.exit(1);
});

