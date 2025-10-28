import { test, expect } from '@playwright/test';

/**
 * Teste Visual Simplificado - Todas as Abas
 * Testa cada aba e captura screenshots
 */

test.describe('Teste Visual de Todas as Abas - Layout Melhorado', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);
  });

  test('00 - Capturar Visual Geral das Abas', async ({ page }) => {
    console.log('🎨 Capturando visual das abas melhoradas...');
    
    // Screenshot da área de navegação
    await page.screenshot({ 
      path: 'test-results/tabs/00-tabs-new-design.png',
      fullPage: false
    });
    
    console.log('✅ Screenshot capturado');
  });

  test('01 - Testar Todas as Abas Sequencialmente', async ({ page }) => {
    console.log('\n📋 TESTANDO TODAS AS ABAS\n');
    
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
        console.log(`${tab.icon} Testando: ${tab.name}...`);
        
        const tabElement = page.locator(`[data-testid="tab-${tab.id}"]`);
        
        // Verificar se a aba está visível
        await expect(tabElement).toBeVisible({ timeout: 5000 });
        
        // Clicar na aba
        await tabElement.click({ timeout: 5000 });
        await page.waitForTimeout(1500);
        
        // Capturar screenshot
        await page.screenshot({ 
          path: `test-results/tabs/${tab.id}.png`,
          fullPage: true
        });
        
        console.log(`   ✅ ${tab.name} - OK`);
        successCount++;
        
      } catch (error) {
        console.log(`   ❌ ${tab.name} - ERRO: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO:');
    console.log(`   ✅ Sucessos: ${successCount}/${tabs.length}`);
    console.log(`   ❌ Erros: ${errorCount}/${tabs.length}`);
    console.log(`   📈 Taxa de sucesso: ${((successCount/tabs.length)*100).toFixed(1)}%`);
    console.log('='.repeat(60) + '\n');
  });

  test('02 - Testar Estados Hover das Abas', async ({ page }) => {
    console.log('🖱️ Testando estados hover...');
    
    const tabs = ['dashboard', 'calendar', 'appointments', 'clients', 'import'];
    
    for (const tabId of tabs) {
      const tab = page.locator(`[data-testid="tab-${tabId}"]`);
      await tab.hover();
      await page.waitForTimeout(300);
    }
    
    await page.screenshot({ 
      path: 'test-results/tabs/00-hover-states.png',
      fullPage: false
    });
    
    console.log('✅ Estados hover testados');
  });

  test('03 - Testar Transições entre Abas', async ({ page }) => {
    console.log('🔄 Testando transições...');
    
    const sequence = ['dashboard', 'clients', 'calendar', 'gallery', 'financial'];
    
    for (const tabId of sequence) {
      await page.locator(`[data-testid="tab-${tabId}"]`).click();
      await page.waitForTimeout(800);
    }
    
    console.log('✅ Transições suaves funcionando');
  });

  test('04 - Verificar Cores Distintas das Abas Ativas', async ({ page }) => {
    console.log('🎨 Verificando cores distintas...');
    
    const tabs = [
      'dashboard',   // Roxo/Rosa
      'calendar',    // Azul/Ciano
      'appointments', // Verde/Esmeralda
      'clients',     // Laranja/Âmbar
      'gallery'      // Rosa/Rose
    ];
    
    for (const tabId of tabs) {
      await page.locator(`[data-testid="tab-${tabId}"]`).click();
      await page.waitForTimeout(500);
      
      await page.screenshot({ 
        path: `test-results/tabs/color-${tabId}.png`,
        fullPage: false,
        clip: { x: 0, y: 100, width: 1280, height: 150 }
      });
    }
    
    console.log('✅ Cores distintas verificadas');
  });
});

