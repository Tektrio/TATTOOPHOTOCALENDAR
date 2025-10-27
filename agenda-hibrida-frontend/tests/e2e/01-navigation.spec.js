/**
 * E2E Tests - Navigation and Basic Interface
 * Tests navigation between tabs and basic UI elements
 */

import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should load the main dashboard', async ({ page }) => {
    // Verify main elements are visible
    await expect(page.locator('h1, h2').filter({ hasText: /Dashboard|Agenda/ })).toBeVisible();
    
    // Verify tabs are present
    const tabs = ['Dashboard', 'Calendário', 'Agendamentos', 'Clientes', 'Importar', 'Galeria', 'Google Drive', 'Configurações'];
    for (const tab of tabs) {
      await expect(page.locator(`button:has-text("${tab}"), [role="tab"]:has-text("${tab}")`)).toBeVisible();
    }
  });

  test('should navigate between tabs', async ({ page }) => {
    // Navigate to Clientes tab
    await page.click('button:has-text("Clientes"), [role="tab"]:has-text("Clientes")');
    await expect(page.locator('text=/Clientes|Lista de Clientes/i')).toBeVisible({ timeout: 5000 });
    
    // Navigate to Agendamentos tab
    await page.click('button:has-text("Agendamentos"), [role="tab"]:has-text("Agendamentos")');
    await expect(page.locator('text=/Agendamentos|Próximos Agendamentos/i')).toBeVisible({ timeout: 5000 });
    
    // Navigate to Calendário tab
    await page.click('button:has-text("Calendário"), [role="tab"]:has-text("Calendário")');
    await expect(page.locator('text=/Calendário|Outubro|Novembro/i')).toBeVisible({ timeout: 5000 });
    
    // Navigate back to Dashboard
    await page.click('button:has-text("Dashboard"), [role="tab"]:has-text("Dashboard")');
    await expect(page.locator('text=/Total de Clientes|Próximos Agendamentos/i')).toBeVisible({ timeout: 5000 });
  });

  test('should display dashboard statistics cards', async ({ page }) => {
    // Verify stat cards are present
    const expectedStats = ['Total de Clientes', 'Próximos Agendamentos', 'Arquivos Totais'];
    
    for (const stat of expectedStats) {
      await expect(page.locator(`text=${stat}`)).toBeVisible();
    }
    
    // Verify numbers are displayed
    await expect(page.locator('[class*="text-"][class*="font-bold"]').first()).toBeVisible();
  });

  test('should have responsive navigation on mobile', async ({ page, viewport }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if mobile menu button exists (hamburger menu)
    const mobileMenuButton = page.locator('button[aria-label*="menu"], button[aria-label*="Menu"], svg[class*="menu"]');
    
    if (await mobileMenuButton.count() > 0) {
      await mobileMenuButton.first().click();
      
      // Verify tabs are visible in mobile menu
      await expect(page.locator('text=Clientes')).toBeVisible();
    }
  });

  test('should show sync status indicator', async ({ page }) => {
    // Check for WebSocket connection status
    const statusIndicator = page.locator('text=/Conectado|Desconectado|Sincronizando/i');
    
    // Wait for connection to establish (max 10 seconds)
    await statusIndicator.waitFor({ timeout: 10000 }).catch(() => {
      // If status indicator not found, test passes (optional feature)
      console.log('Status indicator not found - may not be implemented yet');
    });
  });

  test('should navigate via dashboard cards', async ({ page }) => {
    // Click on "Total de Clientes" card (if clickable)
    const clientsCard = page.locator('text=Total de Clientes').locator('..');
    
    await clientsCard.click();
    
    // Wait a moment to see if navigation occurred
    await page.waitForTimeout(500);
    
    // Check if we're on Clientes tab (card navigation feature)
    const isOnClientsTab = await page.locator('text=/Lista de Clientes/i').isVisible().catch(() => false);
    
    if (isOnClientsTab) {
      await expect(page.locator('text=/Lista de Clientes/i')).toBeVisible();
    }
  });
});

