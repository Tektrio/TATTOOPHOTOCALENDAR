/**
 * Google Safety Checker - Detector de Operações de Risco Google
 * Monitora e previne operações que possam causar banimento ou rate limiting
 * Rastreia uso de APIs Google (Calendar, Drive, Gmail, etc.)
 */

const fs = require('fs-extra');
const path = require('path');

class GoogleSafetyChecker {
  constructor(config) {
    this.config = config;
    this.logFile = path.join(config.logsDir, `google-safety-${Date.now()}.log`);
    
    // Limites de segurança por API
    this.limits = {
      calendar: {
        createEvents: { max: 10, window: 60000, name: 'Criar Eventos Calendar' }, // 10 por minuto
        readEvents: { max: 5, window: 60000, name: 'Ler Eventos Calendar' }, // 5 por minuto
        updateEvents: { max: 8, window: 60000, name: 'Atualizar Eventos Calendar' },
        deleteEvents: { max: 5, window: 60000, name: 'Deletar Eventos Calendar' },
        listCalendars: { max: 3, window: 60000, name: 'Listar Calendários' },
        syncAll: { max: 1, window: 300000, name: 'Sincronização Completa' } // 1 a cada 5 min
      },
      drive: {
        uploadFiles: { max: 5, window: 60000, name: 'Upload de Arquivos Drive' }, // 5 por minuto
        listFiles: { max: 10, window: 60000, name: 'Listar Arquivos Drive' },
        listFolders: { max: 5, window: 60000, name: 'Listar Pastas Drive' },
        deleteFiles: { max: 3, window: 60000, name: 'Deletar Arquivos Drive' },
        updatePermissions: { max: 2, window: 60000, name: 'Atualizar Permissões Drive' },
        recursiveList: { max: 1, window: 300000, name: 'Listagem Recursiva Drive' },
        createFolders: { max: 3, window: 60000, name: 'Criar Pastas Drive' }
      },
      gmail: {
        sendEmails: { max: 5, window: 60000, name: 'Enviar Emails' },
        listEmails: { max: 10, window: 60000, name: 'Listar Emails' },
        deleteEmails: { max: 5, window: 60000, name: 'Deletar Emails' }
      },
      general: {
        totalRequests: { max: 50, window: 3600000, name: 'Total de Requests' } // 50 por hora
      }
    };

    // Rastreamento de operações
    this.operations = {
      calendar: {},
      drive: {},
      gmail: {},
      general: { totalRequests: [] }
    };

    // Operações bloqueadas
    this.blockedOperations = [];
    
    // Operações permitidas
    this.allowedOperations = [];
  }

  /**
   * Verifica se uma operação é segura
   */
  checkOperation(api, operation, metadata = {}) {
    const limit = this.limits[api]?.[operation];
    
    if (!limit) {
      this.log(`⚠️ Operação desconhecida: ${api}.${operation}`);
      return { safe: true, reason: 'unknown_operation' };
    }

    // Limpar operações antigas fora da janela de tempo
    this.cleanOldOperations(api, operation, limit.window);

    // Verificar contador
    const count = this.getOperationCount(api, operation);
    const safe = count < limit.max;

    const result = {
      safe,
      api,
      operation,
      operationName: limit.name,
      count,
      limit: limit.max,
      window: limit.window,
      metadata,
      timestamp: Date.now()
    };

    if (!safe) {
      this.blockedOperations.push(result);
      this.log(`❌ OPERAÇÃO BLOQUEADA: ${limit.name} - ${count}/${limit.max} em ${limit.window}ms`);
      this.log(`   Metadata: ${JSON.stringify(metadata)}`);
    } else {
      // Registrar operação
      this.recordOperation(api, operation);
      this.allowedOperations.push(result);
      this.log(`✅ Operação permitida: ${limit.name} - ${count + 1}/${limit.max}`);
    }

    return result;
  }

  /**
   * Verifica operação de Calendar API
   */
  checkCalendarOperation(operation, metadata = {}) {
    return this.checkOperation('calendar', operation, metadata);
  }

  /**
   * Verifica operação de Drive API
   */
  checkDriveOperation(operation, metadata = {}) {
    return this.checkOperation('drive', operation, metadata);
  }

  /**
   * Verifica operação de Gmail API
   */
  checkGmailOperation(operation, metadata = {}) {
    return this.checkOperation('gmail', operation, metadata);
  }

  /**
   * Registra uma operação
   */
  recordOperation(api, operation) {
    const timestamp = Date.now();
    
    if (!this.operations[api][operation]) {
      this.operations[api][operation] = [];
    }
    
    this.operations[api][operation].push(timestamp);
    this.operations.general.totalRequests.push(timestamp);
  }

  /**
   * Limpa operações antigas
   */
  cleanOldOperations(api, operation, window) {
    const now = Date.now();
    const cutoff = now - window;
    
    if (this.operations[api][operation]) {
      this.operations[api][operation] = this.operations[api][operation].filter(
        timestamp => timestamp > cutoff
      );
    }

    // Limpar também o contador geral
    this.operations.general.totalRequests = this.operations.general.totalRequests.filter(
      timestamp => timestamp > cutoff
    );
  }

  /**
   * Obtém contagem de operações
   */
  getOperationCount(api, operation) {
    return this.operations[api][operation]?.length || 0;
  }

  /**
   * Obtém total de requests
   */
  getTotalRequests(windowMs = 3600000) {
    const now = Date.now();
    const cutoff = now - windowMs;
    return this.operations.general.totalRequests.filter(t => t > cutoff).length;
  }

  /**
   * Verifica se está próximo do limite
   */
  isNearLimit(api, operation, threshold = 0.8) {
    const limit = this.limits[api]?.[operation];
    if (!limit) return false;

    const count = this.getOperationCount(api, operation);
    return count >= (limit.max * threshold);
  }

  /**
   * Obtém tempo de espera necessário
   */
  getWaitTime(api, operation) {
    const limit = this.limits[api]?.[operation];
    if (!limit) return 0;

    const operations = this.operations[api][operation] || [];
    if (operations.length === 0) return 0;

    const oldestOperation = Math.min(...operations);
    const timeSinceOldest = Date.now() - oldestOperation;
    
    if (timeSinceOldest < limit.window) {
      return limit.window - timeSinceOldest;
    }

    return 0;
  }

  /**
   * Obtém estatísticas de uso
   */
  getUsageStats() {
    const stats = {
      totalAllowed: this.allowedOperations.length,
      totalBlocked: this.blockedOperations.length,
      totalRequests: this.getTotalRequests(),
      byApi: {}
    };

    // Estatísticas por API
    for (const api of ['calendar', 'drive', 'gmail']) {
      stats.byApi[api] = {};
      
      for (const operation in this.limits[api]) {
        const count = this.getOperationCount(api, operation);
        const limit = this.limits[api][operation];
        
        stats.byApi[api][operation] = {
          name: limit.name,
          count,
          limit: limit.max,
          percent: Math.round((count / limit.max) * 100),
          nearLimit: this.isNearLimit(api, operation),
          waitTime: this.getWaitTime(api, operation)
        };
      }
    }

    return stats;
  }

  /**
   * Gera relatório de operações bloqueadas
   */
  generateBlockedOperationsReport() {
    if (this.blockedOperations.length === 0) {
      return `## Operações Google Bloqueadas

✅ **Nenhuma operação foi bloqueada!**

Todas as operações executadas estavam dentro dos limites de segurança.`;
    }

    // Agrupar por tipo de operação
    const grouped = {};
    this.blockedOperations.forEach(op => {
      const key = `${op.api}.${op.operation}`;
      if (!grouped[key]) {
        grouped[key] = {
          operationName: op.operationName,
          count: 0,
          operations: []
        };
      }
      grouped[key].count++;
      grouped[key].operations.push(op);
    });

    let report = `## Operações Google Bloqueadas

❌ **${this.blockedOperations.length} operações foram bloqueadas por segurança**

### Resumo por Tipo

`;

    for (const [key, data] of Object.entries(grouped)) {
      report += `#### ${data.operationName}
- **Tentativas Bloqueadas:** ${data.count}
- **Razão:** Excedeu limite de segurança
- **Operações:**
`;
      data.operations.forEach((op, i) => {
        const time = new Date(op.timestamp).toLocaleString('pt-BR');
        report += `  ${i + 1}. ${time} - Tentativa ${op.count}/${op.limit}\n`;
        if (op.metadata && Object.keys(op.metadata).length > 0) {
          report += `     Metadata: ${JSON.stringify(op.metadata, null, 2)}\n`;
        }
      });
      report += '\n';
    }

    report += `### Recomendações

Para evitar bloqueios futuros:

1. **Reduzir frequência de operações:** Implementar debouncing/throttling
2. **Usar cache:** Evitar requests repetitivos
3. **Batch operations:** Agrupar múltiplas operações
4. **Implementar retry com exponential backoff**
5. **Monitorar quotas no Google Cloud Console**

### Limites de Segurança Configurados

**Google Calendar:**
- Criar Eventos: ${this.limits.calendar.createEvents.max}/min
- Ler Eventos: ${this.limits.calendar.readEvents.max}/min
- Sincronização Completa: ${this.limits.calendar.syncAll.max} a cada 5 min

**Google Drive:**
- Upload Arquivos: ${this.limits.drive.uploadFiles.max}/min
- Listar Arquivos: ${this.limits.drive.listFiles.max}/min
- Operações Recursivas: ${this.limits.drive.recursiveList.max} a cada 5 min

**Geral:**
- Total de Requests: ${this.limits.general.totalRequests.max}/hora
`;

    return report;
  }

  /**
   * Gera relatório de uso de APIs
   */
  generateUsageReport() {
    const stats = this.getUsageStats();

    let report = `## Relatório de Uso das APIs Google

### Resumo Geral
- **Total de Operações Permitidas:** ${stats.totalAllowed}
- **Total de Operações Bloqueadas:** ${stats.totalBlocked}
- **Total de Requests (última hora):** ${stats.totalRequests}
- **Taxa de Sucesso:** ${stats.totalAllowed > 0 ? Math.round((stats.totalAllowed / (stats.totalAllowed + stats.totalBlocked)) * 100) : 100}%

`;

    for (const [api, operations] of Object.entries(stats.byApi)) {
      report += `### ${api.toUpperCase()} API\n\n`;
      
      for (const [operation, data] of Object.entries(operations)) {
        const status = data.nearLimit ? '⚠️' : '✅';
        report += `${status} **${data.name}**: ${data.count}/${data.limit} (${data.percent}%)\n`;
        
        if (data.waitTime > 0) {
          report += `   ⏱️ Tempo de espera: ${Math.round(data.waitTime / 1000)}s\n`;
        }
        report += '\n';
      }
    }

    return report;
  }

  /**
   * Reseta contadores
   */
  reset() {
    this.operations = {
      calendar: {},
      drive: {},
      gmail: {},
      general: { totalRequests: [] }
    };
    this.blockedOperations = [];
    this.allowedOperations = [];
    this.log('🔄 Contadores resetados');
  }

  /**
   * Registra log
   */
  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(this.logFile, logMessage + '\n');
  }

  /**
   * Salva relatório em arquivo
   */
  async saveReport(outputDir) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const blockedReport = this.generateBlockedOperationsReport();
    const usageReport = this.generateUsageReport();

    const blockedFile = path.join(outputDir, `OPERACOES_GOOGLE_PULADAS_${timestamp}.md`);
    const usageFile = path.join(outputDir, `USO_APIS_GOOGLE_${timestamp}.md`);

    await fs.writeFile(blockedFile, blockedReport);
    await fs.writeFile(usageFile, usageReport);

    this.log(`📄 Relatórios salvos: ${blockedFile}, ${usageFile}`);
    
    return {
      blockedFile,
      usageFile
    };
  }
}

module.exports = GoogleSafetyChecker;

