/**
 * Playwright E2E Test Configuration
 * @see https://playwright.dev/docs/test-configuration
 */

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  
  /* Maximum time one test can run for - otimizado para CI */
  timeout: 45 * 1000,
  
  /* Test artifacts */
  fullyParallel: true, // Habilitar paralelização para performance
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  
  /* Reporter to use */
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
    ['json', { outputFile: 'test-results.json' }]
  ],
  
  /* Shared settings for all tests */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:5173',
    
    /* Screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video on failure */
    video: 'retain-on-failure',
    
    /* Collect trace when retrying the failed test */
    trace: 'retain-on-failure',
    
    /* Timeouts otimizados para CI */
    actionTimeout: 10 * 1000,
    navigationTimeout: 20 * 1000,
  },
  
  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    
    /* Mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
    
    /* Tablet viewport */
    {
      name: 'Tablet',
      use: { ...devices['iPad Pro'] },
    },
  ],
  
  /* Run both backend and frontend servers before starting tests */
  webServer: [
    {
      command: 'cd ../agenda-hibrida-v2 && npm start',
      url: 'http://localhost:3001/health', // Health check endpoint correto
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe'
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:5173', // Health check frontend
      timeout: 180 * 1000, // 3 minutos para o Vite dev server iniciar no CI
      reuseExistingServer: !process.env.CI,
      stdout: 'pipe',
      stderr: 'pipe'
    }
  ],
});

