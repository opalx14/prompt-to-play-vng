import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './capture',
  fullyParallel: false,
  workers: 1,
  timeout: 120_000,
  reporter: 'list',
  outputDir: '.capture-results',
  use: {
    baseURL: 'http://127.0.0.1:3999',
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 1000 },
    video: 'on',
  },
  webServer: {
    command: 'pnpm exec next dev -p 3999',
    url: 'http://127.0.0.1:3999',
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
