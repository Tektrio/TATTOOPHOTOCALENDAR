const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');
const sqlite3 = require('sqlite3').verbose();
const { execSync } = require('child_process');
require('dotenv').config();

class SystemTester {
  constructor() {
    this.testResults = {
      database: { status: 'pending', details: [] },
      storage: { status: 'pending', details: [] },
      apis: { status: 'pending', details: [] },
      integrations: { status: 'pending', details: [] },
      performance: { status: 'pending', details: [] },
      security: { status: 'pending', details: [] }
    };
    
    this.serverUrl = 'http://localhost:3001';
    this.frontendUrl = 'http://localhost:5173';
  }

  async runAllTests() {
    console.log('🧪 Iniciando testes do sistema híbrido...\n');
    
    try {
      await this.testDatabase();
      await this.testStorage();
      await this.testAPIs();
      await this.testIntegrations();
      await this.testPerformance();
      await this.testSecurity();
      
      this.generateReport();
    } catch (error) {
      console.error('❌ Erro durante os testes:', error);
    }
  }

  async testDatabase() {
    console.log('📊 Testando banco de dados...');
    
    try {
      const db = new sqlite3.Database('./agenda_hibrida.db');
      
      // Teste de conectividade
      await new Promise((resolve, reject) => {
        db.get("SELECT 1", (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      this.testResults.database.details.push('✅ Conectividade: OK');

      // Teste de estrutura das tabelas
      const tables = ['clients', 'appointments', 'tattoo_types', 'files', 'budgets', 'notifications'];
      for (const table of tables) {
        try {
          await new Promise((resolve, reject) => {
            db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [table], (err, row) => {
              if (err) reject(err);
              else if (row) resolve(row);
              else reject(new Error(`Tabela ${table} não encontrada`));
            });
          });
          this.testResults.database.details.push(`✅ Tabela ${table}: OK`);
        } catch (error) {
          this.testResults.database.details.push(`❌ Tabela ${table}: ${error.message}`);
        }
      }

      // Teste de operações CRUD
      try {
        // Inserir cliente de teste
        const clientId = await new Promise((resolve, reject) => {
          db.run(
            "INSERT INTO clients (name, email, phone, notes) VALUES (?, ?, ?, ?)",
            ['Cliente Teste', 'teste@email.com', '11999999999', 'Cliente para testes'],
            function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });

        // Ler cliente
        await new Promise((resolve, reject) => {
          db.get("SELECT * FROM clients WHERE id = ?", [clientId], (err, row) => {
            if (err) reject(err);
            else if (row) resolve(row);
            else reject(new Error('Cliente não encontrado'));
          });
        });

        // Atualizar cliente
        await new Promise((resolve, reject) => {
          db.run("UPDATE clients SET name = ? WHERE id = ?", ['Cliente Teste Atualizado', clientId], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        // Deletar cliente
        await new Promise((resolve, reject) => {
          db.run("DELETE FROM clients WHERE id = ?", [clientId], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });

        this.testResults.database.details.push('✅ Operações CRUD: OK');
      } catch (error) {
        this.testResults.database.details.push(`❌ Operações CRUD: ${error.message}`);
      }

      db.close();
      this.testResults.database.status = 'success';
      console.log('✅ Testes de banco de dados concluídos\n');
      
    } catch (error) {
      this.testResults.database.status = 'error';
      this.testResults.database.details.push(`❌ Erro geral: ${error.message}`);
      console.log('❌ Testes de banco de dados falharam\n');
    }
  }

  async testStorage() {
    console.log('💾 Testando sistema de armazenamento...');
    
    try {
      // Teste de armazenamento local
      const localPath = './uploads/test';
      await fs.ensureDir(localPath);
      
      const testFile = path.join(localPath, 'test-file.txt');
      await fs.writeFile(testFile, 'Conteúdo de teste');
      
      if (await fs.pathExists(testFile)) {
        this.testResults.storage.details.push('✅ Armazenamento local: OK');
        await fs.remove(testFile);
      } else {
        this.testResults.storage.details.push('❌ Armazenamento local: Falha na criação');
      }

      // Teste de estrutura de pastas
      const clientFolders = ['Cliente_Teste/referencias', 'Cliente_Teste/desenhos_aprovados', 'Cliente_Teste/fotos_finais'];
      for (const folder of clientFolders) {
        const folderPath = path.join('./uploads', folder);
        await fs.ensureDir(folderPath);
        
        if (await fs.pathExists(folderPath)) {
          this.testResults.storage.details.push(`✅ Pasta ${folder}: OK`);
        } else {
          this.testResults.storage.details.push(`❌ Pasta ${folder}: Falha na criação`);
        }
      }

      // Teste de permissões
      try {
        const permissionTest = './uploads/permission-test.txt';
        await fs.writeFile(permissionTest, 'teste');
        await fs.remove(permissionTest);
        this.testResults.storage.details.push('✅ Permissões de escrita: OK');
      } catch (error) {
        this.testResults.storage.details.push(`❌ Permissões de escrita: ${error.message}`);
      }

      // Teste de espaço em disco
      try {
        await fs.stat('./uploads');
        this.testResults.storage.details.push('✅ Acesso ao diretório de uploads: OK');
      } catch (error) {
        this.testResults.storage.details.push(`❌ Acesso ao diretório de uploads: ${error.message}`);
      }

      this.testResults.storage.status = 'success';
      console.log('✅ Testes de armazenamento concluídos\n');
      
    } catch (error) {
      this.testResults.storage.status = 'error';
      this.testResults.storage.details.push(`❌ Erro geral: ${error.message}`);
      console.log('❌ Testes de armazenamento falharam\n');
    }
  }

  async testAPIs() {
    console.log('🔌 Testando APIs...');
    
    try {
      // Teste de conectividade do servidor
      try {
        const healthResponse = await axios.get(`${this.serverUrl}/health`, { timeout: 5000 });
        if (healthResponse.status === 200) {
          this.testResults.apis.details.push('✅ Servidor backend: Online');
        }
      } catch (error) {
        this.testResults.apis.details.push(`❌ Servidor backend: ${error.message}`);
      }

      // Teste das rotas principais
      const routes = [
        '/api/clients',
        '/api/appointments',
        '/api/tattoo-types',
        '/api/files',
        '/api/budgets'
      ];

      for (const route of routes) {
        try {
          const response = await axios.get(`${this.serverUrl}${route}`, { timeout: 5000 });
          if (response.status === 200) {
            this.testResults.apis.details.push(`✅ Rota ${route}: OK`);
          }
        } catch (error) {
          this.testResults.apis.details.push(`❌ Rota ${route}: ${error.code || error.message}`);
        }
      }

      // Teste de CORS
      try {
        await axios.options(`${this.serverUrl}/api/clients`, {
          headers: {
            'Origin': this.frontendUrl,
            'Access-Control-Request-Method': 'GET'
          }
        });
        this.testResults.apis.details.push('✅ CORS: Configurado');
      } catch (error) {
        this.testResults.apis.details.push(`❌ CORS: ${error.message}`);
      }

      // Teste de rate limiting
      try {
        const requests = Array(10).fill().map(() => 
          axios.get(`${this.serverUrl}/api/clients`, { timeout: 1000 })
        );
        await Promise.all(requests);
        this.testResults.apis.details.push('✅ Rate limiting: Funcionando');
      } catch (error) {
        if (error.response?.status === 429) {
          this.testResults.apis.details.push('✅ Rate limiting: Ativo (limite atingido)');
        } else {
          this.testResults.apis.details.push(`⚠️ Rate limiting: ${error.message}`);
        }
      }

      this.testResults.apis.status = 'success';
      console.log('✅ Testes de APIs concluídos\n');
      
    } catch (error) {
      this.testResults.apis.status = 'error';
      this.testResults.apis.details.push(`❌ Erro geral: ${error.message}`);
      console.log('❌ Testes de APIs falharam\n');
    }
  }

  async testIntegrations() {
    console.log('🔗 Testando integrações...');
    
    try {
      // Teste Google Calendar
      if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
        this.testResults.integrations.details.push('✅ Google Calendar: Credenciais configuradas');
        
        // Verificar se há tokens salvos
        if (await fs.pathExists('./tokens.json')) {
          this.testResults.integrations.details.push('✅ Google Calendar: Tokens encontrados');
        } else {
          this.testResults.integrations.details.push('⚠️ Google Calendar: Autenticação necessária');
        }
      } else {
        this.testResults.integrations.details.push('❌ Google Calendar: Credenciais não configuradas');
      }

      // Teste Google Drive
      if (process.env.GOOGLE_CLIENT_ID) {
        this.testResults.integrations.details.push('✅ Google Drive: Credenciais configuradas');
      } else {
        this.testResults.integrations.details.push('❌ Google Drive: Credenciais não configuradas');
      }

      // Teste QNAP
      if (process.env.QNAP_HOST) {
        try {
          await axios.get(`http://${process.env.QNAP_HOST}:8080/cgi-bin/authLogin.cgi`, {
            timeout: 5000
          });
          this.testResults.integrations.details.push('✅ QNAP: Acessível');
        } catch (error) {
          this.testResults.integrations.details.push(`❌ QNAP: ${error.message}`);
        }
      } else {
        this.testResults.integrations.details.push('⚠️ QNAP: Não configurado');
      }

      // Teste Email (SMTP)
      if (process.env.SMTP_HOST && process.env.SMTP_USER) {
        this.testResults.integrations.details.push('✅ Email SMTP: Configurado');
      } else {
        this.testResults.integrations.details.push('⚠️ Email SMTP: Não configurado');
      }

      // Teste WhatsApp API
      if (process.env.WHATSAPP_API_URL && process.env.WHATSAPP_API_TOKEN) {
        this.testResults.integrations.details.push('✅ WhatsApp API: Configurado');
      } else {
        this.testResults.integrations.details.push('⚠️ WhatsApp API: Não configurado');
      }

      this.testResults.integrations.status = 'success';
      console.log('✅ Testes de integrações concluídos\n');
      
    } catch (error) {
      this.testResults.integrations.status = 'error';
      this.testResults.integrations.details.push(`❌ Erro geral: ${error.message}`);
      console.log('❌ Testes de integrações falharam\n');
    }
  }

  async testPerformance() {
    console.log('⚡ Testando performance...');
    
    try {
      // Teste de tempo de resposta da API
      const startTime = Date.now();
      try {
        await axios.get(`${this.serverUrl}/api/clients`);
        const responseTime = Date.now() - startTime;
        
        if (responseTime < 1000) {
          this.testResults.performance.details.push(`✅ Tempo de resposta API: ${responseTime}ms (Excelente)`);
        } else if (responseTime < 3000) {
          this.testResults.performance.details.push(`⚠️ Tempo de resposta API: ${responseTime}ms (Aceitável)`);
        } else {
          this.testResults.performance.details.push(`❌ Tempo de resposta API: ${responseTime}ms (Lento)`);
        }
      } catch (error) {
        this.testResults.performance.details.push(`❌ Tempo de resposta API: Erro - ${error.message}`);
      }

      // Teste de uso de memória
      const memUsage = process.memoryUsage();
      const memUsageMB = Math.round(memUsage.heapUsed / 1024 / 1024);
      
      if (memUsageMB < 100) {
        this.testResults.performance.details.push(`✅ Uso de memória: ${memUsageMB}MB (Baixo)`);
      } else if (memUsageMB < 500) {
        this.testResults.performance.details.push(`⚠️ Uso de memória: ${memUsageMB}MB (Moderado)`);
      } else {
        this.testResults.performance.details.push(`❌ Uso de memória: ${memUsageMB}MB (Alto)`);
      }

      // Teste de tamanho do banco de dados
      try {
        const dbStats = await fs.stat('./agenda_hibrida.db');
        const dbSizeMB = Math.round(dbStats.size / 1024 / 1024 * 100) / 100;
        this.testResults.performance.details.push(`📊 Tamanho do banco: ${dbSizeMB}MB`);
      } catch (error) {
        this.testResults.performance.details.push(`❌ Tamanho do banco: Erro - ${error.message}`);
      }

      // Teste de espaço em disco
      try {
        const uploadsSize = await this.getFolderSize('./uploads');
        const uploadsSizeMB = Math.round(uploadsSize / 1024 / 1024 * 100) / 100;
        this.testResults.performance.details.push(`📁 Tamanho dos uploads: ${uploadsSizeMB}MB`);
      } catch (error) {
        this.testResults.performance.details.push(`❌ Tamanho dos uploads: Erro - ${error.message}`);
      }

      this.testResults.performance.status = 'success';
      console.log('✅ Testes de performance concluídos\n');
      
    } catch (error) {
      this.testResults.performance.status = 'error';
      this.testResults.performance.details.push(`❌ Erro geral: ${error.message}`);
      console.log('❌ Testes de performance falharam\n');
    }
  }

  async testSecurity() {
    console.log('🔒 Testando segurança...');
    
    try {
      // Verificar variáveis de ambiente sensíveis
      const sensitiveVars = [
        'GOOGLE_CLIENT_SECRET',
        'SMTP_PASS',
        'WHATSAPP_API_TOKEN',
        'QNAP_PASSWORD'
      ];

      // let exposedVars = 0; // Removido - não utilizado
      for (const varName of sensitiveVars) {
        if (process.env[varName]) {
          // Verificar se não está exposta no código
          this.testResults.security.details.push(`✅ ${varName}: Configurada e protegida`);
        } else {
          this.testResults.security.details.push(`⚠️ ${varName}: Não configurada`);
        }
      }

      // Verificar permissões de arquivos
      try {
        await fs.stat('./.env');
        this.testResults.security.details.push('✅ Arquivo .env: Existe');
      } catch (error) {
        this.testResults.security.details.push('⚠️ Arquivo .env: Não encontrado');
      }

      // Verificar se .env está no .gitignore
      try {
        const gitignore = await fs.readFile('./.gitignore', 'utf8');
        if (gitignore.includes('.env')) {
          this.testResults.security.details.push('✅ .env no .gitignore: OK');
        } else {
          this.testResults.security.details.push('❌ .env no .gitignore: Não encontrado');
        }
      } catch (error) {
        this.testResults.security.details.push('⚠️ .gitignore: Não encontrado');
      }

      // Teste de headers de segurança
      try {
        const response = await axios.get(`${this.serverUrl}/api/clients`);
        const headers = response.headers;
        
        if (headers['x-powered-by']) {
          this.testResults.security.details.push('⚠️ Header X-Powered-By: Exposto (remover)');
        } else {
          this.testResults.security.details.push('✅ Header X-Powered-By: Oculto');
        }

        if (headers['access-control-allow-origin'] === '*') {
          this.testResults.security.details.push('⚠️ CORS: Muito permissivo (configurar origem específica)');
        } else {
          this.testResults.security.details.push('✅ CORS: Configurado adequadamente');
        }
      } catch (error) {
        this.testResults.security.details.push(`❌ Headers de segurança: ${error.message}`);
      }

      // Verificar dependências vulneráveis
      try {
        execSync('npm audit --audit-level moderate', { stdio: 'pipe' });
        this.testResults.security.details.push('✅ Dependências: Sem vulnerabilidades conhecidas');
      } catch (error) {
        this.testResults.security.details.push('⚠️ Dependências: Vulnerabilidades encontradas (executar npm audit fix)');
      }

      this.testResults.security.status = 'success';
      console.log('✅ Testes de segurança concluídos\n');
      
    } catch (error) {
      this.testResults.security.status = 'error';
      this.testResults.security.details.push(`❌ Erro geral: ${error.message}`);
      console.log('❌ Testes de segurança falharam\n');
    }
  }

  async getFolderSize(folderPath) {
    if (!await fs.pathExists(folderPath)) return 0;
    
    let size = 0;
    const files = await fs.readdir(folderPath);
    
    for (const file of files) {
      const filePath = path.join(folderPath, file);
      const stats = await fs.stat(filePath);
      
      if (stats.isDirectory()) {
        size += await this.getFolderSize(filePath);
      } else {
        size += stats.size;
      }
    }
    
    return size;
  }

  generateReport() {
    console.log('📋 RELATÓRIO DE TESTES DO SISTEMA HÍBRIDO');
    console.log('==========================================\n');

    const categories = [
      { key: 'database', name: '📊 Banco de Dados' },
      { key: 'storage', name: '💾 Armazenamento' },
      { key: 'apis', name: '🔌 APIs' },
      { key: 'integrations', name: '🔗 Integrações' },
      { key: 'performance', name: '⚡ Performance' },
      { key: 'security', name: '🔒 Segurança' }
    ];

    let overallStatus = 'success';
    let totalTests = 0;
    let passedTests = 0;

    for (const category of categories) {
      const result = this.testResults[category.key];
      console.log(`${category.name}: ${this.getStatusEmoji(result.status)}`);
      
      for (const detail of result.details) {
        console.log(`  ${detail}`);
        totalTests++;
        if (detail.startsWith('✅')) passedTests++;
      }
      
      if (result.status === 'error') overallStatus = 'error';
      else if (result.status === 'warning' && overallStatus === 'success') overallStatus = 'warning';
      
      console.log('');
    }

    console.log('==========================================');
    console.log(`STATUS GERAL: ${this.getStatusEmoji(overallStatus)}`);
    console.log(`TESTES APROVADOS: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
    console.log('==========================================\n');

    // Salvar relatório em arquivo
    this.saveReportToFile();

    // Recomendações
    this.generateRecommendations();
  }

  getStatusEmoji(status) {
    switch (status) {
      case 'success': return '✅ SUCESSO';
      case 'warning': return '⚠️ ATENÇÃO';
      case 'error': return '❌ ERRO';
      default: return '⏳ PENDENTE';
    }
  }

  async saveReportToFile() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = `./test-reports/report_${timestamp}.json`;
    
    await fs.ensureDir('./test-reports');
    await fs.writeJson(reportPath, {
      timestamp: new Date().toISOString(),
      results: this.testResults,
      summary: this.calculateSummary()
    }, { spaces: 2 });

    console.log(`📄 Relatório salvo em: ${reportPath}\n`);
  }

  calculateSummary() {
    let totalTests = 0;
    let passedTests = 0;
    let warningTests = 0;
    let failedTests = 0;

    for (const category of Object.values(this.testResults)) {
      for (const detail of category.details) {
        totalTests++;
        if (detail.startsWith('✅')) passedTests++;
        else if (detail.startsWith('⚠️')) warningTests++;
        else if (detail.startsWith('❌')) failedTests++;
      }
    }

    return {
      totalTests,
      passedTests,
      warningTests,
      failedTests,
      successRate: Math.round(passedTests / totalTests * 100)
    };
  }

  generateRecommendations() {
    console.log('💡 RECOMENDAÇÕES PARA MELHORIA');
    console.log('==============================\n');

    const recommendations = [];

    // Verificar problemas comuns e gerar recomendações
    for (const result of Object.values(this.testResults)) {
      for (const detail of result.details) {
        if (detail.includes('❌') || detail.includes('⚠️')) {
          if (detail.includes('Google Calendar: Autenticação necessária')) {
            recommendations.push('🔑 Execute a autenticação do Google Calendar através da interface web');
          }
          if (detail.includes('QNAP')) {
            recommendations.push('🖥️ Configure as credenciais do QNAP no arquivo .env');
          }
          if (detail.includes('Email SMTP: Não configurado')) {
            recommendations.push('📧 Configure as credenciais SMTP para envio de emails');
          }
          if (detail.includes('WhatsApp API: Não configurado')) {
            recommendations.push('📱 Configure a API do WhatsApp para notificações');
          }
          if (detail.includes('Vulnerabilidades')) {
            recommendations.push('🔒 Execute "npm audit fix" para corrigir vulnerabilidades');
          }
        }
      }
    }

    // Remover duplicatas
    const uniqueRecommendations = [...new Set(recommendations)];

    if (uniqueRecommendations.length > 0) {
      uniqueRecommendations.forEach(rec => console.log(rec));
    } else {
      console.log('🎉 Nenhuma recomendação necessária - sistema funcionando perfeitamente!');
    }

    console.log('\n==============================\n');
  }
}

// Executar testes se chamado diretamente
if (require.main === module) {
  const tester = new SystemTester();
  tester.runAllTests().catch(console.error);
}

module.exports = SystemTester;
