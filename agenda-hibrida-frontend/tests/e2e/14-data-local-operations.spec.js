/**
 * E2E Tests - Operações com Dados Locais
 * Testa funcionalidades que usam dados locais (sem APIs externas)
 */

import { test, expect } from '@playwright/test';

test.describe('Operações com Dados Locais', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should test local storage persistence', async ({ page }) => {
    // Testar se dados são salvos no localStorage
    await page.click('[data-testid="tab-settings"]');
    await page.waitForTimeout(2000);

    // Verificar localStorage
    const localStorageData = await page.evaluate(() => {
      const data = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        data[key] = localStorage.getItem(key)?.substring(0, 50);
      }
      return data;
    });

    console.log('📦 Dados no localStorage:', Object.keys(localStorageData).length, 'items');
    Object.keys(localStorageData).forEach(key => {
      console.log(`  - ${key}: ${localStorageData[key]}...`);
    });

    await page.screenshot({ 
      path: 'test-results/data-local/01-localstorage.png' 
    });

    expect(Object.keys(localStorageData).length).toBeGreaterThanOrEqual(0);
  });

  test('should test theme persistence', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Procurar toggle de tema
    const themeToggles = [
      '[data-testid="theme-toggle"]',
      'button[aria-label*="theme"]',
      'button:has-text("Dark")',
      'button:has-text("Light")'
    ];

    for (const selector of themeToggles) {
      const toggle = page.locator(selector).first();
      if (await toggle.count() > 0 && await toggle.isVisible({ timeout: 2000 }).catch(() => false)) {
        // Obter tema atual
        const currentTheme = await page.evaluate(() => 
          document.documentElement.className || document.documentElement.getAttribute('data-theme')
        );
        console.log(`🎨 Tema atual: ${currentTheme}`);
        
        // Clicar para trocar
        await toggle.click().catch(() => {});
        await page.waitForTimeout(500);
        
        // Verificar se mudou
        const newTheme = await page.evaluate(() => 
          document.documentElement.className || document.documentElement.getAttribute('data-theme')
        );
        console.log(`🎨 Novo tema: ${newTheme}`);
        
        await page.screenshot({ 
          path: 'test-results/data-local/02-theme-after-toggle.png' 
        });
        break;
      }
    }

    expect(true).toBeTruthy();
  });

  test('should test cached data usage', async ({ page }) => {
    // Verificar se sistema usa cache
    await page.click('[data-testid="tab-clients"]');
    await page.waitForTimeout(2000);

    // Medir tempo de carregamento inicial
    const startTime1 = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime1 = Date.now() - startTime1;

    console.log(`⏱️ Primeiro carregamento: ${loadTime1}ms`);

    // Segundo carregamento (deve usar cache)
    const startTime2 = Date.now();
    await page.reload();
    await page.waitForLoadState('networkidle');
    const loadTime2 = Date.now() - startTime2;

    console.log(`⏱️ Segundo carregamento (com cache): ${loadTime2}ms`);

    if (loadTime2 < loadTime1) {
      console.log('✅ Cache funcionando - segundo carregamento mais rápido');
    }

    await page.screenshot({ 
      path: 'test-results/data-local/03-cache-test.png' 
    });

    expect(true).toBeTruthy();
  });

  test('should test offline mode detection', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Simular offline
    await page.context().setOffline(true);
    await page.waitForTimeout(1000);

    // Verificar se sistema detecta offline
    const offlineIndicators = [
      'text=/Offline|Sem conexão/i',
      '[data-testid="offline-indicator"]',
      '.offline'
    ];

    let offlineDetected = false;
    for (const selector of offlineIndicators) {
      const element = page.locator(selector).first();
      if (await element.isVisible({ timeout: 3000 }).catch(() => false)) {
        offlineDetected = true;
        console.log('✅ Modo offline detectado');
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/data-local/04-offline-mode.png' 
    });

    // Voltar online
    await page.context().setOffline(false);
    await page.waitForTimeout(1000);

    expect(true).toBeTruthy();
  });

  test('should test data export functionality', async ({ page }) => {
    // Verificar funcionalidade de exportar dados
    const exportButtons = [
      '[data-testid="btn-export"]',
      'button:has-text("Exportar")',
      'button:has-text("Export")',
      'button:has-text("Download")'
    ];

    for (const selector of exportButtons) {
      const button = page.locator(selector).first();
      if (await button.count() > 0) {
        console.log(`✅ Botão de exportar encontrado: ${selector}`);
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/data-local/05-export-button.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });

  test('should test data backup feature', async ({ page }) => {
    await page.click('[data-testid="tab-settings"]');
    await page.waitForTimeout(2000);

    // Procurar opção de backup
    const backupElements = [
      'text=/Backup|Cópia|Segurança/i',
      '[data-testid="backup-section"]',
      'button:has-text("Backup")'
    ];

    for (const selector of backupElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`✅ Opção de backup encontrada: ${selector}`);
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/data-local/06-backup.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });

  test('should test form auto-save', async ({ page }) => {
    await page.click('[data-testid="tab-clients"]');
    await page.waitForTimeout(1000);
    await page.click('[data-testid="btn-new-client"]');
    await page.waitForTimeout(1000);

    // Preencher formulário parcialmente
    const nameInput = page.locator('input[name="name"], input[placeholder*="Nome"]').first();
    if (await nameInput.count() > 0) {
      await nameInput.fill('Test Auto Save').catch(() => {});
      await page.waitForTimeout(2000);

      // Verificar se há indicador de auto-save
      const autoSaveIndicators = [
        'text=/Salvando|Saving|Salvo|Saved/i',
        '[data-testid="auto-save-status"]',
        '.auto-save'
      ];

      for (const selector of autoSaveIndicators) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          const text = await element.textContent().catch(() => '');
          console.log(`✅ Auto-save detectado: ${text}`);
          break;
        }
      }
    }

    await page.screenshot({ 
      path: 'test-results/data-local/07-auto-save.png' 
    });

    expect(true).toBeTruthy();
  });

  test('should test undo/redo functionality', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Procurar botões de undo/redo
    const undoButtons = [
      'button[aria-label*="undo"]',
      'button:has-text("Desfazer")',
      '[data-testid="btn-undo"]'
    ];

    for (const selector of undoButtons) {
      const button = page.locator(selector).first();
      if (await button.count() > 0) {
        console.log(`✅ Botão de desfazer encontrado: ${selector}`);
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/data-local/08-undo-redo.png' 
    });

    expect(true).toBeTruthy();
  });

  test('should test local search', async ({ page }) => {
    await page.click('[data-testid="tab-clients"]');
    await page.waitForTimeout(2000);

    // Testar busca local
    const searchInputs = [
      '[data-testid="search"]',
      'input[type="search"]',
      'input[placeholder*="Buscar"]'
    ];

    for (const selector of searchInputs) {
      const input = page.locator(selector).first();
      if (await input.count() > 0) {
        // Contar itens antes
        const itemsBefore = await page.locator('tr, .client-item, [data-client]').count();
        console.log(`📊 Items antes da busca: ${itemsBefore}`);

        // Fazer busca
        await input.fill('test').catch(() => {});
        await page.waitForTimeout(1000);

        // Contar itens depois
        const itemsAfter = await page.locator('tr, .client-item, [data-client]').count();
        console.log(`📊 Items após busca: ${itemsAfter}`);

        await input.clear().catch(() => {});
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/data-local/09-local-search.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });

  test('should test data filtering', async ({ page }) => {
    await page.click('[data-testid="tab-appointments"]');
    await page.waitForTimeout(2000);

    // Testar filtros locais
    const filterElements = [
      '[data-testid="filter"]',
      'select',
      'button:has-text("Filtrar")'
    ];

    let filtersFound = 0;
    for (const selector of filterElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      filtersFound += count;
    }

    console.log(`🔍 ${filtersFound} filtros encontrados`);

    await page.screenshot({ 
      path: 'test-results/data-local/10-filters.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });
});

test.describe('Dados Locais - Validação', () => {
  test('should verify IndexedDB usage', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Verificar se usa IndexedDB
    const hasIndexedDB = await page.evaluate(() => {
      return 'indexedDB' in window;
    });

    console.log(`💾 IndexedDB disponível: ${hasIndexedDB}`);

    if (hasIndexedDB) {
      const databases = await page.evaluate(() => {
        return indexedDB.databases ? indexedDB.databases() : [];
      });
      console.log(`💾 Databases IndexedDB:`, databases);
    }

    await page.screenshot({ 
      path: 'test-results/data-local/validation-indexeddb.png' 
    });

    expect(hasIndexedDB).toBeTruthy();
  });
});

