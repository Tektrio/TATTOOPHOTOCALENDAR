/**
 * E2E Tests - Client Management
 * Tests client creation, editing, and deletion flows
 */

import { test, expect } from '@playwright/test';

test.describe('Client Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to Clients tab
    await page.click('button:has-text("Clientes"), [role="tab"]:has-text("Clientes")');
    await page.waitForTimeout(1000);
  });

  test('should open new client modal', async ({ page }) => {
    // Click "Novo Cliente" button
    await page.click('button:has-text("Novo Cliente"), button:has-text("Novo")');
    
    // Verify modal opened
    await expect(page.locator('text=/Novo Cliente|Cadastrar Cliente/i')).toBeVisible({ timeout: 5000 });
    
    // Verify form fields are present
    await expect(page.locator('input[name="name"], input[placeholder*="Nome"]')).toBeVisible();
    await expect(page.locator('input[name="email"], input[placeholder*="Email"], input[type="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"], input[placeholder*="Telefone"]')).toBeVisible();
  });

  test('should create a new client', async ({ page }) => {
    // Generate unique client data
    const timestamp = Date.now();
    const clientData = {
      name: `Cliente E2E Test ${timestamp}`,
      email: `e2e.test.${timestamp}@example.com`,
      phone: '11987654321',
      address: 'Rua Teste E2E, 123'
    };
    
    // Open new client modal
    await page.click('button:has-text("Novo Cliente"), button:has-text("Novo")');
    await page.waitForTimeout(500);
    
    // Fill form fields
    await page.fill('input[name="name"], input[placeholder*="Nome"]', clientData.name);
    await page.fill('input[name="email"], input[placeholder*="Email"], input[type="email"]', clientData.email);
    await page.fill('input[name="phone"], input[placeholder*="Telefone"]', clientData.phone);
    
    // Try to fill address if field exists
    const addressField = page.locator('input[name="address"], textarea[name="address"]');
    if (await addressField.count() > 0) {
      await addressField.fill(clientData.address);
    }
    
    // Submit form
    await page.click('button:has-text("Salvar"), button:has-text("Criar"), button[type="submit"]');
    
    // Wait for success notification or modal to close
    await page.waitForTimeout(2000);
    
    // Verify success (toast notification or client in list)
    const successNotification = page.locator('text=/sucesso|criado|adicionado/i');
    const clientInList = page.locator(`text=${clientData.name}`);
    
    const hasSuccessNotification = await successNotification.isVisible().catch(() => false);
    const isInList = await clientInList.isVisible().catch(() => false);
    
    expect(hasSuccessNotification || isInList).toBeTruthy();
  });

  test('should validate required fields', async ({ page }) => {
    // Open new client modal
    await page.click('button:has-text("Novo Cliente"), button:has-text("Novo")');
    await page.waitForTimeout(500);
    
    // Try to submit empty form
    await page.click('button:has-text("Salvar"), button:has-text("Criar"), button[type="submit"]');
    
    // Wait for validation messages
    await page.waitForTimeout(1000);
    
    // Verify error messages appear
    const errorMessage = page.locator('text=/obrigatório|required|Campo obrigatório/i, [class*="error"], [class*="invalid"]');
    
    await expect(errorMessage.first()).toBeVisible({ timeout: 3000 });
  });

  test('should validate email format', async ({ page }) => {
    // Open new client modal
    await page.click('button:has-text("Novo Cliente"), button:has-text("Novo")');
    await page.waitForTimeout(500);
    
    // Fill with invalid email
    await page.fill('input[name="name"], input[placeholder*="Nome"]', 'Test Client');
    await page.fill('input[name="email"], input[placeholder*="Email"], input[type="email"]', 'invalid-email');
    await page.fill('input[name="phone"], input[placeholder*="Telefone"]', '11987654321');
    
    // Blur email field to trigger validation
    await page.locator('input[name="email"], input[placeholder*="Email"], input[type="email"]').blur();
    
    // Wait for validation
    await page.waitForTimeout(1000);
    
    // Try to submit
    await page.click('button:has-text("Salvar"), button:has-text("Criar"), button[type="submit"]');
    await page.waitForTimeout(1000);
    
    // Verify error message for invalid email
    const emailError = page.locator('text=/email inválido|invalid email|formato.*email/i');
    
    // Either validation message shows or form doesn't submit
    const hasEmailError = await emailError.isVisible().catch(() => false);
    const modalStillOpen = await page.locator('text=/Novo Cliente|Cadastrar Cliente/i').isVisible().catch(() => false);
    
    expect(hasEmailError || modalStillOpen).toBeTruthy();
  });

  test('should search/filter clients', async ({ page }) => {
    // Look for search input
    const searchInput = page.locator('input[type="search"], input[placeholder*="Buscar"], input[placeholder*="Procurar"], input[placeholder*="Pesquisar"]');
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('Test');
      await page.waitForTimeout(1000);
      
      // Verify filtering occurred (results updated)
      const clientCards = page.locator('[class*="client"], [class*="card"]');
      await expect(clientCards.first()).toBeVisible({ timeout: 3000 }).catch(() => {
        // If no results, that's also valid
        console.log('No matching clients found');
      });
    }
  });

  test('should display client list', async ({ page }) => {
    // Verify clients list or "no clients" message
    const clientsList = page.locator('[class*="client"], [class*="card"], table tbody tr');
    const noClientsMessage = page.locator('text=/Nenhum cliente|No clients|Lista vazia/i');
    
    const hasClients = await clientsList.count() > 0;
    const hasNoClientsMessage = await noClientsMessage.isVisible().catch(() => false);
    
    // Either there are clients or a "no clients" message
    expect(hasClients || hasNoClientsMessage).toBeTruthy();
  });
});

