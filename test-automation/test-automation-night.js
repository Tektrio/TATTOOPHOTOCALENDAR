#!/usr/bin/env node

/**
 * Test Automation Night - Orquestrador Principal
 * Sistema de testes autônomos que roda durante a noite
 * - Executa múltiplos ciclos de testes
 * - Corrige bugs automaticamente
 * - Monitora operações Google
 * - Gera relatórios detalhados
 */

const { exec, spawn } = require('child_process');
const fs = require('fs-extra');
const path = require('path');
const HealthMonitor = require('./health-monitor');
const GoogleSafetyChecker = require('./google-safety-checker');
const AutoFix = require('./auto-fix');
const ReportGenerator = require('./report-generator');

class TestAutomationNight {
  constructor(config) {
    this.config = config;
    this.projectRoot = config.projectRoot;
    this.startTime = Date.now();
    this.endTime = null;
    this.targetDuration = config.duration || 8 * 60 * 60 * 1000; // 8 horas por padrão
    this.cycleCount = 0;
    this.isRunning = false;
    
    // Inicializar componentes
    this.healthMonitor = new HealthMonitor({
      ...config,
      logsDir: path.join(config.projectRoot, 'test-automation', 'logs')
    });
    
    this.googleSafety = new GoogleSafetyChecker({
      logsDir: path.join(config.projectRoot, 'test-automation', 'logs')
    });
    
    this.autoFix = new AutoFix({
      ...config,
      logsDir: path.join(config.projectRoot, 'test-automation', 'logs')
    });
    
    this.reportGenerator = new ReportGenerator({
      ...config,
      outputDir: path.join(config.projectRoot, 'RELATORIOS_NOTURNO'),
      logsDir: path.join(config.projectRoot, 'test-automation', 'logs')
    });
    
    this.logFile = path.join(config.projectRoot, 'test-automation', 'logs', `night-test-${Date.now()}.log`);
    
    // Processos dos servidores
    this.backendProcess = null;
    this.frontendProcess = null;
  }

  /**
   * Inicia execução noturna
   */
  async start() {
    this.log('🌙 Iniciando Sistema de Testes Autônomos Noturnos...');
    this.log(`⏰ Duração configurada: ${this.targetDuration / 1000 / 60 / 60} horas`);
    this.log(`📅 Início: ${new Date().toLocaleString('pt-BR')}`);
    
    this.isRunning = true;

    try {
      // Fase 1: Inicialização
      await this.initializePhase();
      
      // Fase 2: Ciclos de Testes
      await this.testingPhase();
      
      // Fase 3: Finalização
      await this.finalizationPhase();
      
      this.log('✅ Execução noturna concluída com sucesso!');
    } catch (error) {
      this.log(`❌ Erro durante execução: ${error.message}`);
      this.log(error.stack);
    } finally {
      await this.cleanup();
    }
  }

  /**
   * Fase 1: Inicialização (5 min)
   */
  async initializePhase() {
    this.log('📋 FASE 1: Inicialização');
    
    // 1. Verificar e iniciar servidores
    if (this.config.startServers) {
      this.log('🚀 Iniciando servidores...');
      await this.startServers();
    }
    
    // 2. Verificar saúde inicial
    this.log('🏥 Verificando saúde dos servidores...');
    await this.healthMonitor.startMonitoring();
    const initialHealth = await this.healthMonitor.checkAllServices();
    
    if (!initialHealth.overall) {
      this.log('⚠️ Servidores não estão saudáveis. Tentando reiniciar...');
      await this.startServers();
      await this.sleep(10000);
      
      const healthAfterRestart = await this.healthMonitor.checkAllServices();
      if (!healthAfterRestart.overall) {
        throw new Error('Servidores não iniciaram corretamente');
      }
    }
    
    this.log('✅ Servidores saudáveis e prontos');
    
    // 3. Criar estrutura de pastas
    this.log('📁 Criando estrutura de pastas...');
    await this.ensureDirectories();
    
    // 4. Instalar dependências do Playwright se necessário
    if (!await fs.pathExists(path.join(this.projectRoot, 'agenda-hibrida-frontend', 'node_modules', '@playwright'))) {
      this.log('📦 Instalando Playwright...');
      await this.executeCommand('cd agenda-hibrida-frontend && npm run playwright:install');
    }
    
    this.log('✅ Inicialização completa\n');
  }

  /**
   * Fase 2: Ciclos de Testes
   */
  async testingPhase() {
    this.log('🔄 FASE 2: Ciclos de Testes');
    
    while (this.shouldContinue()) {
      this.cycleCount++;
      this.log(`\n${'='.repeat(80)}`);
      this.log(`🔄 CICLO ${this.cycleCount} - ${new Date().toLocaleString('pt-BR')}`);
      this.log(`${'='.repeat(80)}\n`);
      
      const cycleStartTime = Date.now();
      
      try {
        // 1. Executar testes E2E Playwright
        const testResults = await this.runPlaywrightTests();
        this.reportGenerator.addTestResults(testResults);
        
        // 2. Análise de falhas
        if (testResults.failed > 0) {
          this.log(`📊 ${testResults.failed} testes falharam. Analisando...`);
          
          // 3. Correção automática
          const fixResults = await this.autoFix.analyzeAndFix(testResults);
          this.reportGenerator.addFixes(fixResults.fixes);
          this.log(`🔧 ${fixResults.fixed} correções aplicadas automaticamente`);
          
          // 4. Re-executar testes das correções
          if (fixResults.fixed > 0) {
            this.log('🔄 Re-executando testes corrigidos...');
            await this.sleep(2000);
            const retestResults = await this.runPlaywrightTests();
            this.reportGenerator.addTestResults(retestResults);
          }
        } else {
          this.log('✅ Todos os testes passaram!');
        }
        
        // 5. Testes de navegador manual
        if (this.config.browserTests) {
          this.log('🌐 Executando testes de navegador...');
          const browserResults = await this.runBrowserTests();
          this.reportGenerator.addBrowserTests(browserResults);
        }
        
        // 6. Coleta de métricas
        const healthData = await this.healthMonitor.performHealthCheck();
        this.reportGenerator.addHealthData(healthData);
        
        // 7. Verificar operações Google
        const googleOps = {
          blocked: this.googleSafety.blockedOperations,
          allowed: this.googleSafety.allowedOperations
        };
        this.reportGenerator.addGoogleOperations(googleOps);
        
        // 8. Salvar dados do ciclo
        const cycleDuration = Date.now() - cycleStartTime;
        this.reportGenerator.addCycle({
          number: this.cycleCount,
          success: testResults.failed === 0,
          duration: cycleDuration,
          e2eTests: testResults,
          fixes: fixResults || {},
          health: healthData
        });
        
        this.log(`✅ Ciclo ${this.cycleCount} concluído em ${(cycleDuration / 1000 / 60).toFixed(1)} minutos`);
        
        // 9. Pausa estratégica
        if (this.shouldContinue()) {
          const pauseTime = this.config.cyclePause || 5 * 60 * 1000; // 5 minutos
          this.log(`⏸️ Pausa estratégica de ${pauseTime / 1000 / 60} minutos...`);
          await this.sleep(pauseTime);
        }
        
      } catch (error) {
        this.log(`❌ Erro no ciclo ${this.cycleCount}: ${error.message}`);
        this.log(error.stack);
        
        // Pausa maior em caso de erro
        await this.sleep(10 * 60 * 1000); // 10 minutos
      }
    }
    
    this.log('\n✅ Fase de testes concluída\n');
  }

  /**
   * Fase 3: Finalização (10 min)
   */
  async finalizationPhase() {
    this.log('📊 FASE 3: Finalização');
    this.endTime = Date.now();
    
    // 1. Parar monitoramento
    this.healthMonitor.stopMonitoring();
    
    // 2. Gerar relatórios finais
    this.log('📄 Gerando relatórios finais...');
    const reports = await this.reportGenerator.saveAllReports();
    
    // 3. Salvar relatórios de correções
    if (this.autoFix.fixes.length > 0) {
      await this.autoFix.saveReport(path.join(this.projectRoot, 'RELATORIOS_NOTURNO'));
    }
    
    // 4. Salvar relatórios Google
    await this.googleSafety.saveReport(path.join(this.projectRoot, 'RELATORIOS_NOTURNO'));
    
    // 5. Salvar relatório de saúde
    const healthReport = this.healthMonitor.generateHealthReport();
    const healthFile = path.join(
      this.projectRoot, 
      'RELATORIOS_NOTURNO', 
      `HEALTH_REPORT_${new Date().toISOString().replace(/[:.]/g, '-')}.md`
    );
    await fs.writeFile(healthFile, healthReport);
    
    this.log('✅ Todos os relatórios gerados');
    
    // 6. Imprimir resumo
    this.printSummary();
    
    // 7. Criar arquivo de notificação para manhã
    await this.createMorningNotification();
  }

  /**
   * Executa testes Playwright
   */
  async runPlaywrightTests() {
    this.log('🎭 Executando testes E2E Playwright...');
    
    return new Promise((resolve) => {
      exec(
        'npm run test:e2e',
        {
          cwd: path.join(this.projectRoot, 'agenda-hibrida-frontend'),
          maxBuffer: 10 * 1024 * 1024 // 10MB buffer
        },
        (error, stdout, stderr) => {
          // Parsear resultados
          const results = {
            total: 0,
            passed: 0,
            failed: 0,
            skipped: 0,
            duration: 0,
            tests: []
          };

          // Extrair informações do output
          const passedMatch = stdout.match(/(\d+) passed/);
          const failedMatch = stdout.match(/(\d+) failed/);
          const skippedMatch = stdout.match(/(\d+) skipped/);

          if (passedMatch) results.passed = parseInt(passedMatch[1]);
          if (failedMatch) results.failed = parseInt(failedMatch[1]);
          if (skippedMatch) results.skipped = parseInt(skippedMatch[1]);
          
          results.total = results.passed + results.failed + results.skipped;

          this.log(`📊 Resultados: ${results.passed}/${results.total} passaram`);
          
          if (results.failed > 0) {
            this.log(`⚠️ ${results.failed} testes falharam`);
          }

          resolve(results);
        }
      );
    });
  }

  /**
   * Executa testes no navegador
   */
  async runBrowserTests() {
    this.log('🌐 Executando testes de navegador manual...');
    
    // Aqui você poderia usar o MCP browser tools
    // Por enquanto, vamos simular
    return {
      pagesVisited: [],
      screenshots: [],
      errors: []
    };
  }

  /**
   * Inicia servidores
   */
  async startServers() {
    this.log('🚀 Iniciando backend...');
    
    // Iniciar backend
    this.backendProcess = spawn('npm', ['start'], {
      cwd: path.join(this.projectRoot, 'agenda-hibrida-v2'),
      detached: true,
      stdio: 'ignore'
    });
    
    this.backendProcess.unref();
    await this.sleep(10000); // 10 segundos para backend iniciar
    
    this.log('🚀 Iniciando frontend...');
    
    // Iniciar frontend
    this.frontendProcess = spawn('npm', ['run', 'dev'], {
      cwd: path.join(this.projectRoot, 'agenda-hibrida-frontend'),
      detached: true,
      stdio: 'ignore'
    });
    
    this.frontendProcess.unref();
    await this.sleep(15000); // 15 segundos para frontend iniciar
    
    this.log('✅ Servidores iniciados');
  }

  /**
   * Verifica se deve continuar executando
   */
  shouldContinue() {
    if (!this.isRunning) return false;
    
    const elapsed = Date.now() - this.startTime;
    const shouldContinue = elapsed < this.targetDuration;
    
    if (!shouldContinue) {
      this.log(`⏰ Tempo alvo atingido (${elapsed / 1000 / 60 / 60} horas)`);
    }
    
    return shouldContinue;
  }

  /**
   * Garante que diretórios existem
   */
  async ensureDirectories() {
    const dirs = [
      'test-automation/logs',
      'RELATORIOS_NOTURNO/screenshots',
      'RELATORIOS_NOTURNO/videos',
      'RELATORIOS_NOTURNO/logs'
    ];
    
    for (const dir of dirs) {
      await fs.ensureDir(path.join(this.projectRoot, dir));
    }
  }

  /**
   * Executa comando
   */
  async executeCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, { cwd: this.projectRoot }, (error, stdout, stderr) => {
        if (error) {
          this.log(`❌ Erro ao executar: ${command}`);
          this.log(stderr);
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }

  /**
   * Sleep helper
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Imprime resumo
   */
  printSummary() {
    const duration = (this.endTime - this.startTime) / 1000 / 60 / 60;
    
    this.log('\n' + '='.repeat(80));
    this.log('📊 RESUMO DA EXECUÇÃO NOTURNA');
    this.log('='.repeat(80));
    this.log(`⏰ Duração: ${duration.toFixed(2)} horas`);
    this.log(`🔄 Ciclos executados: ${this.cycleCount}`);
    this.log(`📊 Total de testes: ${this.reportGenerator.data.totalTests}`);
    this.log(`✅ Testes passaram: ${this.reportGenerator.data.passedTests}`);
    this.log(`❌ Testes falharam: ${this.reportGenerator.data.failedTests}`);
    this.log(`🔧 Bugs corrigidos: ${this.reportGenerator.data.fixes.length}`);
    this.log(`🔒 Operações Google bloqueadas: ${this.googleSafety.blockedOperations.length}`);
    this.log('='.repeat(80) + '\n');
  }

  /**
   * Cria notificação para manhã
   */
  async createMorningNotification() {
    const notification = `# 🌅 BOM DIA!

## Sistema de Testes Autônomos - Execução Concluída

**Data:** ${new Date().toLocaleString('pt-BR')}

### 📊 Resumo Rápido
- ⏰ Duração: ${((this.endTime - this.startTime) / 1000 / 60 / 60).toFixed(2)} horas
- 🔄 Ciclos: ${this.cycleCount}
- ✅ Testes Passaram: ${this.reportGenerator.data.passedTests}/${this.reportGenerator.data.totalTests}
- 🔧 Bugs Corrigidos: ${this.reportGenerator.data.fixes.length}
- 🔒 Operações Google Bloqueadas: ${this.googleSafety.blockedOperations.length}

### 📁 Próximos Passos

1. **Revisar Relatórios** na pasta \`RELATORIOS_NOTURNO/\`
2. **Verificar Plano de Correções** em \`PLANO_CORRECOES_MANHA_[DATA].md\`
3. **Aprovar correções automáticas** se estiverem OK
4. **Revisar operações Google bloqueadas** (se houver)

### 📄 Arquivos Gerados

- \`RELATORIO_TESTES_NOTURNO_[DATA].md\` - Relatório principal
- \`BUGS_CORRIGIDOS_AUTO_[DATA].md\` - Correções aplicadas
- \`PLANO_CORRECOES_MANHA_[DATA].md\` - Plano para aprovação
- \`OPERACOES_GOOGLE_PULADAS_[DATA].md\` - Operações bloqueadas

---

**Status do Sistema:** ${this.reportGenerator.data.failedTests === 0 ? '✅ PERFEITO' : '⚠️ REQUER ATENÇÃO'}
`;

    const notificationFile = path.join(
      this.projectRoot,
      'RELATORIOS_NOTURNO',
      `_BOM_DIA_LEIA_PRIMEIRO.md`
    );
    
    await fs.writeFile(notificationFile, notification);
    this.log(`📧 Notificação matinal criada: ${notificationFile}`);
  }

  /**
   * Cleanup
   */
  async cleanup() {
    this.log('🧹 Limpeza final...');
    
    // Não matar servidores - deixar rodando
    this.log('✅ Limpeza concluída');
  }

  /**
   * Log helper
   */
  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  // Parsear argumentos
  const args = process.argv.slice(2);
  const config = {
    projectRoot: '/Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR',
    duration: 8 * 60 * 60 * 1000, // 8 horas
    startServers: true,
    browserTests: false, // Desabilitado por padrão
    cyclePause: 5 * 60 * 1000, // 5 minutos
    backendUrl: 'http://localhost:3001',
    frontendUrl: 'http://localhost:5173'
  };

  // Processar argumentos
  args.forEach(arg => {
    if (arg.startsWith('--duration=')) {
      const duration = arg.split('=')[1];
      if (duration.endsWith('h')) {
        config.duration = parseInt(duration) * 60 * 60 * 1000;
      } else if (duration.endsWith('m')) {
        config.duration = parseInt(duration) * 60 * 1000;
      }
    } else if (arg === '--no-start-servers') {
      config.startServers = false;
    } else if (arg === '--browser-tests') {
      config.browserTests = true;
    }
  });

  // Criar e iniciar
  const automation = new TestAutomationNight(config);
  automation.start().catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = TestAutomationNight;

