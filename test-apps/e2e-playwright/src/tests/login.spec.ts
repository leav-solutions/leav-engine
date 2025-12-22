import {test, expect} from '@playwright/test';
import config from '../../config';

test.describe('Login', () => {
    /**
     * GIVEN xStream app is setup
     * AND we create a campaign
     * AND we create an offer
     * WHEN we create creatives
     * THEN a creative should be created and displayed
     */
    test('Login, access portal', async ({page}) => {
        await page.goto(config.baseUrl);

        expect(page.url()).toContain(`${config.baseUrl}/app/login`);

        await page.getByLabel('Identifiant').fill(config.auth.user);
        await page.getByLabel('Mot de passe').fill(config.auth.password);
        await page.getByRole('button', {name: 'Se connecter'}).click();

        // Wait for navigation to portal
        await page.waitForURL(`${config.baseUrl}/app/portal`);

        expect(page.url()).toContain(`${config.baseUrl}/app/portal`);
    });
});
