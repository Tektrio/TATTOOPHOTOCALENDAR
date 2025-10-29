/**
 * Health Monitor - Sistema de Monitoramento de Saúde dos Servidores
 * Verifica se backend e frontend estão respondendo
 * Monitora uso de memória e recursos
 * Detecta crashes e reinicia serviços quando necessário
 */

const axios = require('axios');
const { exec } = require('child_process');
const fs = require('fs-extra');
const path = require('path');

class HealthMonitor {
  constructor(config) {
    this.config = config;
    this.backendUrl = config.backendUrl || 'http://localhost:3001';
    this.frontendUrl = config.frontendUrl || 'http://localhost:5173';
    this.checkInterval = config.checkInterval || 30000; // 30 segundos
    this.maxMemoryMB = config.maxMemoryMB || 1024; // 1GB
    this.restartAttempts = 0;
    this.maxRestartAttempts = 3;
    this.healthHistory = [];
    this.logFile = path.join(config.logsDir, `health-monitor-${Date.now()}.log`);
    this.isMonitoring = false;
    this.monitorInterval = null;
  }

  /**
   * Inicia o monitoramento contínuo
   */
  async startMonitoring() {
    this.log('🏥 Iniciando monitoramento de saúde...');
    this.isMonitoring = true;

    // Verificação inicial
    const initialHealth = await this.checkAllServices();
    this.log(`Status inicial: ${JSON.stringify(initialHealth, null, 2)}`);

    // Monitoramento contínuo
    this.monitorInterval = setInterval(async () => {
      if (this.isMonitoring) {
        await this.performHealthCheck();
      }
    }, this.checkInterval);

    return initialHealth;
  }

  /**
   * Para o monitoramento
   */
  stopMonitoring() {
    this.log('🛑 Parando monitoramento de saúde...');
    this.isMonitoring = false;
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }

  /**
   * Realiza verificação de saúde completa
   */
  async performHealthCheck() {
    const health = await this.checkAllServices();
    this.healthHistory.push({
      timestamp: Date.now(),
      ...health
    });

    // Manter apenas últimas 100 verificações
    if (this.healthHistory.length > 100) {
      this.healthHistory.shift();
    }

    // Verificar se precisa reiniciar algum serviço
    if (!health.backend.healthy && this.restartAttempts < this.maxRestartAttempts) {
      this.log('⚠️ Backend não saudável. Tentando reiniciar...');
      await this.restartBackend();
    }

    if (!health.frontend.healthy && this.restartAttempts < this.maxRestartAttempts) {
      this.log('⚠️ Frontend não saudável. Tentando reiniciar...');
      await this.restartFrontend();
    }

    return health;
  }

  /**
   * Verifica saúde de todos os serviços
   */
  async checkAllServices() {
    const [backend, frontend, system] = await Promise.all([
      this.checkBackend(),
      this.checkFrontend(),
      this.checkSystemResources()
    ]);

    return {
      backend,
      frontend,
      system,
      overall: backend.healthy && frontend.healthy && system.healthy
    };
  }

  /**
   * Verifica saúde do backend
   */
  async checkBackend() {
    const startTime = Date.now();
    try {
      const response = await axios.get(`${this.backendUrl}/health`, {
        timeout: 5000,
        validateStatus: () => true
      });

      const responseTime = Date.now() - startTime;
      const healthy = response.status === 200 && responseTime < 3000;

      return {
        healthy,
        status: response.status,
        responseTime,
        data: response.data || null,
        error: null
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.log(`❌ Erro ao verificar backend: ${error.message}`);
      return {
        healthy: false,
        status: 0,
        responseTime,
        data: null,
        error: error.message
      };
    }
  }

  /**
   * Verifica saúde do frontend
   */
  async checkFrontend() {
    const startTime = Date.now();
    try {
      const response = await axios.get(this.frontendUrl, {
        timeout: 5000,
        validateStatus: () => true
      });

      const responseTime = Date.now() - startTime;
      const healthy = response.status === 200 && responseTime < 3000;

      return {
        healthy,
        status: response.status,
        responseTime,
        error: null
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.log(`❌ Erro ao verificar frontend: ${error.message}`);
      return {
        healthy: false,
        status: 0,
        responseTime,
        error: error.message
      };
    }
  }

  /**
   * Verifica recursos do sistema
   */
  async checkSystemResources() {
    try {
      const memoryUsage = process.memoryUsage();
      const memoryMB = Math.round(memoryUsage.heapUsed / 1024 / 1024);
      const memoryPercent = Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100);

      const healthy = memoryMB < this.maxMemoryMB && memoryPercent < 90;

      return {
        healthy,
        memory: {
          used: memoryMB,
          total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
          percent: memoryPercent
        },
        uptime: process.uptime()
      };
    } catch (error) {
      this.log(`❌ Erro ao verificar recursos: ${error.message}`);
      return {
        healthy: false,
        error: error.message
      };
    }
  }

  /**
   * Reinicia o backend
   */
  async restartBackend() {
    this.restartAttempts++;
    this.log(`🔄 Tentativa ${this.restartAttempts}/${this.maxRestartAttempts} de reiniciar backend...`);

    return new Promise((resolve) => {
      // Tentar reiniciar via PM2 se disponível, senão via npm
      exec('cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-v2 && npm start', 
        (error, stdout, stderr) => {
          if (error) {
            this.log(`❌ Erro ao reiniciar backend: ${error.message}`);
            resolve(false);
          } else {
            this.log('✅ Backend reiniciado com sucesso');
            this.restartAttempts = 0;
            resolve(true);
          }
        }
      );
    });
  }

  /**
   * Reinicia o frontend
   */
  async restartFrontend() {
    this.restartAttempts++;
    this.log(`🔄 Tentativa ${this.restartAttempts}/${this.maxRestartAttempts} de reiniciar frontend...`);

    return new Promise((resolve) => {
      exec('cd /Users/luizlopes/Desktop/TATTOO_PHOTO_CALENDAR/agenda-hibrida-frontend && npm run dev', 
        (error, stdout, stderr) => {
          if (error) {
            this.log(`❌ Erro ao reiniciar frontend: ${error.message}`);
            resolve(false);
          } else {
            this.log('✅ Frontend reiniciado com sucesso');
            this.restartAttempts = 0;
            resolve(true);
          }
        }
      );
    });
  }

  /**
   * Obtém histórico de saúde
   */
  getHealthHistory() {
    return this.healthHistory;
  }

  /**
   * Obtém estatísticas de saúde
   */
  getHealthStats() {
    if (this.healthHistory.length === 0) {
      return null;
    }

    const totalChecks = this.healthHistory.length;
    const healthyChecks = this.healthHistory.filter(h => h.overall).length;
    const backendHealthy = this.healthHistory.filter(h => h.backend.healthy).length;
    const frontendHealthy = this.healthHistory.filter(h => h.frontend.healthy).length;

    const avgBackendResponseTime = this.healthHistory
      .filter(h => h.backend.responseTime)
      .reduce((acc, h) => acc + h.backend.responseTime, 0) / totalChecks;

    const avgFrontendResponseTime = this.healthHistory
      .filter(h => h.frontend.responseTime)
      .reduce((acc, h) => acc + h.frontend.responseTime, 0) / totalChecks;

    return {
      totalChecks,
      healthyChecks,
      healthRate: Math.round((healthyChecks / totalChecks) * 100),
      backend: {
        healthyChecks: backendHealthy,
        healthRate: Math.round((backendHealthy / totalChecks) * 100),
        avgResponseTime: Math.round(avgBackendResponseTime)
      },
      frontend: {
        healthyChecks: frontendHealthy,
        healthRate: Math.round((frontendHealthy / totalChecks) * 100),
        avgResponseTime: Math.round(avgFrontendResponseTime)
      }
    };
  }

  /**
   * Registra log
   */
  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    
    // Salvar em arquivo
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  /**
   * Gera relatório de saúde
   */
  generateHealthReport() {
    const stats = this.getHealthStats();
    if (!stats) {
      return '## Relatório de Saúde\n\nNenhum dado disponível ainda.';
    }

    return `## Relatório de Saúde do Sistema

### Resumo Geral
- **Total de Verificações:** ${stats.totalChecks}
- **Verificações Saudáveis:** ${stats.healthyChecks} (${stats.healthRate}%)

### Backend
- **Taxa de Saúde:** ${stats.backend.healthRate}%
- **Tempo Médio de Resposta:** ${stats.backend.avgResponseTime}ms
- **Verificações Saudáveis:** ${stats.backend.healthyChecks}/${stats.totalChecks}

### Frontend
- **Taxa de Saúde:** ${stats.frontend.healthRate}%
- **Tempo Médio de Resposta:** ${stats.frontend.avgResponseTime}ms
- **Verificações Saudáveis:** ${stats.frontend.healthyChecks}/${stats.totalChecks}

### Últimas 5 Verificações
${this.healthHistory.slice(-5).map((h, i) => `
${i + 1}. ${new Date(h.timestamp).toLocaleString('pt-BR')}
   - Backend: ${h.backend.healthy ? '✅' : '❌'} (${h.backend.responseTime}ms)
   - Frontend: ${h.frontend.healthy ? '✅' : '❌'} (${h.frontend.responseTime}ms)
   - Sistema: ${h.system.healthy ? '✅' : '❌'} (Memória: ${h.system.memory?.used || 0}MB)
`).join('')}
`;
  }
}

module.exports = HealthMonitor;

