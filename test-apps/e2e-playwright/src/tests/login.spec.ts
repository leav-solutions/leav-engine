// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {test, expect} from '@playwright/test';
import config from '../config';
import {AccessPortalPage} from '../../pages/AccessPortalPage';

test.describe('Login', () => {
    test('Login, access portal', async ({page}) => {
        await page.goto(config.baseUrl);

        expect(page.url()).toContain(`${config.baseUrl}/app/login`);

        const accessPortalPage = new AccessPortalPage(page);

        accessPortalPage.login({id: config.auth.username, password: config.auth.password});

        await expect(accessPortalPage.pageTitle).toBeVisible();
    });
});
