import {expect, type Locator, type Page} from '@playwright/test';
import {STANDARD_FIELD_ATTRIBUTE_COLOR_ID} from '../../src/constants';

export class ColorComponent {
    private readonly page: Page;
    private readonly field: Locator;
    private readonly palette: Locator;
    private readonly deleteBtn: Locator;
    public constructor(page: Page) {
        this.page = page;
        this.field = this.page.getByTestId(STANDARD_FIELD_ATTRIBUTE_COLOR_ID);
        this.palette = this.page.locator('.ant-color-picker-saturation');
        this.deleteBtn = this.page.getByTestId(STANDARD_FIELD_ATTRIBUTE_COLOR_ID).getByLabel('clear');
    }

    public async selectColor() {
        await expect(this.field).toBeVisible();
        await this.field.click();
        await expect(this.palette).toBeVisible();
        await this.palette.click();
        await expect(this.field).toBeVisible();
        await this.field.click();
    }

    public async clear() {
        await this.field.click();
        await this.deleteBtn.click();
    }

    public isColorSave(color: string) {
        return this.page.getByTitle(color);
    }
}
