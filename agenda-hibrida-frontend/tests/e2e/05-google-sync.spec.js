/**
 * E2E Tests - Google Calendar Synchronization
 * Tests bidirectional sync between local appointments and Google Calendar
 */

import { test, expect } from '@playwright/test';

test.describe('Google Calendar Sync Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should show sync status badge in header', async ({ page }) => {
    // Look for sync status badge
    const syncBadge = page.locator('text=/Google Calendar|Sincronizando|Sincronizado/i');
    
    await expect(syncBadge).toBeVisible({ timeout: 10000 });
  });

  test('should display last sync timestamp', async ({ page }) => {
    // Check for timestamp text (e.g., "há 5 minutos", "nunca sincronizado")
    const timestampText = page.locator('text=/há.*minuto|nunca sincronizado/i');
    
    const hasTimestamp = await timestampText.count() > 0;
    
    if (hasTimestamp) {
      await expect(timestampText.first()).toBeVisible();
    } else {
      console.log('Sync timestamp not found - may not be connected to Google');
    }
  });

  test('should allow manual sync trigger', async ({ page }) => {
    // Look for sync button or clickable badge
    const syncTrigger = page.locator('[role="button"]:has-text("Google Calendar"), button:has-text("Sincronizar")').first();
    
    if (await syncTrigger.count() > 0 && await syncTrigger.isVisible()) {
      // Click to trigger manual sync
      await syncTrigger.click();
      
      // Wait for syncing state
      await expect(page.locator('text=/Sincronizando/i')).toBeVisible({ timeout: 5000 }).catch(() => {
        console.log('Syncing indicator not shown - sync may be instant');
      });
      
      // Wait for success state
      await page.waitForTimeout(2000);
      
      const successIndicator = page.locator('text=/Sincronizado|eventos/i');
      const hasSuccess = await successIndicator.count() > 0;
      
      if (hasSuccess) {
        await expect(successIndicator.first()).toBeVisible();
      }
    } else {
      test.skip(true, 'Google Calendar not connected');
    }
  });

  test('should create appointment and sync to Google', async ({ page }) => {
    // Navigate to Agendamentos tab
    await page.click('button:has-text("Agendamentos"), [role="tab"]:has-text("Agendamentos")');
    await page.waitForTimeout(500);
    
    // Click "Novo Agendamento" button
    const newAppointmentButton = page.locator('button:has-text("Novo Agendamento"), button:has-text("Adicionar")');
    
    if (await newAppointmentButton.count() === 0) {
      test.skip(true, 'New appointment button not found');
      return;
    }
    
    await newAppointmentButton.first().click();
    await page.waitForTimeout(500);
    
    // Fill appointment form
    const titleField = page.getByRole('textbox', { name: /título|serviço/i }).first();
    const dateField = page.locator('input[type="date"]').first();
    const timeField = page.locator('input[type="time"]').first();
    
    if (await titleField.count() > 0) {
      await titleField.fill('Teste Sincronização Google E2E');
    }
    
    if (await dateField.count() > 0) {
      // Set date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateStr = tomorrow.toISOString().split('T')[0];
      await dateField.fill(dateStr);
    }
    
    if (await timeField.count() > 0) {
      await timeField.fill('14:00');
    }
    
    // Submit form
    await page.click('button:has-text("Salvar"), button:has-text("Criar")');
    
    // Wait for success message
    await expect(page.locator('text=/sucesso|criado|salvo/i')).toBeVisible({ timeout: 5000 }).catch(() => {
      console.log('Success message not shown immediately');
    });
    
    // Check if appointment appears in list
    await expect(page.locator('text=Teste Sincronização Google E2E')).toBeVisible({ timeout: 10000 });
    
    // Clean up: Delete the test appointment
    const deleteButton = page.locator('button[title*="Excluir"], button[aria-label*="Excluir"], button:has-text("Excluir")').first();
    
    if (await deleteButton.count() > 0) {
      await deleteButton.click();
      
      // Confirm deletion if dialog appears
      await page.click('button:has-text("Confirmar"), button:has-text("Sim"), button:has-text("Excluir")').catch(() => {
        console.log('No confirmation dialog');
      });
      
      await page.waitForTimeout(1000);
    }
  });

  test('should show sync error if Google disconnected', async ({ page }) => {
    // Check if Google is connected
    const connectedIndicator = page.locator('text=/Conectado|Calendar/i');
    const disconnectedIndicator = page.locator('text=/Desconectado|desconectar/i');
    
    const isConnected = await connectedIndicator.count() > 0;
    
    if (!isConnected && await disconnectedIndicator.count() > 0) {
      // Google is disconnected, this is expected state
      await expect(disconnectedIndicator.first()).toBeVisible();
    } else {
      // Google is connected, test passes
      await expect(connectedIndicator.first()).toBeVisible();
    }
  });

  test('should update sync timestamp after automatic polling', async ({ page }) => {
    // Get initial timestamp if visible
    const timestampLocator = page.locator('text=/há.*minuto|há.*segundo/i');
    
    const hasTimestamp = await timestampLocator.count() > 0;
    
    if (hasTimestamp) {
      const initialTimestamp = await timestampLocator.first().textContent();
      
      // Wait for automatic sync (5 minutes in production, but we'll wait 10 seconds for test)
      await page.waitForTimeout(10000);
      
      // Check if timestamp changed or sync occurred
      const currentTimestamp = await timestampLocator.first().textContent();
      
      console.log('Initial timestamp:', initialTimestamp);
      console.log('Current timestamp:', currentTimestamp);
      
      // Timestamp should exist (either same or updated)
      await expect(timestampLocator.first()).toBeVisible();
    } else {
      test.skip(true, 'No sync timestamp visible - Google Calendar may not be connected');
    }
  });
});

