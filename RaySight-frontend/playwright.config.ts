import { defineConfig, type Project } from '@playwright/test';

const baseURL = process.env.VAD_E2E_BASE_URL ?? 'http://127.0.0.1:5173';

const browserProjects: Array<Pick<Project, 'name' | 'use'>> = [
  {
    name: 'chromium-desktop',
    use: { browserName: 'chromium', viewport: { width: 1440, height: 900 }, hasTouch: false },
  },
  {
    name: 'chromium-tablet',
    use: { browserName: 'chromium', viewport: { width: 768, height: 1024 }, hasTouch: true },
  },
  {
    name: 'chromium-mobile',
    use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, hasTouch: true },
  },
  {
    name: 'firefox-desktop',
    use: {
      browserName: 'firefox',
      viewport: { width: 1440, height: 900 },
      hasTouch: false,
      video: 'off',
      firefoxUserPrefs: {
        'gfx.webrender.force-disabled': true,
        'gfx.webrender.software': false,
        'gfx.webrender.software.opengl': false,
        'gfx.x11-egl.force-disabled': true,
        'layers.acceleration.disabled': true,
      },
    },
  },
  {
    name: 'firefox-tablet',
    use: {
      browserName: 'firefox',
      viewport: { width: 768, height: 1024 },
      hasTouch: true,
      video: 'off',
      firefoxUserPrefs: {
        'gfx.webrender.force-disabled': true,
        'gfx.webrender.software': false,
        'gfx.webrender.software.opengl': false,
        'gfx.x11-egl.force-disabled': true,
        'layers.acceleration.disabled': true,
      },
    },
  },
  {
    name: 'firefox-mobile',
    use: {
      browserName: 'firefox',
      viewport: { width: 390, height: 844 },
      hasTouch: true,
      video: 'off',
      firefoxUserPrefs: {
        'gfx.webrender.force-disabled': true,
        'gfx.webrender.software': false,
        'gfx.webrender.software.opengl': false,
        'gfx.x11-egl.force-disabled': true,
        'layers.acceleration.disabled': true,
      },
    },
  },
  {
    name: 'webkit-desktop',
    use: { browserName: 'webkit', viewport: { width: 1440, height: 900 }, hasTouch: false },
  },
  {
    name: 'webkit-tablet',
    use: { browserName: 'webkit', viewport: { width: 768, height: 1024 }, hasTouch: true },
  },
  {
    name: 'webkit-mobile',
    use: { browserName: 'webkit', viewport: { width: 390, height: 844 }, hasTouch: true },
  },
];

export default defineConfig({
  testDir: './e2e',
  outputDir: './test-results/playwright-artifacts',
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  // One browser context at a time keeps Firefox/WebKit GPU emulation stable on
  // Windows and makes the 100-drop evidence deterministic.
  workers: 1,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  reporter: [
    ['list'],
    ['json', { outputFile: './test-results/playwright-results.json' }],
    ['html', { outputFolder: './playwright-report', open: 'never' }],
  ],
  use: {
    baseURL,
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: browserProjects,
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 5173',
    url: baseURL,
    // Gate evidence must own the exact preview process it tests. Reusing an
    // unrelated/stale port produced false connection-refused failures.
    reuseExistingServer: false,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
