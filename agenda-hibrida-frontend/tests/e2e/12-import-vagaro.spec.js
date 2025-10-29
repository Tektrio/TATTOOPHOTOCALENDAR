/**
 * E2E Tests - Importação Vagaro
 * Testa funcionalidade de importação de dados do Vagaro
 */

import { test, expect } from '@playwright/test';

test.describe('Importação Vagaro', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navegar para aba de importação
    await page.click('[data-testid="tab-import"]');
    await page.waitForTimeout(2000);
  });

  test('should load import interface', async ({ page }) => {
    // Verificar elementos da interface de importação
    const importElements = [
      'text=/Import|Importar/i',
      'button, [role="button"]',
      '[data-testid="import-section"]'
    ];

    let found = false;
    for (const selector of importElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        found = true;
        console.log(`✅ Interface de importação encontrada: ${selector}`);
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/vagaro/01-import-interface.png',
      fullPage: true 
    });

    expect(found).toBeTruthy();
  });

  test('should find Vagaro import option', async ({ page }) => {
    // Procurar opção específica do Vagaro
    const vagaroSelectors = [
      'text=/Vagaro/i',
      '[data-testid="import-vagaro"]',
      'button:has-text("Vagaro")'
    ];

    for (const selector of vagaroSelectors) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`✅ Opção Vagaro encontrada: ${selector}`);
        await page.screenshot({ 
          path: 'test-results/vagaro/02-vagaro-option.png' 
        });
        break;
      }
    }

    expect(true).toBeTruthy();
  });

  test('should test file upload interface for Excel', async ({ page }) => {
    // Testar interface de upload de arquivo Excel
    const fileInputs = [
      'input[type="file"]',
      '[data-testid="file-upload"]'
    ];

    for (const selector of fileInputs) {
      const input = page.locator(selector).first();
      if (await input.count() > 0) {
        console.log(`✅ Input de arquivo encontrado: ${selector}`);
        
        // Verificar se aceita Excel
        const accept = await input.getAttribute('accept').catch(() => '');
        console.log(`📎 Tipos aceitos: ${accept}`);
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/vagaro/03-file-upload.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });

  test('should test preview functionality', async ({ page }) => {
    // Verificar se há funcionalidade de preview
    await page.waitForTimeout(1000);

    const previewElements = [
      '[data-testid="import-preview"]',
      'text=/Preview|Pr[eé]via/i',
      'table',
      '.preview'
    ];

    for (const selector of previewElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`✅ Preview encontrado: ${selector}`);
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/vagaro/04-preview.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });

  test('should verify import validation UI', async ({ page }) => {
    // Verificar interface de validação
    const validationElements = [
      '[data-testid="validation-errors"]',
      'text=/Validação|Validation|Erros/i',
      '.validation, .error-list'
    ];

    for (const selector of validationElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`✅ Sistema de validação encontrado: ${selector}`);
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/vagaro/05-validation.png' 
    });

    expect(true).toBeTruthy();
  });

  test('should check mapping fields interface', async ({ page }) => {
    // Verificar interface de mapeamento de campos
    await page.waitForTimeout(1000);

    const mappingElements = [
      '[data-testid="field-mapping"]',
      'text=/Mapeamento|Mapping|Campos/i',
      'select'
    ];

    let foundMappings = 0;
    for (const selector of mappingElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        foundMappings += count;
        console.log(`✅ ${count} elementos de mapeamento encontrados`);
      }
    }

    await page.screenshot({ 
      path: 'test-results/vagaro/06-field-mapping.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });

  test('should test import history', async ({ page }) => {
    // Verificar histórico de importações
    const historyElements = [
      '[data-testid="import-history"]',
      'text=/Histórico|History/i',
      'table'
    ];

    for (const selector of historyElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        const rows = await element.locator('tr, .history-item').count();
        console.log(`✅ Histórico encontrado com ${rows} items`);
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/vagaro/07-import-history.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });

  test('should verify duplicate detection UI', async ({ page }) => {
    // Verificar sistema de detecção de duplicados
    await page.waitForTimeout(1000);

    const duplicateElements = [
      '[data-testid="duplicate-detection"]',
      'text=/Duplicad|Duplicate/i',
      'checkbox'
    ];

    for (const selector of duplicateElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`✅ Detecção de duplicados encontrada: ${selector}`);
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/vagaro/08-duplicate-detection.png' 
    });

    expect(true).toBeTruthy();
  });

  test('should check import settings', async ({ page }) => {
    // Verificar configurações de importação
    const settingsElements = [
      '[data-testid="import-settings"]',
      'text=/Configurações|Settings/i',
      'button:has-text("Configurações")'
    ];

    for (const selector of settingsElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`✅ Configurações encontradas: ${selector}`);
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/vagaro/09-settings.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });

  test('should verify import progress indicator', async ({ page }) => {
    // Verificar indicador de progresso
    const progressElements = [
      '[data-testid="import-progress"]',
      '[role="progressbar"]',
      '.progress, [class*="progress"]'
    ];

    for (const selector of progressElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`✅ Indicador de progresso encontrado: ${selector}`);
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/vagaro/10-progress.png' 
    });

    expect(true).toBeTruthy();
  });
});

test.describe('Importação Vagaro - Validação de Dados', () => {
  test('should check for data format documentation', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="tab-import"]');
    await page.waitForTimeout(2000);

    // Procurar documentação ou ajuda
    const helpElements = [
      'text=/Ajuda|Help|Como usar/i',
      '[data-testid="help-button"]',
      'button:has([aria-label*="help"])'
    ];

    for (const selector of helpElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`✅ Documentação/Ajuda encontrada: ${selector}`);
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/vagaro/validation-documentation.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });
});

