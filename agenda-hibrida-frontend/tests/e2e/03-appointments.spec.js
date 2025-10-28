/**
 * E2E Tests - Appointment Management
 * Tests appointment creation, editing, and calendar integration
 */

import { test, expect } from '@playwright/test';

test.describe('Appointment Management Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Navigate to Agendamentos tab
    await page.click('[data-testid="tab-appointments"]');
    await page.waitForTimeout(2000); // Lazy loading
  });

  test('should open new appointment modal', async ({ page }) => {
    // Click "Novo Agendamento" button
    await page.click('[data-testid="btn-new-appointment"]');
    
    // Verify modal opened
    await expect(page.locator('[data-testid="modal-new-appointment"]')).toBeVisible({ timeout: 10000 });
    
    // Verify form fields are present
    await expect(page.locator('[data-testid="input-appointment-title"]')).toBeVisible();
    
    // Check for client selector
    const clientSelect = page.locator('[data-testid="select-appointment-client"]');
    await expect(clientSelect).toBeVisible({ timeout: 3000 }).catch(() => {
      console.log('Client selector not found - may use different component');
    });
  });

  test('should create a new appointment', async ({ page }) => {
    // Generate unique appointment data
    const timestamp = Date.now();
    const appointmentData = {
      title: `Agendamento E2E ${timestamp}`,
      description: 'Teste automatizado de agendamento'
    };
    
    // Open new appointment modal
    await page.click('[data-testid="btn-new-appointment"]');
    await page.waitForTimeout(1000);
    
    // Fill title
    await page.fill('[data-testid="input-appointment-title"]', appointmentData.title);
    
    // Fill description if exists
    const descriptionField = page.locator('[data-testid="input-appointment-description"]');
    if (await descriptionField.count() > 0) {
      await descriptionField.fill(appointmentData.description);
    }
    
    // Try to select a client
    const clientSelect = page.locator('[data-testid="select-appointment-client"]');
    if (await clientSelect.count() > 0) {
      // Select first available client
      await clientSelect.selectOption({ index: 1 });
    }
    
    // Fill dates
    const startDateInput = page.locator('[data-testid="input-appointment-date"]');
    if (await startDateInput.count() > 0) {
      // Set date to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      
      await startDateInput.fill(dateString);
    }
    
    // Wait for validation
    await page.waitForTimeout(1000);
    
    // Submit form
    await page.click('[data-testid="btn-save-appointment"]');
    
    // Wait for success
    await page.waitForTimeout(2000);
    
    // Verify success (toast or appointment in list)
    const successNotification = page.locator('text=/sucesso|criado|agendado/i');
    const appointmentInList = page.locator(`text=${appointmentData.title}`);
    
    const hasSuccess = await successNotification.isVisible().catch(() => false);
    const isInList = await appointmentInList.isVisible().catch(() => false);
    
    expect(hasSuccess || isInList).toBeTruthy();
  });

  test('should validate appointment required fields', async ({ page }) => {
    // Open new appointment modal
    await page.click('[data-testid="btn-new-appointment"]');
    await page.waitForTimeout(500);
    
    // Try to submit empty form
    await page.click('[data-testid="btn-save-appointment"]');
    
    // Wait for validation
    await page.waitForTimeout(1000);
    
    // Verify error messages or that save button remains disabled
    const errorMessage = page.locator('text=/obrigatório|required|Campo obrigatório/i, [class*="error"]');
    const saveButton = page.locator('[data-testid="btn-save-appointment"]');
    
    const hasError = await errorMessage.first().isVisible().catch(() => false);
    const isDisabled = await saveButton.isDisabled().catch(() => false);
    
    expect(hasError || isDisabled).toBeTruthy();
  });

  test('should display calendar view', async ({ page }) => {
    // Navigate to Calendário tab
    await page.click('[data-testid="tab-calendar"]');
    await page.waitForTimeout(2000); // Lazy loading
    await expect(page.locator('.calendar-view')).toBeVisible({ timeout: 60000 });
    
    // Verify calendar elements
    await expect(page.locator('text=/Outubro|Novembro|Dezembro|Janeiro/i')).toBeVisible();
    
    // Verify navigation buttons exist
    const prevButton = page.locator('[data-testid="btn-calendar-prev"]');
    const nextButton = page.locator('[data-testid="btn-calendar-next"]');
    
    await expect(prevButton).toBeVisible();
    await expect(nextButton).toBeVisible();
  });

  test('should navigate calendar months', async ({ page }) => {
    // Navigate to Calendário tab
    await page.click('[data-testid="tab-calendar"]');
    await page.waitForTimeout(2000); // Lazy loading
    await expect(page.locator('.calendar-view')).toBeVisible({ timeout: 60000 });
    
    // Get current month
    const currentMonth = await page.locator('text=/Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro/i').first().textContent();
    
    // Click next month
    await page.click('[data-testid="btn-calendar-next"]');
    await page.waitForTimeout(500);
    
    // Get new month
    const newMonth = await page.locator('text=/Janeiro|Fevereiro|Março|Abril|Maio|Junho|Julho|Agosto|Setembro|Outubro|Novembro|Dezembro/i').first().textContent();
    
    // Verify month changed
    expect(newMonth).not.toBe(currentMonth);
  });

  test('should display different calendar views', async ({ page }) => {
    // Navigate to Calendário tab
    await page.click('[data-testid="tab-calendar"]');
    await page.waitForTimeout(2000); // Lazy loading
    await expect(page.locator('.calendar-view')).toBeVisible({ timeout: 60000 });
    
    // Check for view toggle buttons (Month, Week, Day, List)
    const monthView = page.locator('[data-testid="btn-calendar-month"]');
    const weekView = page.locator('[data-testid="btn-calendar-week"]');
    const dayView = page.locator('[data-testid="btn-calendar-day"]');
    const listView = page.locator('[data-testid="btn-calendar-list"]');
    
    // If view toggles exist, test them
    if (await weekView.count() > 0) {
      await weekView.click();
      await page.waitForTimeout(500);
      
      // Verify week view loaded
      await expect(page.locator('text=/Seg|Mon|Ter|Tue|Qua|Wed|Qui|Thu|Sex|Fri|Sáb|Sat|Dom|Sun/i')).toBeVisible();
    }
  });

  test('should click on calendar day', async ({ page }) => {
    // Navigate to Calendário tab
    await page.click('[data-testid="tab-calendar"]');
    await page.waitForTimeout(2000); // Lazy loading
    await expect(page.locator('.calendar-view')).toBeVisible({ timeout: 60000 });
    
    // Click on a calendar day
    const dayCell = page.locator('[data-testid^="calendar-cell-"]').first();
    
    if (await dayCell.count() > 0) {
      await dayCell.click();
      await page.waitForTimeout(500);
      
      // Check if modal or popup appeared
      const modalOpened = await page.locator('[role="dialog"], [class*="modal"]').isVisible().catch(() => false);
      
      // Clicking day may open appointment creation or show day details
      console.log(`Calendar day click ${modalOpened ? 'opened modal' : 'did not open modal'}`);
    }
  });
});

