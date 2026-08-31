import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 45_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:4200',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: [
    {
      command: 'node e2e/start-api.mjs',
      url: 'http://localhost:5047/health',
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: 'npm start -- --host localhost --port 4200',
      url: 'http://localhost:4200/login',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'desktop-chromium',
      grepInvert: /@mobile/,
      use: {
        browserName: 'chromium',
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile-chromium',
      grep: /@mobile/,
      use: {
        browserName: 'chromium',
        viewport: { width: 360, height: 800 },
      },
    },
  ],
});
