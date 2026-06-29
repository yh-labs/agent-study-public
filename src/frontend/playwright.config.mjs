import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 15000,
  use: {
    baseURL: 'http://localhost:3000',
  },
  projects: [
    {
      name: 'webkit',
      use: {
        ...devices['iPhone 14'],
      },
    },
  ],
});
