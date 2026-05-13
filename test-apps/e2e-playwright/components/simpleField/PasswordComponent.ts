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
