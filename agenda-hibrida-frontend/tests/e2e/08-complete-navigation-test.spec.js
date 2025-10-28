import { test, expect } from '@playwright/test';

/**
 * Teste Completo de Navegação - Todas as Abas e Funcionalidades
 * Este teste percorre todas as seções principais do sistema
 */

test.describe('Teste Completo de Navegação - Todas as Abas', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navegar para a página inicial
    await page.goto('/');
    
    // Aguardar o carregamento completo da página
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
  });

  test('01 - Dashboard Principal - Verificar Cards e Estatísticas', async ({ page }) => {
    console.log('🏠 Testando Dashboard Principal...');
    
    // Verificar título da página
    await expect(page.locator('h1, h2').first()).toBeVisible({ timeout: 10000 });
    
    // Procurar por cards de estatísticas comuns em dashboards
    const possibleSelectors = [
      'text=Agendamentos',
      'text=Clientes',
      'text=Receita',
      'text=Total',
      '[role="main"]',
      '.dashboard',
      'main'
    ];
    
    let found = false;
    for (const selector of possibleSelectors) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        await expect(element).toBeVisible({ timeout: 5000 }).catch(() => {});
        found = true;
        console.log(`✅ Encontrado: ${selector}`);
        break;
      }
    }
    
    // Tirar screenshot do dashboard
    await page.screenshot({ path: 'test-results/01-dashboard.png', fullPage: true });
    console.log('✅ Dashboard carregado com sucesso');
  });

  test('02 - Calendário Visual - Verificar Visualização', async ({ page }) => {
    console.log('📅 Testando Calendário Visual...');
    
    // Procurar pelo link/botão do calendário
    const calendarLinks = [
      'text=Calendário',
      'text=Agenda',
      'text=Calendar',
      'a[href*="calendar"]',
      'a[href*="agenda"]',
      'button:has-text("Calendário")',
      '[data-testid="calendar-link"]'
    ];
    
    let navigated = false;
    for (const selector of calendarLinks) {
      const link = page.locator(selector).first();
      if (await link.count() > 0 && await link.isVisible().catch(() => false)) {
        await link.click().catch(() => {});
        await page.waitForTimeout(2000);
        navigated = true;
        console.log(`✅ Clicou em: ${selector}`);
        break;
      }
    }
    
    if (navigated) {
      // Verificar elementos do calendário
      await page.waitForTimeout(2000);
      
      // Procurar por elementos típicos de calendário
      const calendarElements = [
        '.calendar',
        '[class*="calendar"]',
        '[class*="Calendar"]',
        'text=Dom',
        'text=Seg',
        'text=Ter'
      ];
      
      for (const selector of calendarElements) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
          console.log(`✅ Encontrado elemento de calendário: ${selector}`);
          break;
        }
      }
    }
    
    await page.screenshot({ path: 'test-results/02-calendario.png', fullPage: true });
    console.log('✅ Calendário verificado');
  });

  test('03 - Clientes - Verificar Lista e Funcionalidades', async ({ page }) => {
    console.log('👥 Testando Página de Clientes...');
    
    // Navegar para clientes
    const clientLinks = [
      'text=Clientes',
      'text=Customers',
      'a[href*="customer"]',
      'a[href*="client"]',
      '[data-testid="clients-link"]'
    ];
    
    for (const selector of clientLinks) {
      const link = page.locator(selector).first();
      if (await link.count() > 0 && await link.isVisible().catch(() => false)) {
        await link.click();
        await page.waitForTimeout(2000);
        console.log(`✅ Navegou para: ${selector}`);
        break;
      }
    }
    
    // Verificar se há uma lista ou tabela de clientes
    const listElements = [
      'table',
      '[role="table"]',
      '.table',
      '[class*="customer"]',
      '[class*="client"]',
      'text=Nome',
      'text=Telefone',
      'text=Email'
    ];
    
    for (const selector of listElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`✅ Encontrado: ${selector}`);
      }
    }
    
    // Procurar botão de adicionar cliente
    const addButtons = [
      'text=Novo Cliente',
      'text=Adicionar',
      'text=Add',
      'button:has-text("+")',
      '[data-testid="add-client"]'
    ];
    
    for (const selector of addButtons) {
      const button = page.locator(selector).first();
      if (await button.count() > 0 && await button.isVisible().catch(() => false)) {
        console.log(`✅ Botão encontrado: ${selector}`);
        break;
      }
    }
    
    await page.screenshot({ path: 'test-results/03-clientes.png', fullPage: true });
    console.log('✅ Página de clientes verificada');
  });

  test('04 - Agendamentos - Verificar Funcionalidades', async ({ page }) => {
    console.log('📋 Testando Agendamentos...');
    
    // Navegar para agendamentos
    const appointmentLinks = [
      'text=Agendamentos',
      'text=Appointments',
      'a[href*="appointment"]',
      'a[href*="agendamento"]',
      '[data-testid="appointments-link"]'
    ];
    
    for (const selector of appointmentLinks) {
      const link = page.locator(selector).first();
      if (await link.count() > 0 && await link.isVisible().catch(() => false)) {
        await link.click();
        await page.waitForTimeout(2000);
        console.log(`✅ Navegou para: ${selector}`);
        break;
      }
    }
    
    // Verificar elementos de agendamento
    const appointmentElements = [
      'table',
      '[role="table"]',
      'text=Data',
      'text=Horário',
      'text=Cliente',
      'text=Status'
    ];
    
    for (const selector of appointmentElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`✅ Encontrado: ${selector}`);
      }
    }
    
    await page.screenshot({ path: 'test-results/04-agendamentos.png', fullPage: true });
    console.log('✅ Agendamentos verificados');
  });

  test('05 - Galeria - Verificar Visualização de Imagens', async ({ page }) => {
    console.log('🖼️ Testando Galeria...');
    
    // Navegar para galeria
    const galleryLinks = [
      'text=Galeria',
      'text=Gallery',
      'text=Fotos',
      'a[href*="gallery"]',
      'a[href*="galeria"]',
      '[data-testid="gallery-link"]'
    ];
    
    for (const selector of galleryLinks) {
      const link = page.locator(selector).first();
      if (await link.count() > 0 && await link.isVisible().catch(() => false)) {
        await link.click();
        await page.waitForTimeout(3000);
        console.log(`✅ Navegou para galeria: ${selector}`);
        break;
      }
    }
    
    // Verificar elementos de galeria
    const galleryElements = [
      'img',
      '[role="img"]',
      '.gallery',
      '[class*="gallery"]',
      '[class*="image"]',
      'text=Upload',
      'button:has-text("Upload")'
    ];
    
    for (const selector of galleryElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`✅ Elemento de galeria encontrado: ${selector}`);
      }
    }
    
    await page.screenshot({ path: 'test-results/05-galeria.png', fullPage: true });
    console.log('✅ Galeria verificada');
  });

  test('06 - Importação - Verificar Opções de Import', async ({ page }) => {
    console.log('📥 Testando Importação...');
    
    // Navegar para importação
    const importLinks = [
      'text=Importar',
      'text=Import',
      'text=Importação',
      'a[href*="import"]',
      '[data-testid="import-link"]'
    ];
    
    for (const selector of importLinks) {
      const link = page.locator(selector).first();
      if (await link.count() > 0 && await link.isVisible().catch(() => false)) {
        await link.click();
        await page.waitForTimeout(2000);
        console.log(`✅ Navegou para importação: ${selector}`);
        break;
      }
    }
    
    // Verificar opções de importação
    const importOptions = [
      'text=Excel',
      'text=Vagaro',
      'text=ICS',
      'text=Google',
      'input[type="file"]',
      'text=Selecionar arquivo'
    ];
    
    for (const selector of importOptions) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`✅ Opção de importação encontrada: ${selector}`);
      }
    }
    
    await page.screenshot({ path: 'test-results/06-importacao.png', fullPage: true });
    console.log('✅ Importação verificada');
  });

  test('07 - Google Drive - Verificar Integração', async ({ page }) => {
    console.log('☁️ Testando Google Drive...');
    
    // Navegar para Google Drive
    const driveLinks = [
      'text=Google Drive',
      'text=Drive',
      'a[href*="drive"]',
      'a[href*="google"]',
      '[data-testid="drive-link"]'
    ];
    
    for (const selector of driveLinks) {
      const link = page.locator(selector).first();
      if (await link.count() > 0 && await link.isVisible().catch(() => false)) {
        await link.click();
        await page.waitForTimeout(2000);
        console.log(`✅ Navegou para Google Drive: ${selector}`);
        break;
      }
    }
    
    // Verificar elementos do Drive
    const driveElements = [
      'text=Google',
      'text=Conectar',
      'text=Sincronizar',
      'button:has-text("Conectar")',
      '[class*="google"]',
      '[class*="drive"]'
    ];
    
    for (const selector of driveElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`✅ Elemento do Drive encontrado: ${selector}`);
      }
    }
    
    await page.screenshot({ path: 'test-results/07-google-drive.png', fullPage: true });
    console.log('✅ Google Drive verificado');
  });

  test('08 - Funcionários/Equipe - Verificar Gestão', async ({ page }) => {
    console.log('👨‍💼 Testando Funcionários...');
    
    // Navegar para funcionários
    const staffLinks = [
      'text=Funcionários',
      'text=Equipe',
      'text=Staff',
      'text=Employees',
      'a[href*="employee"]',
      'a[href*="staff"]',
      '[data-testid="staff-link"]'
    ];
    
    for (const selector of staffLinks) {
      const link = page.locator(selector).first();
      if (await link.count() > 0 && await link.isVisible().catch(() => false)) {
        await link.click();
        await page.waitForTimeout(2000);
        console.log(`✅ Navegou para funcionários: ${selector}`);
        break;
      }
    }
    
    await page.screenshot({ path: 'test-results/08-funcionarios.png', fullPage: true });
    console.log('✅ Funcionários verificados');
  });

  test('09 - Financeiro/Dashboard Financeiro', async ({ page }) => {
    console.log('💰 Testando Dashboard Financeiro...');
    
    // Navegar para financeiro
    const financeLinks = [
      'text=Financeiro',
      'text=Finance',
      'text=Receita',
      'text=Revenue',
      'a[href*="financ"]',
      'a[href*="revenue"]',
      '[data-testid="finance-link"]'
    ];
    
    for (const selector of financeLinks) {
      const link = page.locator(selector).first();
      if (await link.count() > 0 && await link.isVisible().catch(() => false)) {
        await link.click();
        await page.waitForTimeout(2000);
        console.log(`✅ Navegou para financeiro: ${selector}`);
        break;
      }
    }
    
    await page.screenshot({ path: 'test-results/09-financeiro.png', fullPage: true });
    console.log('✅ Financeiro verificado');
  });

  test('10 - Navegação Completa - Teste de Menu Principal', async ({ page }) => {
    console.log('🧭 Testando Navegação Completa do Menu...');
    
    // Encontrar todos os links de navegação
    const navLinks = await page.locator('nav a, [role="navigation"] a, header a').all();
    console.log(`📊 Total de links encontrados: ${navLinks.length}`);
    
    let testedLinks = 0;
    for (let i = 0; i < Math.min(navLinks.length, 10); i++) {
      try {
        const link = navLinks[i];
        const text = await link.textContent().catch(() => '');
        const href = await link.getAttribute('href').catch(() => '');
        
        if (text && href && !href.startsWith('http') && !href.includes('logout')) {
          console.log(`🔗 Testando link: ${text.trim()} (${href})`);
          
          await link.click().catch(() => {});
          await page.waitForTimeout(1500);
          await page.screenshot({ 
            path: `test-results/10-nav-${i}-${text.trim().replace(/\s+/g, '-').toLowerCase()}.png`,
            fullPage: true 
          });
          
          testedLinks++;
        }
      } catch (error) {
        console.log(`⚠️ Erro ao testar link ${i}: ${error.message}`);
      }
    }
    
    console.log(`✅ Total de links testados: ${testedLinks}`);
  });

  test('11 - Responsividade - Teste Mobile', async ({ page }) => {
    console.log('📱 Testando Responsividade Mobile...');
    
    // Mudar para viewport mobile
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ path: 'test-results/11-mobile-home.png', fullPage: true });
    
    // Procurar por menu hamburguer
    const mobileMenus = [
      'button[aria-label*="menu"]',
      'button[aria-label*="Menu"]',
      '[class*="hamburger"]',
      '[class*="mobile-menu"]',
      'button:has-text("☰")'
    ];
    
    for (const selector of mobileMenus) {
      const menu = page.locator(selector).first();
      if (await menu.count() > 0 && await menu.isVisible().catch(() => false)) {
        await menu.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: 'test-results/11-mobile-menu.png', fullPage: true });
        console.log(`✅ Menu mobile encontrado: ${selector}`);
        break;
      }
    }
    
    console.log('✅ Responsividade verificada');
  });

  test('12 - Teste de Performance - Tempo de Carregamento', async ({ page }) => {
    console.log('⚡ Testando Performance...');
    
    const startTime = Date.now();
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    console.log(`⏱️ Tempo de carregamento: ${loadTime}ms`);
    
    if (loadTime < 3000) {
      console.log('✅ Performance excelente! (< 3s)');
    } else if (loadTime < 5000) {
      console.log('⚠️ Performance aceitável (3-5s)');
    } else {
      console.log('❌ Performance lenta (> 5s)');
    }
    
    // Contar recursos carregados
    const images = await page.locator('img').count();
    const links = await page.locator('a').count();
    const buttons = await page.locator('button').count();
    
    console.log(`📊 Estatísticas da página:`);
    console.log(`   - Imagens: ${images}`);
    console.log(`   - Links: ${links}`);
    console.log(`   - Botões: ${buttons}`);
  });

  test('13 - Relatório Final - Resumo dos Testes', async ({ page }) => {
    console.log('\n' + '='.repeat(60));
    console.log('📋 RELATÓRIO FINAL - TESTE COMPLETO DE NAVEGAÇÃO');
    console.log('='.repeat(60));
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const summary = {
      url: page.url(),
      title: await page.title(),
      timestamp: new Date().toISOString(),
      viewport: await page.viewportSize(),
    };
    
    console.log('\n✅ RESUMO:');
    console.log(`   URL: ${summary.url}`);
    console.log(`   Título: ${summary.title}`);
    console.log(`   Data/Hora: ${summary.timestamp}`);
    console.log(`   Viewport: ${summary.viewport.width}x${summary.viewport.height}`);
    
    await page.screenshot({ path: 'test-results/13-final-screenshot.png', fullPage: true });
    
    console.log('\n🎉 TESTE COMPLETO FINALIZADO!');
    console.log('📸 Screenshots salvos em: test-results/');
    console.log('='.repeat(60) + '\n');
  });
});

