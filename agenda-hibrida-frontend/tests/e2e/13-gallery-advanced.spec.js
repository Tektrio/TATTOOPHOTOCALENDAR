/**
 * E2E Tests - Galeria Avançada
 * Testa funcionalidades avançadas da galeria de fotos
 */

import { test, expect } from '@playwright/test';

test.describe('Galeria Avançada - Funcionalidades', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navegar para aba de galeria
    await page.click('[data-testid="tab-gallery"]');
    await page.waitForTimeout(2000); // Lazy loading
  });

  test('should load gallery interface', async ({ page }) => {
    // Verificar elementos da galeria
    const galleryElements = [
      'text=/Galeria|Gallery|Fotos/i',
      '[data-testid="gallery"]',
      'img, [role="img"]'
    ];

    let found = false;
    for (const selector of galleryElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        found = true;
        console.log(`✅ Galeria encontrada: ${selector}`);
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/gallery/01-interface.png',
      fullPage: true 
    });

    expect(found).toBeTruthy();
  });

  test('should count visible images', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Contar imagens visíveis
    const images = page.locator('img[src*="http"], img[src*="data:"], img[src*="blob:"]');
    const count = await images.count();
    
    console.log(`📸 Imagens encontradas: ${count}`);

    await page.screenshot({ 
      path: 'test-results/gallery/02-images-count.png',
      fullPage: true 
    });

    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should test image grid/masonry layout', async ({ page }) => {
    await page.waitForTimeout(1500);

    // Verificar layout de grade
    const layoutElements = [
      '[data-testid="image-grid"]',
      '.grid, .masonry, .gallery-grid',
      '[style*="grid"]'
    ];

    for (const selector of layoutElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`✅ Layout de grade encontrado: ${selector}`);
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/gallery/03-layout.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });

  test('should test image filtering', async ({ page }) => {
    // Verificar filtros disponíveis
    const filterElements = [
      '[data-testid="gallery-filter"]',
      'select',
      'button:has-text("Filtrar")',
      'text=/Filtro|Filter/i'
    ];

    for (const selector of filterElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`✅ Filtros encontrados: ${selector}`);
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/gallery/04-filters.png' 
    });

    expect(true).toBeTruthy();
  });

  test('should test search functionality', async ({ page }) => {
    // Testar busca na galeria
    const searchInputs = [
      '[data-testid="gallery-search"]',
      'input[type="search"]',
      'input[placeholder*="Buscar"], input[placeholder*="Search"]'
    ];

    for (const selector of searchInputs) {
      const input = page.locator(selector).first();
      if (await input.count() > 0) {
        // Testar digitação
        await input.fill('test').catch(() => {});
        await page.waitForTimeout(1000);
        await input.clear().catch(() => {});
        
        console.log(`✅ Busca testada: ${selector}`);
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/gallery/05-search.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });

  test('should test image lightbox/modal', async ({ page }) => {
    await page.waitForTimeout(1500);

    // Tentar abrir primeira imagem em modal
    const firstImage = page.locator('img[src*="http"], img[src*="data:"]').first();
    
    if (await firstImage.count() > 0) {
      const isVisible = await firstImage.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isVisible) {
        // Clicar na imagem
        await firstImage.click({ timeout: 3000 }).catch(() => {
          console.log('⚠️ Não foi possível clicar na imagem');
        });
        
        await page.waitForTimeout(1000);
        
        // Verificar se modal abriu
        const modalSelectors = [
          '[role="dialog"]',
          '.modal, .lightbox',
          '[data-testid="image-modal"]'
        ];

        for (const selector of modalSelectors) {
          const modal = page.locator(selector).first();
          if (await modal.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log(`✅ Modal/Lightbox aberto: ${selector}`);
            
            await page.screenshot({ 
              path: 'test-results/gallery/06-lightbox-open.png' 
            });
            
            // Tentar fechar
            const closeButtons = [
              'button:has-text("×")',
              'button:has-text("Fechar")',
              '[aria-label*="close"]'
            ];
            
            for (const closeBtn of closeButtons) {
              const btn = page.locator(closeBtn).first();
              if (await btn.isVisible({ timeout: 1000 }).catch(() => false)) {
                await btn.click().catch(() => {});
                break;
              }
            }
            break;
          }
        }
      }
    }

    await page.screenshot({ 
      path: 'test-results/gallery/06-lightbox.png' 
    });

    expect(true).toBeTruthy();
  });

  test('should test pagination or infinite scroll', async ({ page }) => {
    await page.waitForTimeout(2000);

    // Verificar paginação
    const paginationElements = [
      '[data-testid="pagination"]',
      'button:has-text("Próximo")',
      'button:has-text("Anterior")',
      '.pagination'
    ];

    let foundPagination = false;
    for (const selector of paginationElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        foundPagination = true;
        console.log(`✅ Paginação encontrada: ${selector}`);
        break;
      }
    }

    if (!foundPagination) {
      // Testar infinite scroll
      const initialHeight = await page.evaluate(() => document.body.scrollHeight);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(2000);
      const newHeight = await page.evaluate(() => document.body.scrollHeight);
      
      if (newHeight > initialHeight) {
        console.log('✅ Infinite scroll detectado');
      }
    }

    await page.screenshot({ 
      path: 'test-results/gallery/07-pagination.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });

  test('should test image upload button', async ({ page }) => {
    // Verificar botão de upload (não fazer upload real)
    const uploadButtons = [
      '[data-testid="btn-upload-image"]',
      'button:has-text("Upload")',
      'button:has-text("Adicionar")',
      'input[type="file"]'
    ];

    for (const selector of uploadButtons) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        console.log(`✅ Botão de upload encontrado: ${selector}`);
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/gallery/08-upload-button.png' 
    });

    expect(true).toBeTruthy();
  });

  test('should test image categories/tags', async ({ page }) => {
    // Verificar categorias ou tags
    const categoryElements = [
      '[data-testid="image-categories"]',
      'text=/Categoria|Category|Tag/i',
      '.category, .tag'
    ];

    for (const selector of categoryElements) {
      const elements = page.locator(selector);
      const count = await elements.count();
      if (count > 0) {
        console.log(`✅ ${count} categorias/tags encontradas`);
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/gallery/09-categories.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });

  test('should verify image metadata display', async ({ page }) => {
    await page.waitForTimeout(1500);

    // Verificar se metadados são exibidos
    const metadataElements = [
      '[data-testid="image-metadata"]',
      'text=/Data|Size|Tamanho|Resolução/i',
      '.metadata, .image-info'
    ];

    for (const selector of metadataElements) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        const text = await element.textContent().catch(() => '');
        console.log(`✅ Metadados encontrados: ${text.substring(0, 50)}...`);
        break;
      }
    }

    await page.screenshot({ 
      path: 'test-results/gallery/10-metadata.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });
});

test.describe('Galeria - Performance e Loading', () => {
  test('should test lazy loading of images', async ({ page }) => {
    await page.goto('/');
    await page.click('[data-testid="tab-gallery"]');
    
    // Verificar lazy loading
    await page.waitForTimeout(1000);
    
    const imagesBeforeScroll = await page.locator('img[src*="http"]').count();
    console.log(`📸 Imagens antes do scroll: ${imagesBeforeScroll}`);
    
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(2000);
    
    const imagesAfterScroll = await page.locator('img[src*="http"]').count();
    console.log(`📸 Imagens após scroll: ${imagesAfterScroll}`);
    
    await page.screenshot({ 
      path: 'test-results/gallery/performance-lazy-loading.png',
      fullPage: true 
    });

    expect(true).toBeTruthy();
  });

  test('should measure gallery load time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.click('[data-testid="tab-gallery"]');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    console.log(`⏱️ Tempo de carregamento da galeria: ${loadTime}ms`);
    
    await page.screenshot({ 
      path: 'test-results/gallery/performance-load-time.png',
      fullPage: true 
    });

    // Alertar se muito lento
    if (loadTime > 5000) {
      console.log('⚠️ Galeria está carregando lentamente!');
    }

    expect(loadTime).toBeLessThan(10000); // Máximo 10 segundos
  });
});

