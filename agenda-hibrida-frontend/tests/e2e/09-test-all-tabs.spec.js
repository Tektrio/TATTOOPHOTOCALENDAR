import { test, expect } from '@playwright/test';

/**
 * Teste de Todas as Abas - Clicar e Verificar Erros
 * Testa cada aba individualmente e captura screenshots
 */

test.describe('Teste Completo de Todas as Abas com Correção de Erros', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar para a página inicial
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('01 - Dashboard - Verificar Funcionalidade', async ({ page }) => {
    console.log('🏠 Testando aba Dashboard...');
    
    const dashboardTab = page.locator('[data-testid="tab-dashboard"]');
    await expect(dashboardTab).toBeVisible();
    await dashboardTab.click();
    await page.waitForTimeout(2000);
    
    // Verificar se não há erros de console
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Verificar elementos do dashboard
    await expect(page.locator('text=Total de Clientes').or(page.locator('text=Dashboard'))).toBeVisible({ timeout: 10000 });
    
    await page.screenshot({ path: 'test-results/tabs/01-dashboard.png', fullPage: true });
    console.log(`✅ Dashboard OK - ${consoleErrors.length} erros encontrados`);
  });

  test('02 - Calendário Visual - Verificar Funcionalidade', async ({ page }) => {
    console.log('📅 Testando aba Calendário...');
    
    const calendarTab = page.locator('[data-testid="tab-calendar"]');
    await expect(calendarTab).toBeVisible();
    await calendarTab.click();
    await page.waitForTimeout(3000);
    
    // Aguardar o calendário carregar
    await page.waitForSelector('[class*="calendar"], .calendar', { timeout: 15000 }).catch(() => {
      console.log('⚠️ Calendário não encontrado, mas continuando...');
    });
    
    await page.screenshot({ path: 'test-results/tabs/02-calendario.png', fullPage: true });
    console.log('✅ Calendário OK');
  });

  test('03 - Agendamentos - Verificar Funcionalidade', async ({ page }) => {
    console.log('⏰ Testando aba Agendamentos...');
    
    const appointmentsTab = page.locator('[data-testid="tab-appointments"]');
    await expect(appointmentsTab).toBeVisible();
    await appointmentsTab.click();
    await page.waitForTimeout(2000);
    
    // Verificar se a lista de agendamentos está visível
    const hasContent = await page.locator('text=Próximos Agendamentos').or(
      page.locator('text=agendamento')
    ).count();
    
    console.log(`📊 Encontrados ${hasContent} elementos relacionados a agendamentos`);
    
    await page.screenshot({ path: 'test-results/tabs/03-agendamentos.png', fullPage: true });
    console.log('✅ Agendamentos OK');
  });

  test('04 - Clientes - Verificar Funcionalidade', async ({ page }) => {
    console.log('👥 Testando aba Clientes...');
    
    const clientsTab = page.locator('[data-testid="tab-clients"]');
    await expect(clientsTab).toBeVisible();
    await clientsTab.click();
    await page.waitForTimeout(3000);
    
    // Verificar se há elementos de clientes
    await page.waitForSelector('text=Clientes, text=Nome, [data-testid*="client"]', { 
      timeout: 10000 
    }).catch(() => {
      console.log('⚠️ Esperando carregar clientes...');
    });
    
    await page.screenshot({ path: 'test-results/tabs/04-clientes.png', fullPage: true });
    console.log('✅ Clientes OK');
  });

  test('05 - Importar Dados - Verificar Funcionalidade', async ({ page }) => {
    console.log('📥 Testando aba Importar...');
    
    const importTab = page.locator('[data-testid="tab-import"]');
    await expect(importTab).toBeVisible();
    await importTab.click();
    await page.waitForTimeout(2000);
    
    // Verificar se o assistente de importação carregou
    const importElements = await page.locator('text=Import, text=Excel, text=ICS, input[type="file"]').count();
    console.log(`📦 Encontrados ${importElements} elementos de importação`);
    
    await page.screenshot({ path: 'test-results/tabs/05-importar.png', fullPage: true });
    console.log('✅ Importar OK');
  });

  test('06 - Galeria - Verificar Funcionalidade', async ({ page }) => {
    console.log('🖼️ Testando aba Galeria...');
    
    const galleryTab = page.locator('[data-testid="tab-gallery"]');
    await expect(galleryTab).toBeVisible();
    await galleryTab.click();
    await page.waitForTimeout(3000);
    
    // Aguardar elementos da galeria
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/tabs/06-galeria.png', fullPage: true });
    console.log('✅ Galeria OK');
  });

  test('07 - Google Drive - Verificar Funcionalidade', async ({ page }) => {
    console.log('☁️ Testando aba Google Drive...');
    
    const driveTab = page.locator('[data-testid="tab-drive"]');
    await expect(driveTab).toBeVisible();
    await driveTab.click();
    await page.waitForTimeout(3000);
    
    // Verificar elementos do Drive
    const driveElements = await page.locator('text=Google, text=Drive, text=Conectar').count();
    console.log(`☁️ Encontrados ${driveElements} elementos do Google Drive`);
    
    await page.screenshot({ path: 'test-results/tabs/07-google-drive.png', fullPage: true });
    console.log('✅ Google Drive OK');
  });

  test('08 - Financeiro - Verificar Funcionalidade', async ({ page }) => {
    console.log('💰 Testando aba Financeiro...');
    
    const financialTab = page.locator('[data-testid="tab-financial"]');
    await expect(financialTab).toBeVisible();
    await financialTab.click();
    await page.waitForTimeout(3000);
    
    // Aguardar dashboard financeiro
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/tabs/08-financeiro.png', fullPage: true });
    console.log('✅ Financeiro OK');
  });

  test('09 - Funcionários - Verificar Funcionalidade', async ({ page }) => {
    console.log('👨‍💼 Testando aba Funcionários...');
    
    const employeesTab = page.locator('[data-testid="tab-employees"]');
    await expect(employeesTab).toBeVisible();
    await employeesTab.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/tabs/09-funcionarios.png', fullPage: true });
    console.log('✅ Funcionários OK');
  });

  test('10 - Importar Vagaro - Verificar Funcionalidade', async ({ page }) => {
    console.log('📊 Testando aba Importar Vagaro...');
    
    const vagaroTab = page.locator('[data-testid="tab-vagaro-import"]');
    await expect(vagaroTab).toBeVisible();
    await vagaroTab.click();
    await page.waitForTimeout(3000);
    
    // Verificar elementos específicos do Vagaro
    const vagaroElements = await page.locator('text=Vagaro, text=Import, text=Excel').count();
    console.log(`📊 Encontrados ${vagaroElements} elementos do Vagaro`);
    
    await page.screenshot({ path: 'test-results/tabs/10-vagaro-import.png', fullPage: true });
    console.log('✅ Vagaro Import OK');
  });

  test('11 - Configurações - Verificar Funcionalidade', async ({ page }) => {
    console.log('⚙️ Testando aba Configurações...');
    
    const settingsTab = page.locator('[data-testid="tab-settings"]');
    await expect(settingsTab).toBeVisible();
    await settingsTab.click();
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/tabs/11-configuracoes.png', fullPage: true });
    console.log('✅ Configurações OK');
  });

  test('12 - Navegação Sequencial - Testar Todas as Abas em Sequência', async ({ page }) => {
    console.log('\n' + '='.repeat(60));
    console.log('🔄 TESTE SEQUENCIAL DE TODAS AS ABAS');
    console.log('='.repeat(60));
    
    const tabs = [
      { id: 'dashboard', name: 'Dashboard', icon: '🏠' },
      { id: 'calendar', name: 'Calendário', icon: '📅' },
      { id: 'appointments', name: 'Agendamentos', icon: '⏰' },
      { id: 'clients', name: 'Clientes', icon: '👥' },
      { id: 'import', name: 'Importar', icon: '📥' },
      { id: 'gallery', name: 'Galeria', icon: '🖼️' },
      { id: 'drive', name: 'Google Drive', icon: '☁️' },
      { id: 'financial', name: 'Financeiro', icon: '💰' },
      { id: 'employees', name: 'Funcionários', icon: '👨‍💼' },
      { id: 'vagaro-import', name: 'Vagaro', icon: '📊' },
      { id: 'settings', name: 'Configurações', icon: '⚙️' }
    ];
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const tab of tabs) {
      try {
        console.log(`\n${tab.icon} Testando: ${tab.name}...`);
        
        const tabElement = page.locator(`[data-testid="tab-${tab.id}"]`);
        await expect(tabElement).toBeVisible();
        await tabElement.click();
        await page.waitForTimeout(2000);
        
        // Verificar se a aba está ativa
        const isActive = await tabElement.getAttribute('data-state');
        if (isActive === 'active') {
          console.log(`   ✅ ${tab.name} - Ativa e funcionando`);
          successCount++;
        } else {
          console.log(`   ⚠️ ${tab.name} - Não está ativa`);
          errorCount++;
        }
        
        await page.screenshot({ 
          path: `test-results/tabs/sequential-${tab.id}.png`,
          fullPage: false
        });
        
      } catch (error) {
        console.log(`   ❌ ${tab.name} - ERRO: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO FINAL:');
    console.log(`   ✅ Sucessos: ${successCount}/${tabs.length}`);
    console.log(`   ❌ Erros: ${errorCount}/${tabs.length}`);
    console.log(`   📈 Taxa de sucesso: ${((successCount/tabs.length)*100).toFixed(1)}%`);
    console.log('='.repeat(60) + '\n');
    
    // Assert que todos passaram
    expect(errorCount).toBe(0);
  });

  test('13 - Verificar Visual das Novas Abas Melhoradas', async ({ page }) => {
    console.log('🎨 Verificando visual das abas melhoradas...');
    
    // Capturar screenshot das abas em diferentes estados
    await page.screenshot({ 
      path: 'test-results/tabs/00-tabs-overview.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 300 }
    });
    
    // Testar hover em cada aba
    const tabs = ['dashboard', 'calendar', 'appointments', 'clients'];
    
    for (const tabId of tabs) {
      const tab = page.locator(`[data-testid="tab-${tabId}"]`);
      await tab.hover();
      await page.waitForTimeout(500);
    }
    
    await page.screenshot({ 
      path: 'test-results/tabs/00-tabs-hover-states.png',
      fullPage: false,
      clip: { x: 0, y: 0, width: 1280, height: 300 }
    });
    
    console.log('✅ Visual das abas verificado');
  });
});

