// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {test, expect} from '@playwright/test';
import config from '../config';

test.describe('Login', () => {
    test('Login, access portal', async ({page}) => {
        await page.goto(config.baseUrl);

        expect(page.url()).toContain(`${config.baseUrl}/app/login`);

        await page.getByLabel('Identifiant').fill(config.auth.username);
        await page.getByLabel('Mot de passe').fill(config.auth.password);
        await page.getByRole('button', {name: 'Se connecter'}).click();

        // Wait for navigation to portal
        await page.waitForURL(/\/app\/portal/);

        expect(page.url()).toContain(`${config.baseUrl}/app/portal`);

        await page.getByRole('heading', {name: 'app-studio (fr)'}).isVisible();
    });
});
