import {test as setup, expect} from '@playwright/test';
import config from '../config';
import {PortalPage} from '../../pages/PortalPage';

const authFile = 'storage/.auth/user.json';

// Log in once and persist the session; every test reuses it via `storageState`.
setup('authenticate', async ({page}) => {
    await page.goto(config.baseUrl);
    await page.waitForLoadState('networkidle');

    const portalPage = new PortalPage(page);
    await portalPage.login({id: config.auth.username, password: config.auth.password});

    // Login succeeded once we've been redirected away from the login page. Don't assert on a
    // specific app tile: auth-setup runs in parallel with the DB setup.
    await expect(page).not.toHaveURL(/\/app\/login/);

    await page.context().storageState({path: authFile});
});
