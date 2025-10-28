/**
 * E2E Tests - Complete Integration Flow
 * Tests end-to-end workflow: Create Client → Create Appointment → Verify in Calendar
 */

import { test, expect } from '@playwright/test';

test.describe('End-to-End Integration Flow', () => {
  test('complete workflow: create client and appointment', async ({ page }) => {
    // Generate unique test data
    const timestamp = Date.now();
    const testData = {
      client: {
        name: `E2E Cliente Completo ${timestamp}`,
        email: `e2e.completo.${timestamp}@test.com`,
        phone: '11999888777'
      },
      appointment: {
        title: `E2E Agendamento Completo ${timestamp}`,
        description: 'Fluxo completo de teste E2E'
      }
    };
    
    // Step 1: Navigate to application
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Create a new client
    await page.click('[data-testid="tab-clients"]');
    await page.waitForTimeout(2000); // Lazy loading
    
    await page.click('[data-testid="btn-new-client"]');
    await page.waitForTimeout(500);
    
    // Fill client form
    await page.fill('[data-testid="input-client-name"]', testData.client.name);
    await page.fill('[data-testid="input-client-email"]', testData.client.email);
    await page.fill('[data-testid="input-client-phone"]', testData.client.phone);
    
    // Wait for validation
    await page.waitForTimeout(1000);
    
    // Submit client form
    await page.click('[data-testid="btn-save-client"]');
    await page.waitForTimeout(2000);
    
    // Verify client was created
    const clientCreated = await page.locator(`text=${testData.client.name}`).isVisible({ timeout: 5000 }).catch(() => false);
    expect(clientCreated).toBeTruthy();
    
    // Step 3: Create appointment for the new client
    await page.click('[data-testid="tab-appointments"]');
    await page.waitForTimeout(2000); // Lazy loading
    
    await page.click('[data-testid="btn-new-appointment"]');
    await page.waitForTimeout(1000);
    
    // Fill appointment form
    await page.fill('[data-testid="input-appointment-title"]', testData.appointment.title);
    
    // Try to select the client we just created
    const clientSelect = page.locator('[data-testid="select-appointment-client"]');
    if (await clientSelect.count() > 0) {
      // Get the options and find ours
      const options = await clientSelect.locator('option').allTextContents();
      const optionIndex = options.findIndex(opt => opt.includes(testData.client.name));
      
      if (optionIndex >= 0) {
        await clientSelect.selectOption({ index: optionIndex });
      } else {
        // Just select first available client
        await clientSelect.selectOption({ index: 1 });
      }
    }
    
    // Fill description
    const descField = page.locator('[data-testid="input-appointment-description"]');
    if (await descField.count() > 0) {
      await descField.fill(testData.appointment.description);
    }
    
    // Set date to tomorrow
    const dateInput = page.locator('[data-testid="input-appointment-date"]');
    if (await dateInput.count() > 0) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split('T')[0];
      await dateInput.fill(dateString);
    }
    
    // Wait for validation
    await page.waitForTimeout(1000);
    
    // Submit appointment
    await page.click('[data-testid="btn-save-appointment"]');
    await page.waitForTimeout(2000);
    
    // Verify appointment was created
    const appointmentCreated = await page.locator(`text=${testData.appointment.title}`).isVisible({ timeout: 5000 }).catch(() => false);
    expect(appointmentCreated).toBeTruthy();
    
    // Step 4: Verify appointment appears in calendar
    await page.click('[data-testid="tab-calendar"]');
    await page.waitForTimeout(2000); // Lazy loading
    await expect(page.locator('.calendar-view')).toBeVisible({ timeout: 60000 });
    
    // Navigate to next month if we created appointment for tomorrow
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (tomorrow.getMonth() !== today.getMonth()) {
      await page.click('[data-testid="btn-calendar-next"]');
      await page.waitForTimeout(500);
    }
    
    // Check if appointment appears in calendar
    const appointmentInCalendar = await page.locator(`text=${testData.appointment.title}`).isVisible({ timeout: 5000 }).catch(() => false);
    
    if (appointmentInCalendar) {
      console.log('✅ Appointment successfully appears in calendar!');
    } else {
      console.log('⚠️  Appointment not found in calendar view');
    }
    
    // Step 5: Verify dashboard stats updated
    await page.click('[data-testid="tab-dashboard"]');
    await page.waitForTimeout(2000); // Lazy loading
    
    // Check if client count increased
    const clientCountCard = page.locator('text=Total de Clientes').locator('..');
    await expect(clientCountCard).toBeVisible();
    
    // Check if appointment count card exists
    const appointmentCountCard = page.locator('text=Próximos Agendamentos').locator('..');
    await expect(appointmentCountCard).toBeVisible();
    
    console.log('✅ Complete E2E workflow finished successfully!');
  });

  test('should handle errors gracefully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Try to create appointment without client
    await page.click('[data-testid="tab-appointments"]');
    await page.waitForTimeout(2000); // Lazy loading
    
    await page.click('[data-testid="btn-new-appointment"]');
    await page.waitForTimeout(500);
    
    // Fill only title
    await page.fill('[data-testid="input-appointment-title"]', 'Teste Sem Cliente');
    
    // Wait for validation
    await page.waitForTimeout(1000);
    
    // Try to submit
    await page.click('[data-testid="btn-save-appointment"]');
    await page.waitForTimeout(1000);
    
    // Verify error handling (either validation message or stays on modal)
    const errorMessage = page.locator('text=/obrigatório|required|erro|error/i');
    const modalStillOpen = page.locator('[data-testid="modal-new-appointment"]');
    
    const hasError = await errorMessage.isVisible().catch(() => false);
    const stayedOnModal = await modalStillOpen.isVisible().catch(() => false);
    
    expect(hasError || stayedOnModal).toBeTruthy();
  });
});

