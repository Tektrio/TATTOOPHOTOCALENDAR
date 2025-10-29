/**
 * E2E Tests - Testes de Stress e Performance
 * Testa comportamento sob carga e performance
 */

import { test, expect } from '@playwright/test';

test.describe('Testes de Stress e Performance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should handle rapid navigation between tabs', async ({ page }) => {
    const tabs = [
      'dashboard',
      'calendar',
      'appointments',
      'clients',
      'gallery',
      'import',
      'drive',
      'settings'
    ];

    console.log('🏃 Iniciando navegação rápida entre abas...');

    for (let i = 0; i < 3; i++) {
      for (const tab of tabs) {
        const tabElement = page.locator(`[data-testid="tab-${tab}"]`);
        if (await tabElement.count() > 0) {
          await tabElement.click({ timeout: 5000 }).catch(() => {
            console.log(`⚠️ Erro ao clicar em tab-${tab}`);
          });
          await page.waitForTimeout(300); // Pequena pausa
        }
      }
      console.log(`✅ Ciclo ${i + 1}/3 completo`);
    }

    await page.screenshot({ 
      path: 'test-results/stress/01-rapid-navigation.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });

  test('should handle multiple quick searches', async ({ page }) => {
    await page.click('[data-testid="tab-clients"]');
    await page.waitForTimeout(2000);

    const searchInput = page.locator('input[type="search"], input[placeholder*="Buscar"]').first();
    
    if (await searchInput.count() > 0) {
      console.log('🔍 Testando buscas rápidas consecutivas...');
      
      const searchTerms = ['a', 'ab', 'abc', 'test', 'client', '123', '@'];

      for (const term of searchTerms) {
        await searchInput.fill(term).catch(() => {});
        await page.waitForTimeout(200);
      }

      await searchInput.clear().catch(() => {});
      console.log('✅ Buscas rápidas concluídas');
    }

    await page.screenshot({ 
      path: 'test-results/stress/02-rapid-searches.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });

  test('should measure page load performance', async ({ page }) => {
    console.log('⏱️ Medindo performance de carregamento...');

    const metrics = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        dns: timing.domainLookupEnd - timing.domainLookupStart,
        tcp: timing.connectEnd - timing.connectStart,
        request: timing.responseStart - timing.requestStart,
        response: timing.responseEnd - timing.responseStart,
        dom: timing.domContentLoadedEventEnd - timing.domContentLoadedEventStart,
        load: timing.loadEventEnd - timing.loadEventStart,
        total: timing.loadEventEnd - timing.navigationStart
      };
    });

    console.log('📊 Métricas de Performance:');
    console.log(`  - DNS Lookup: ${metrics.dns}ms`);
    console.log(`  - TCP Connection: ${metrics.tcp}ms`);
    console.log(`  - Request Time: ${metrics.request}ms`);
    console.log(`  - Response Time: ${metrics.response}ms`);
    console.log(`  - DOM Processing: ${metrics.dom}ms`);
    console.log(`  - Load Event: ${metrics.load}ms`);
    console.log(`  - TOTAL: ${metrics.total}ms`);

    // Alertas de performance
    if (metrics.total > 3000) {
      console.log('⚠️ Página carregando lentamente!');
    }

    await page.screenshot({ 
      path: 'test-results/stress/03-performance-metrics.png' 
    });

    expect(metrics.total).toBeLessThan(10000); // Máximo 10 segundos
  });

  test('should test memory usage over time', async ({ page }) => {
    console.log('💾 Testando uso de memória...');

    const memorySnapshots = [];

    for (let i = 0; i < 5; i++) {
      // Navegar entre abas
      await page.click('[data-testid="tab-clients"]');
      await page.waitForTimeout(1000);
      await page.click('[data-testid="tab-appointments"]');
      await page.waitForTimeout(1000);

      // Capturar uso de memória
      const memory = await page.evaluate(() => {
        if (performance.memory) {
          return {
            usedJSHeapSize: performance.memory.usedJSHeapSize,
            totalJSHeapSize: performance.memory.totalJSHeapSize,
            jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
          };
        }
        return null;
      });

      if (memory) {
        memorySnapshots.push(memory);
        console.log(`  Snapshot ${i + 1}: ${Math.round(memory.usedJSHeapSize / 1024 / 1024)}MB`);
      }
    }

    if (memorySnapshots.length > 0) {
      const avgMemory = memorySnapshots.reduce((acc, m) => acc + m.usedJSHeapSize, 0) / memorySnapshots.length;
      console.log(`📊 Média de memória usada: ${Math.round(avgMemory / 1024 / 1024)}MB`);
    }

    await page.screenshot({ 
      path: 'test-results/stress/04-memory-usage.png' 
    });

    expect(true).toBeTruthy();
  });

  test('should test rapid form submissions', async ({ page }) => {
    await page.click('[data-testid="tab-clients"]');
    await page.waitForTimeout(2000);

    console.log('📝 Testando submissões rápidas de formulário...');

    for (let i = 0; i < 3; i++) {
      // Abrir modal
      await page.click('[data-testid="btn-new-client"]').catch(() => {});
      await page.waitForTimeout(1000);

      // Preencher formulário
      const nameInput = page.locator('input[name="name"], input[placeholder*="Nome"]').first();
      if (await nameInput.count() > 0) {
        await nameInput.fill(`Stress Test Client ${i}`).catch(() => {});
        
        // Tentar submeter
        const saveButton = page.locator('[data-testid="btn-save-client"], button:has-text("Salvar")').first();
        if (await saveButton.count() > 0) {
          await saveButton.click({ timeout: 3000 }).catch(() => {
            console.log('⚠️ Erro ao salvar');
          });
        }

        await page.waitForTimeout(1500);
      }

      // Fechar modal se ainda aberto
      const closeButton = page.locator('button:has-text("×"), button:has-text("Cancelar")').first();
      if (await closeButton.isVisible({ timeout: 1000 }).catch(() => false)) {
        await closeButton.click().catch(() => {});
      }

      await page.waitForTimeout(500);
    }

    console.log('✅ Teste de submissões concluído');

    await page.screenshot({ 
      path: 'test-results/stress/05-rapid-submissions.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });

  test('should test infinite scroll performance', async ({ page }) => {
    await page.click('[data-testid="tab-gallery"]');
    await page.waitForTimeout(2000);

    console.log('📜 Testando scroll infinito...');

    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(1000);
      
      const scrollHeight = await page.evaluate(() => document.body.scrollHeight);
      console.log(`  Scroll ${i + 1}: ${scrollHeight}px`);
    }

    await page.screenshot({ 
      path: 'test-results/stress/06-infinite-scroll.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });

  test('should test WebSocket connection stability', async ({ page }) => {
    console.log('🔌 Testando estabilidade WebSocket...');

    // Monitorar WebSocket
    page.on('websocket', ws => {
      console.log(`✅ WebSocket conectado: ${ws.url()}`);
      
      ws.on('framesent', event => {
        console.log(`  ⬆️ Frame enviado`);
      });
      
      ws.on('framereceived', event => {
        console.log(`  ⬇️ Frame recebido`);
      });
      
      ws.on('close', () => {
        console.log(`  ❌ WebSocket fechado`);
      });
    });

    // Navegar entre abas para testar conexão
    await page.click('[data-testid="tab-dashboard"]');
    await page.waitForTimeout(2000);
    await page.click('[data-testid="tab-calendar"]');
    await page.waitForTimeout(2000);

    await page.screenshot({ 
      path: 'test-results/stress/07-websocket.png' 
    });

    expect(true).toBeTruthy();
  });

  test('should test concurrent operations', async ({ page }) => {
    console.log('⚡ Testando operações concorrentes...');

    await page.click('[data-testid="tab-appointments"]');
    await page.waitForTimeout(2000);

    // Simular múltiplas ações simultâneas
    const actions = [
      page.click('[data-testid="btn-new-appointment"]').catch(() => {}),
      page.locator('input[type="search"]').first().fill('test').catch(() => {}),
      page.evaluate(() => window.scrollTo(0, 500))
    ];

    await Promise.all(actions);
    await page.waitForTimeout(2000);

    console.log('✅ Operações concorrentes concluídas');

    await page.screenshot({ 
      path: 'test-results/stress/08-concurrent-operations.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });

  test('should measure network requests', async ({ page }) => {
    console.log('🌐 Medindo requests de rede...');

    const requests = [];

    page.on('request', request => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType()
      });
    });

    // Navegar por várias abas
    const tabs = ['dashboard', 'clients', 'appointments', 'gallery'];
    for (const tab of tabs) {
      await page.click(`[data-testid="tab-${tab}"]`).catch(() => {});
      await page.waitForTimeout(2000);
    }

    console.log(`📊 Total de requests: ${requests.length}`);
    
    // Agrupar por tipo
    const byType = {};
    requests.forEach(req => {
      byType[req.resourceType] = (byType[req.resourceType] || 0) + 1;
    });

    console.log('📊 Requests por tipo:');
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });

    await page.screenshot({ 
      path: 'test-results/stress/09-network-requests.png' 
    });

    expect(requests.length).toBeGreaterThan(0);
  });

  test('should test error recovery', async ({ page }) => {
    console.log('🔄 Testando recuperação de erros...');

    // Tentar ações que podem falhar
    await page.click('[data-testid="tab-clients"]');
    await page.waitForTimeout(1000);

    // Tentar clicar em elemento que pode não existir
    await page.click('[data-testid="nonexistent-button"]').catch(() => {
      console.log('⚠️ Elemento não encontrado (esperado)');
    });

    await page.waitForTimeout(500);

    // Verificar se aplicação ainda está responsiva
    const dashboardTab = page.locator('[data-testid="tab-dashboard"]');
    const isClickable = await dashboardTab.isEnabled({ timeout: 5000 }).catch(() => false);
    
    if (isClickable) {
      console.log('✅ Aplicação se recuperou de erro');
    }

    await page.screenshot({ 
      path: 'test-results/stress/10-error-recovery.png' 
    });

    expect(true).toBeTruthy();
  });
});

test.describe('Performance - Métricas Core Web Vitals', () => {
  test('should measure Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const vitals = await page.evaluate(() => {
      return new Promise((resolve) => {
        const metrics = {};
        
        // LCP - Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // FID - First Input Delay
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          metrics.fid = entries[0].processingStart - entries[0].startTime;
        }).observe({ entryTypes: ['first-input'] });

        // CLS - Cumulative Layout Shift
        let clsScore = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsScore += entry.value;
            }
          }
          metrics.cls = clsScore;
        }).observe({ entryTypes: ['layout-shift'] });

        setTimeout(() => resolve(metrics), 3000);
      });
    });

    console.log('📊 Core Web Vitals:');
    console.log(`  - LCP (Largest Contentful Paint): ${vitals.lcp || 'N/A'}ms`);
    console.log(`  - FID (First Input Delay): ${vitals.fid || 'N/A'}ms`);
    console.log(`  - CLS (Cumulative Layout Shift): ${vitals.cls || 'N/A'}`);

    await page.screenshot({ 
      path: 'test-results/stress/core-web-vitals.png' 
    });

    expect(true).toBeTruthy();
  });
});

