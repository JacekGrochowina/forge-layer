import { defineConfig, devices } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { workspaceRoot } from '@nx/devkit';

// For CI, you may want to set BASE_URL to the deployed application.
const port = process.env['PLAYWRIGHT_PORT'] || '4200';
const serverURL = `http://localhost:${port}`;
const baseURL = process.env['BASE_URL'] || serverURL;

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import 'dotenv/config';

/**
 * See https://playwright.dev/docs/test-configuration.
 *
 * Generated as a .mts file so Node forces ESM regardless of workspace
 * `type`. Playwright routes `.mts` through its ESM loader (dynamic import,
 * bypassing the pirates CJS-compile path), and Nx's native TS strip loads
 * `.mts` directly. Playwright's configLoader auto-discovers
 * `playwright.config.mts` via its extension list
 * (.ts/.js/.mts/.mjs/.cts/.cjs).
 */
export default defineConfig({
  ...nxE2EPreset(import.meta.dirname, { testDir: './src' }),
  forbidOnly: !!process.env['CI'],
  // A failed test must fail CI even if it would pass on a retry.
  retries: 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: process.env['CI']
    ? [
        ['list'],
        [
          'html',
          {
            outputFolder: 'dist/.playwright/demo-e2e/playwright-report',
            open: 'never',
          },
        ],
      ]
    : 'list',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    baseURL,
    /* Keep diagnostics from the initial failure, without requiring a retry. */
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  /* Run your local dev server before starting the tests */
  webServer: {
    command: `npx nx run demo:serve --port=${port}`,
    url: serverURL,
    // Let Playwright own the server lifecycle, avoiding a second Nx serve task.
    reuseExistingServer: false,
    cwd: workspaceRoot,
  },
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

    // Uncomment for mobile browsers support
    /* {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    }, */

    // Uncomment for branded browsers
    /* {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    {
      name: 'Google Chrome',
      use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    } */
  ],
});
