// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Page, type Locator} from '@playwright/test';
import {STANDARD_FIELD_ATTRIBUTE_PASSWORD_ID, STANDARD_FIELD_ATTRIBUTE_PASSWORD_LABEL} from '../../src/constants';

export class PasswordComponent {
    private readonly page: Page;
    private label: Locator;
    public constructor(page: Page) {
        this.page = page;
        this.label = this.page
            .locator(`#standardfield-${STANDARD_FIELD_ATTRIBUTE_PASSWORD_ID}`)
            .getByText(STANDARD_FIELD_ATTRIBUTE_PASSWORD_LABEL);
    }

    public async udpdate(text: string) {
        await this.label.fill(text);
        await this.label.click();
    }
}
