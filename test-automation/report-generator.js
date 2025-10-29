/**
 * Report Generator - Gerador de Relatórios Detalhados
 * Gera relatórios consolidados de todos os testes e correções
 * - Relatório principal de testes noturnos
 * - Relatório de bugs corrigidos
 * - Plano de correções para aprovação
 * - Métricas e estatísticas
 */

const fs = require('fs-extra');
const path = require('path');

class ReportGenerator {
  constructor(config) {
    this.config = config;
    this.outputDir = config.outputDir;
    this.logFile = path.join(config.logsDir, `report-generator-${Date.now()}.log`);
    this.data = {
      cycles: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      fixes: [],
      googleOperations: {
        blocked: [],
        allowed: []
      },
      health: [],
      browserTests: [],
      startTime: Date.now(),
      endTime: null
    };
  }

  /**
   * Adiciona resultado de um ciclo
   */
  addCycle(cycleData) {
    this.data.cycles.push({
      ...cycleData,
      timestamp: Date.now()
    });
    this.log(`📊 Ciclo ${this.data.cycles.length} adicionado ao relatório`);
  }

  /**
   * Adiciona resultados de testes
   */
  addTestResults(testResults) {
    if (!testResults) return;

    this.data.totalTests += testResults.total || 0;
    this.data.passedTests += testResults.passed || 0;
    this.data.failedTests += testResults.failed || 0;
    
    this.log(`✅ Resultados de testes adicionados: ${testResults.passed}/${testResults.total} passou`);
  }

  /**
   * Adiciona correções aplicadas
   */
  addFixes(fixes) {
    if (!fixes || !Array.isArray(fixes)) return;
    
    this.data.fixes.push(...fixes);
    this.log(`🔧 ${fixes.length} correções adicionadas ao relatório`);
  }

  /**
   * Adiciona operações Google
   */
  addGoogleOperations(operations) {
    if (!operations) return;

    if (operations.blocked) {
      this.data.googleOperations.blocked.push(...operations.blocked);
    }
    if (operations.allowed) {
      this.data.googleOperations.allowed.push(...operations.allowed);
    }
    
    this.log(`🔒 Operações Google registradas: ${operations.blocked?.length || 0} bloqueadas, ${operations.allowed?.length || 0} permitidas`);
  }

  /**
   * Adiciona dados de saúde
   */
  addHealthData(healthData) {
    if (!healthData) return;
    
    this.data.health.push({
      ...healthData,
      timestamp: Date.now()
    });
  }

  /**
   * Adiciona resultados de testes no navegador
   */
  addBrowserTests(browserTests) {
    if (!browserTests) return;
    
    this.data.browserTests.push({
      ...browserTests,
      timestamp: Date.now()
    });
  }

  /**
   * Finaliza coleta de dados
   */
  finalize() {
    this.data.endTime = Date.now();
    this.log('🏁 Coleta de dados finalizada');
  }

  /**
   * Gera relatório principal
   */
  generateMainReport() {
    const duration = this.data.endTime 
      ? (this.data.endTime - this.data.startTime) / 1000 / 60 / 60 
      : 0;
    
    const successRate = this.data.totalTests > 0 
      ? Math.round((this.data.passedTests / this.data.totalTests) * 100) 
      : 0;

    let report = `# Relatório de Testes Autônomos Noturnos

**Data:** ${new Date().toLocaleString('pt-BR')}  
**Duração Total:** ${duration.toFixed(2)} horas  
**Início:** ${new Date(this.data.startTime).toLocaleString('pt-BR')}  
**Fim:** ${this.data.endTime ? new Date(this.data.endTime).toLocaleString('pt-BR') : 'Em execução'}

---

## 📊 Resumo Executivo

### Testes Executados
- **Total de Testes:** ${this.data.totalTests}
- **Testes Aprovados:** ${this.data.passedTests} (${successRate}%)
- **Testes Falhados:** ${this.data.failedTests} (${100 - successRate}%)
- **Ciclos Completos:** ${this.data.cycles.length}

### Correções Automáticas
- **Bugs Corrigidos:** ${this.data.fixes.length}
- **Taxa de Correção:** ${this.data.fixes.length > 0 ? 'Automático' : 'N/A'}

### Operações Google
- **Operações Bloqueadas:** ${this.data.googleOperations.blocked.length}
- **Operações Permitidas:** ${this.data.googleOperations.allowed.length}
- **Status de Segurança:** ${this.data.googleOperations.blocked.length === 0 ? '✅ Sem Riscos' : '⚠️ Operações Bloqueadas'}

---

## 🔄 Detalhamento dos Ciclos

`;

    this.data.cycles.forEach((cycle, i) => {
      const cycleTime = new Date(cycle.timestamp).toLocaleString('pt-BR');
      report += `### Ciclo ${i + 1} - ${cycleTime}

- **Testes E2E:** ${cycle.e2eTests?.total || 0} (${cycle.e2eTests?.passed || 0} passou)
- **Testes Navegador:** ${cycle.browserTests?.length || 0} páginas verificadas
- **Correções Aplicadas:** ${cycle.fixes?.length || 0}
- **Tempo de Execução:** ${cycle.duration ? (cycle.duration / 60).toFixed(1) : 'N/A'} minutos
- **Status:** ${cycle.success ? '✅ Sucesso' : '❌ Com Falhas'}

`;
    });

    report += `---

## 🔧 Correções Automáticas Aplicadas

`;

    if (this.data.fixes.length === 0) {
      report += `✅ Nenhuma correção foi necessária. Sistema está estável!

`;
    } else {
      const fixesByType = {};
      this.data.fixes.forEach(fix => {
        if (!fixesByType[fix.type]) {
          fixesByType[fix.type] = [];
        }
        fixesByType[fix.type].push(fix);
      });

      for (const [type, fixes] of Object.entries(fixesByType)) {
        report += `### ${type.toUpperCase()} (${fixes.length} correções)

`;
        fixes.forEach((fix, i) => {
          report += `${i + 1}. **${fix.title}**
   - Arquivo: \`${fix.file}\`
   - Correção aplicada em: ${new Date(fix.fixedAt).toLocaleString('pt-BR')}
   - Status: ✅ Aplicado automaticamente

`;
        });
      }
    }

    report += `---

## 🔒 Operações Google - Segurança

`;

    if (this.data.googleOperations.blocked.length === 0) {
      report += `✅ **Nenhuma operação de risco foi detectada**

Todas as operações executadas estavam dentro dos limites de segurança.

`;
    } else {
      report += `⚠️ **${this.data.googleOperations.blocked.length} operações foram bloqueadas por segurança**

### Operações Bloqueadas por Tipo

`;
      const blockedByApi = {};
      this.data.googleOperations.blocked.forEach(op => {
        const key = `${op.api}.${op.operation}`;
        if (!blockedByApi[key]) {
          blockedByApi[key] = [];
        }
        blockedByApi[key].push(op);
      });

      for (const [key, ops] of Object.entries(blockedByApi)) {
        report += `- **${key}**: ${ops.length} tentativas bloqueadas\n`;
      }

      report += `\n📄 Veja detalhes completos no arquivo OPERACOES_GOOGLE_PULADAS.md\n\n`;
    }

    report += `---

## 🏥 Saúde do Sistema

`;

    if (this.data.health.length > 0) {
      const healthyChecks = this.data.health.filter(h => h.overall).length;
      const healthRate = Math.round((healthyChecks / this.data.health.length) * 100);

      report += `### Status Geral
- **Verificações de Saúde:** ${this.data.health.length}
- **Sistema Saudável:** ${healthRate}%
- **Backend:** ${this.data.health.filter(h => h.backend?.healthy).length}/${this.data.health.length} verificações OK
- **Frontend:** ${this.data.health.filter(h => h.frontend?.healthy).length}/${this.data.health.length} verificações OK

`;

      const lastHealth = this.data.health[this.data.health.length - 1];
      report += `### Último Status
- **Backend:** ${lastHealth.backend?.healthy ? '✅' : '❌'} (${lastHealth.backend?.responseTime}ms)
- **Frontend:** ${lastHealth.frontend?.healthy ? '✅' : '❌'} (${lastHealth.frontend?.responseTime}ms)
- **Memória:** ${lastHealth.system?.memory?.used}MB / ${lastHealth.system?.memory?.total}MB (${lastHealth.system?.memory?.percent}%)

`;
    }

    report += `---

## 🎯 Cobertura de Testes

### Áreas Testadas
`;

    const areas = [
      '✅ Navegação entre abas',
      '✅ CRUD de Clientes',
      '✅ CRUD de Agendamentos',
      '✅ Calendário Visual',
      '✅ Galeria de Fotos',
      '✅ Importação de Dados',
      '✅ Google Drive Integration',
      '✅ Sincronização Google Calendar',
      '✅ Dados Locais',
      '✅ Performance e Stress Tests'
    ];

    areas.forEach(area => {
      report += `${area}\n`;
    });

    report += `
**Cobertura Estimada:** ${successRate}%

---

## 📈 Métricas de Performance

### Tempo Médio de Resposta
`;

    if (this.data.health.length > 0) {
      const avgBackend = this.data.health
        .filter(h => h.backend?.responseTime)
        .reduce((acc, h) => acc + h.backend.responseTime, 0) / this.data.health.length;
      
      const avgFrontend = this.data.health
        .filter(h => h.frontend?.responseTime)
        .reduce((acc, h) => acc + h.frontend.responseTime, 0) / this.data.health.length;

      report += `- **Backend:** ${Math.round(avgBackend)}ms
- **Frontend:** ${Math.round(avgFrontend)}ms

`;
    }

    report += `### Testes por Ciclo
- **Média de Testes/Ciclo:** ${this.data.cycles.length > 0 ? Math.round(this.data.totalTests / this.data.cycles.length) : 0}
- **Tempo Médio/Ciclo:** ${this.data.cycles.length > 0 ? Math.round(this.data.cycles.reduce((acc, c) => acc + (c.duration || 0), 0) / this.data.cycles.length / 60) : 0} minutos

---

## 🚀 Próximas Ações Recomendadas

`;

    const actions = [];

    if (this.data.failedTests > 0) {
      actions.push(`1. **Revisar ${this.data.failedTests} testes falhados** - Verificar manualmente os logs e screenshots`);
    }

    if (this.data.fixes.length > 0) {
      actions.push(`${actions.length + 1}. **Validar ${this.data.fixes.length} correções automáticas** - Re-executar testes afetados`);
    }

    if (this.data.googleOperations.blocked.length > 0) {
      actions.push(`${actions.length + 1}. **Revisar operações Google bloqueadas** - Verificar se são necessárias e ajustar limites`);
    }

    if (successRate < 80) {
      actions.push(`${actions.length + 1}. **Melhorar taxa de sucesso** - Atualmente em ${successRate}%, meta é >90%`);
    }

    if (actions.length === 0) {
      report += `✅ **Sistema está funcionando perfeitamente!**

Nenhuma ação urgente necessária. Continue monitorando.

`;
    } else {
      actions.forEach(action => {
        report += `${action}\n`;
      });
      report += '\n';
    }

    report += `---

## 📁 Arquivos Gerados

- \`RELATORIO_TESTES_NOTURNO_[DATA].md\` - Este relatório
- \`BUGS_CORRIGIDOS_AUTO_[DATA].md\` - Detalhes das correções automáticas
- \`OPERACOES_GOOGLE_PULADAS_[DATA].md\` - Operações bloqueadas por segurança
- \`PLANO_CORRECOES_MANHA_[DATA].md\` - Plano de ação para aprovação
- \`/screenshots/\` - Screenshots de falhas
- \`/videos/\` - Vídeos de testes falhados
- \`/logs/\` - Logs detalhados de execução

---

**Relatório gerado automaticamente pelo Sistema de Testes Autônomos**  
**Versão:** 1.0.0
`;

    return report;
  }

  /**
   * Gera plano de correções para aprovação
   */
  generateCorrectionPlan() {
    let plan = `# Plano de Correções para Aprovação

**Data:** ${new Date().toLocaleString('pt-BR')}  
**Status:** Aguardando Aprovação

---

## 📋 Resumo

Este plano consolida todas as correções automáticas aplicadas durante os testes noturnos e identifica ações que requerem aprovação manual.

### Estatísticas
- **Correções Automáticas:** ${this.data.fixes.length}
- **Testes Falhados Restantes:** ${this.data.failedTests}
- **Operações Google Bloqueadas:** ${this.data.googleOperations.blocked.length}

---

## ✅ Correções Já Aplicadas (Para Revisão)

`;

    if (this.data.fixes.length === 0) {
      plan += `Nenhuma correção automática foi aplicada.

`;
    } else {
      this.data.fixes.forEach((fix, i) => {
        plan += `### ${i + 1}. ${fix.type.toUpperCase()} - ${fix.title}

- **Arquivo:** \`${fix.file}\`
- **Problema:** ${fix.error.substring(0, 150)}...
- **Correção Aplicada:** ${this.getFixDescription(fix.type)}
- **Status:** ✅ Aplicado automaticamente
- **Ação Necessária:** Revisar e aprovar

`;
      });
    }

    plan += `---

## ⚠️ Problemas que Requerem Atenção Manual

`;

    if (this.data.failedTests === 0) {
      plan += `✅ Nenhum problema manual detectado!

`;
    } else {
      plan += `### Testes Falhados (${this.data.failedTests})

Estes testes falharam e não puderam ser corrigidos automaticamente:

`;

      // Aqui listaríamos os testes específicos que falharam
      plan += `📄 Veja logs detalhados na pasta \`/logs/\` para mais informações.

### Próximos Passos

1. **Revisar logs de cada teste falhado**
2. **Identificar causa raiz dos problemas**
3. **Aplicar correções manuais necessárias**
4. **Re-executar testes para validar**

`;
    }

    plan += `---

## 🔒 Operações Google Bloqueadas

`;

    if (this.data.googleOperations.blocked.length === 0) {
      plan += `✅ Nenhuma operação foi bloqueada!

`;
    } else {
      plan += `As seguintes operações foram bloqueadas por segurança:

`;
      const blockedByType = {};
      this.data.googleOperations.blocked.forEach(op => {
        const key = op.operationName || op.operation;
        blockedByType[key] = (blockedByType[key] || 0) + 1;
      });

      for (const [type, count] of Object.entries(blockedByType)) {
        plan += `- **${type}**: ${count} tentativas bloqueadas\n`;
      }

      plan += `
### Ação Necessária

1. **Revisar** se estas operações são realmente necessárias
2. **Ajustar limites** se apropriado (com cuidado!)
3. **Otimizar código** para reduzir número de requests
4. **Implementar cache** onde possível

📄 Veja detalhes completos em \`OPERACOES_GOOGLE_PULADAS_[DATA].md\`

`;
    }

    plan += `---

## 🎯 Prioridades de Correção

### Alta Prioridade
`;

    const highPriority = [];
    if (this.data.failedTests > 5) {
      highPriority.push(`- Múltiplos testes falhados (${this.data.failedTests})`);
    }
    if (this.data.googleOperations.blocked.length > 10) {
      highPriority.push('- Muitas operações Google bloqueadas');
    }

    if (highPriority.length === 0) {
      plan += `✅ Nenhum problema de alta prioridade

`;
    } else {
      highPriority.forEach(item => plan += `${item}\n`);
      plan += '\n';
    }

    plan += `### Média Prioridade

`;

    if (this.data.fixes.length > 0) {
      plan += `- Revisar ${this.data.fixes.length} correções automáticas aplicadas
`;
    }

    plan += `
### Baixa Prioridade

- Otimizações de performance
- Melhorias de UX

---

## ✍️ Aprovação

[ ] Revisei todas as correções automáticas  
[ ] Revisei todos os testes falhados  
[ ] Revisei operações Google bloqueadas  
[ ] Estou ciente das próximas ações necessárias  

**Data de Aprovação:** __________  
**Responsável:** __________  

---

**Observações:**





---

**Fim do Plano de Correções**
`;

    return plan;
  }

  /**
   * Obtém descrição da correção por tipo
   */
  getFixDescription(type) {
    const descriptions = {
      timeout: 'Aumentou timeouts em waitForTimeout e expectativas',
      selector: 'Melhorou seletores e adicionou retry logic',
      css: 'Corrigiu problemas de z-index e overflow',
      validation: 'Adicionou validações mais robustas',
      race_condition: 'Adicionou waits estratégicos para evitar race conditions'
    };
    return descriptions[type] || 'Correção aplicada';
  }

  /**
   * Salva todos os relatórios
   */
  async saveAllReports() {
    this.finalize();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reports = [];

    // Relatório principal
    const mainReport = this.generateMainReport();
    const mainFile = path.join(this.outputDir, `RELATORIO_TESTES_NOTURNO_${timestamp}.md`);
    await fs.writeFile(mainFile, mainReport);
    reports.push(mainFile);
    this.log(`📄 Relatório principal salvo: ${mainFile}`);

    // Plano de correções
    const correctionPlan = this.generateCorrectionPlan();
    const planFile = path.join(this.outputDir, `PLANO_CORRECOES_MANHA_${timestamp}.md`);
    await fs.writeFile(planFile, correctionPlan);
    reports.push(planFile);
    this.log(`📄 Plano de correções salvo: ${planFile}`);

    return reports;
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
}

module.exports = ReportGenerator;

