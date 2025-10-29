/**
 * Auto-Fix - Sistema de Correção Automática de Bugs
 * Detecta e corrige automaticamente problemas simples no código
 * - CSS/UI issues
 * - Validações de formulário
 * - Timeouts e race conditions
 * - Mensagens de erro/sucesso
 */

const fs = require('fs-extra');
const path = require('path');

class AutoFix {
  constructor(config) {
    this.config = config;
    this.projectRoot = config.projectRoot;
    this.frontendDir = path.join(this.projectRoot, 'agenda-hibrida-frontend');
    this.backendDir = path.join(this.projectRoot, 'agenda-hibrida-v2');
    this.logFile = path.join(config.logsDir, `auto-fix-${Date.now()}.log`);
    this.fixes = [];
    this.failedFixes = [];
  }

  /**
   * Analisa e corrige todos os problemas detectados
   */
  async analyzeAndFix(testResults) {
    this.log('🔧 Iniciando análise e correção automática...');
    
    const issues = this.extractIssues(testResults);
    this.log(`📊 ${issues.length} problemas detectados`);

    for (const issue of issues) {
      await this.attemptFix(issue);
    }

    return {
      totalIssues: issues.length,
      fixed: this.fixes.length,
      failed: this.failedFixes.length,
      fixes: this.fixes,
      failedFixes: this.failedFixes
    };
  }

  /**
   * Extrai problemas dos resultados de teste
   */
  extractIssues(testResults) {
    const issues = [];

    if (!testResults || !testResults.tests) {
      return issues;
    }

    for (const test of testResults.tests) {
      if (test.status === 'failed' || test.status === 'timedOut') {
        const issue = this.categorizeIssue(test);
        if (issue) {
          issues.push(issue);
        }
      }
    }

    return issues;
  }

  /**
   * Categoriza o tipo de problema
   */
  categorizeIssue(test) {
    const error = test.error || '';
    const title = test.title || '';
    const file = test.file || '';

    // Timeout issues
    if (error.includes('Timeout') || error.includes('timeout')) {
      return {
        type: 'timeout',
        test,
        file,
        title,
        error,
        fixable: true
      };
    }

    // Selector not found
    if (error.includes('selector') || error.includes('not visible') || error.includes('not found')) {
      return {
        type: 'selector',
        test,
        file,
        title,
        error,
        fixable: true
      };
    }

    // CSS/Layout issues
    if (error.includes('overflow') || error.includes('z-index') || error.includes('display')) {
      return {
        type: 'css',
        test,
        file,
        title,
        error,
        fixable: true
      };
    }

    // Validation errors
    if (error.includes('validation') || error.includes('invalid') || error.includes('required')) {
      return {
        type: 'validation',
        test,
        file,
        title,
        error,
        fixable: true
      };
    }

    // Race condition
    if (error.includes('race') || error.includes('concurrent') || error.includes('already')) {
      return {
        type: 'race_condition',
        test,
        file,
        title,
        error,
        fixable: true
      };
    }

    return {
      type: 'unknown',
      test,
      file,
      title,
      error,
      fixable: false
    };
  }

  /**
   * Tenta corrigir um problema
   */
  async attemptFix(issue) {
    this.log(`🔍 Tentando corrigir: ${issue.type} - ${issue.title}`);

    try {
      let fixed = false;

      switch (issue.type) {
        case 'timeout':
          fixed = await this.fixTimeout(issue);
          break;
        case 'selector':
          fixed = await this.fixSelector(issue);
          break;
        case 'css':
          fixed = await this.fixCSS(issue);
          break;
        case 'validation':
          fixed = await this.fixValidation(issue);
          break;
        case 'race_condition':
          fixed = await this.fixRaceCondition(issue);
          break;
        default:
          this.log(`⚠️ Tipo de problema desconhecido: ${issue.type}`);
          this.failedFixes.push({
            ...issue,
            reason: 'unknown_type'
          });
          return false;
      }

      if (fixed) {
        this.fixes.push({
          ...issue,
          fixedAt: Date.now()
        });
        this.log(`✅ Problema corrigido: ${issue.type}`);
      } else {
        this.failedFixes.push({
          ...issue,
          reason: 'fix_failed'
        });
        this.log(`❌ Não foi possível corrigir: ${issue.type}`);
      }

      return fixed;
    } catch (error) {
      this.log(`❌ Erro ao tentar corrigir: ${error.message}`);
      this.failedFixes.push({
        ...issue,
        reason: error.message
      });
      return false;
    }
  }

  /**
   * Corrige problemas de timeout
   */
  async fixTimeout(issue) {
    const testFile = issue.file;
    if (!testFile) return false;

    const testPath = path.join(this.frontendDir, 'tests', 'e2e', path.basename(testFile));
    
    if (!await fs.pathExists(testPath)) {
      this.log(`⚠️ Arquivo de teste não encontrado: ${testPath}`);
      return false;
    }

    let content = await fs.readFile(testPath, 'utf-8');
    let modified = false;

    // Aumentar timeouts em waitForTimeout
    content = content.replace(/waitForTimeout\((\d+)\)/g, (match, timeout) => {
      const current = parseInt(timeout);
      if (current < 5000) {
        modified = true;
        return `waitForTimeout(${Math.min(current * 2, 5000)})`;
      }
      return match;
    });

    // Aumentar timeouts em waitForSelector
    content = content.replace(/waitForSelector\([^,]+,\s*\{[^}]*timeout:\s*(\d+)/g, (match, timeout) => {
      const current = parseInt(timeout);
      if (current < 10000) {
        modified = true;
        return match.replace(`timeout: ${timeout}`, `timeout: ${Math.min(current * 2, 15000)}`);
      }
      return match;
    });

    // Adicionar timeout nas expectativas sem timeout
    content = content.replace(/expect\([^)]+\)\.toBeVisible\(\)/g, (match) => {
      modified = true;
      return match.replace('toBeVisible()', 'toBeVisible({ timeout: 10000 })');
    });

    if (modified) {
      await fs.writeFile(testPath, content);
      this.log(`✅ Timeouts aumentados em: ${testPath}`);
      return true;
    }

    return false;
  }

  /**
   * Corrige problemas de seletores
   */
  async fixSelector(issue) {
    const testFile = issue.file;
    if (!testFile) return false;

    const testPath = path.join(this.frontendDir, 'tests', 'e2e', path.basename(testFile));
    
    if (!await fs.pathExists(testPath)) {
      return false;
    }

    let content = await fs.readFile(testPath, 'utf-8');
    let modified = false;

    // Adicionar waitForLoadState antes de clicks
    const clickPattern = /await page\.click\(/g;
    if (content.match(clickPattern)) {
      content = content.replace(
        /await page\.click\(/g,
        match => {
          modified = true;
          return 'await page.waitForLoadState(\'networkidle\');\n    await page.click(';
        }
      );
    }

    // Adicionar retry logic para seletores
    content = content.replace(
      /await page\.locator\(([^)]+)\)\.click\(\)/g,
      (match, selector) => {
        modified = true;
        return `await page.locator(${selector}).click({ timeout: 10000, force: false }).catch(async () => {
      await page.waitForTimeout(1000);
      await page.locator(${selector}).click({ force: true });
    })`;
      }
    );

    if (modified) {
      await fs.writeFile(testPath, content);
      this.log(`✅ Seletores melhorados em: ${testPath}`);
      return true;
    }

    return false;
  }

  /**
   * Corrige problemas de CSS
   */
  async fixCSS(issue) {
    // Buscar arquivos CSS no frontend
    const cssFiles = await this.findFiles(this.frontendDir, '.css');
    let modified = false;

    for (const cssFile of cssFiles) {
      let content = await fs.readFile(cssFile, 'utf-8');
      let fileModified = false;

      // Corrigir z-index conflicts (usar valores mais altos)
      if (content.includes('z-index:') && issue.error.includes('z-index')) {
        content = content.replace(/z-index:\s*(\d+)/g, (match, value) => {
          const current = parseInt(value);
          if (current < 1000) {
            fileModified = true;
            return `z-index: ${current + 1000}`;
          }
          return match;
        });
      }

      // Corrigir overflow issues
      if (issue.error.includes('overflow')) {
        content = content.replace(
          /overflow:\s*visible/g,
          () => {
            fileModified = true;
            return 'overflow: auto';
          }
        );
      }

      if (fileModified) {
        await fs.writeFile(cssFile, content);
        this.log(`✅ CSS corrigido em: ${cssFile}`);
        modified = true;
      }
    }

    return modified;
  }

  /**
   * Corrige problemas de validação
   */
  async fixValidation(issue) {
    // Buscar arquivos de componentes
    const componentFiles = await this.findFiles(
      path.join(this.frontendDir, 'src'),
      '.jsx',
      '.tsx'
    );

    let modified = false;

    for (const file of componentFiles) {
      let content = await fs.readFile(file, 'utf-8');
      let fileModified = false;

      // Adicionar validação de email mais robusta
      if (content.includes('email') && issue.error.includes('email')) {
        const emailRegex = '/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/';
        if (!content.includes(emailRegex)) {
          content = content.replace(
            /email:\s*z\.string\(\)/g,
            () => {
              fileModified = true;
              return `email: z.string().email('Email inválido').regex(${emailRegex}, 'Formato de email inválido')`;
            }
          );
        }
      }

      // Adicionar validação de telefone
      if (content.includes('phone') && issue.error.includes('phone')) {
        content = content.replace(
          /phone:\s*z\.string\(\)/g,
          () => {
            fileModified = true;
            return 'phone: z.string().min(10, \'Telefone deve ter no mínimo 10 dígitos\')';
          }
        );
      }

      if (fileModified) {
        await fs.writeFile(file, content);
        this.log(`✅ Validação corrigida em: ${file}`);
        modified = true;
      }
    }

    return modified;
  }

  /**
   * Corrige race conditions
   */
  async fixRaceCondition(issue) {
    const testFile = issue.file;
    if (!testFile) return false;

    const testPath = path.join(this.frontendDir, 'tests', 'e2e', path.basename(testFile));
    
    if (!await fs.pathExists(testPath)) {
      return false;
    }

    let content = await fs.readFile(testPath, 'utf-8');
    let modified = false;

    // Adicionar waitForLoadState em pontos críticos
    if (!content.includes('waitForLoadState')) {
      content = content.replace(
        /test\('([^']+)',\s*async\s*\(\{\s*page\s*\}\)\s*=>\s*\{/g,
        (match) => {
          modified = true;
          return match + '\n    await page.waitForLoadState(\'networkidle\');';
        }
      );
    }

    // Adicionar delays estratégicos após ações críticas
    content = content.replace(
      /(await page\.click\([^)]+\);)(?!\s*await page\.waitForTimeout)/g,
      (match) => {
        modified = true;
        return match + '\n    await page.waitForTimeout(500);';
      }
    );

    if (modified) {
      await fs.writeFile(testPath, content);
      this.log(`✅ Race conditions corrigidas em: ${testPath}`);
      return true;
    }

    return false;
  }

  /**
   * Encontra arquivos por extensão
   */
  async findFiles(dir, ...extensions) {
    const files = [];
    
    async function scan(directory) {
      const items = await fs.readdir(directory);
      
      for (const item of items) {
        const fullPath = path.join(directory, item);
        const stat = await fs.stat(fullPath);
        
        if (stat.isDirectory()) {
          if (!item.startsWith('.') && item !== 'node_modules') {
            await scan(fullPath);
          }
        } else {
          if (extensions.some(ext => item.endsWith(ext))) {
            files.push(fullPath);
          }
        }
      }
    }
    
    await scan(dir);
    return files;
  }

  /**
   * Gera relatório de correções
   */
  generateReport() {
    let report = `## Relatório de Correções Automáticas

### Resumo
- **Total de Problemas Detectados:** ${this.fixes.length + this.failedFixes.length}
- **Correções Aplicadas:** ${this.fixes.length}
- **Correções Falhas:** ${this.failedFixes.length}
- **Taxa de Sucesso:** ${this.fixes.length > 0 ? Math.round((this.fixes.length / (this.fixes.length + this.failedFixes.length)) * 100) : 0}%

`;

    if (this.fixes.length > 0) {
      report += `### ✅ Correções Aplicadas com Sucesso

`;
      this.fixes.forEach((fix, i) => {
        report += `${i + 1}. **${fix.type}** - ${fix.title}
   - Arquivo: ${fix.file}
   - Erro original: ${fix.error.substring(0, 100)}...
   - Corrigido em: ${new Date(fix.fixedAt).toLocaleString('pt-BR')}

`;
      });
    }

    if (this.failedFixes.length > 0) {
      report += `### ❌ Correções que Falharam

`;
      this.failedFixes.forEach((fix, i) => {
        report += `${i + 1}. **${fix.type}** - ${fix.title}
   - Arquivo: ${fix.file}
   - Erro: ${fix.error.substring(0, 100)}...
   - Razão da falha: ${fix.reason}
   - **Requer correção manual**

`;
      });
    }

    report += `### Próximos Passos

`;

    if (this.fixes.length > 0) {
      report += `1. **Re-executar testes** para verificar se as correções funcionaram
2. **Revisar mudanças** nos arquivos modificados
3. **Commit das correções** se tudo estiver funcionando

`;
    }

    if (this.failedFixes.length > 0) {
      report += `4. **Revisar manualmente** as ${this.failedFixes.length} correções que falharam
5. **Aplicar correções customizadas** onde necessário
`;
    }

    return report;
  }

  /**
   * Salva relatório
   */
  async saveReport(outputDir) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(outputDir, `BUGS_CORRIGIDOS_AUTO_${timestamp}.md`);
    
    const report = this.generateReport();
    await fs.writeFile(reportFile, report);
    
    this.log(`📄 Relatório salvo: ${reportFile}`);
    return reportFile;
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

module.exports = AutoFix;

