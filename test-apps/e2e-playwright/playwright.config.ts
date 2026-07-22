import {defineConfig, devices} from '@playwright/test';
import baseConfig from './src/config';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
    testDir: './src/tests',
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : 2,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html',
    /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
    // globalSetup: 'global-setup.ts',
    use: {
        /* Base URL to use in actions like `await page.goto('/')`. */
        baseURL: baseConfig.baseUrl,

        /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
        trace: 'on-first-retry',
        locale: 'fr-FR',
        timezoneId: 'Europe/Paris',
        headless: !!process.env.CI,
    },

    /* Configure projects for major browsers */
    projects: [
        {
            name: 'setup leav',
            testMatch: /global\.setup\.ts/,
            teardown: 'cleanup leav',
        },
        {
            name: 'cleanup leav',
            testMatch: /global\.teardown\.ts/,
        },
        {
            name: 'auth-setup',
            testMatch: /auth\.setup\.ts/,
            use: {...devices['Desktop Chrome']},
        },
        {
            name: 'tests',
            use: {
                ...devices['Desktop Chrome'],
                storageState: 'storage/.auth/user.json',
            },
            dependencies: ['setup leav', 'auth-setup'],
        },
    ],
});
