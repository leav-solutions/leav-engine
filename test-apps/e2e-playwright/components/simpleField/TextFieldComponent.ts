import {type Locator, type Page} from '@playwright/test';
import {STANDARD_FIELD_ATTRIBUTE_TEXT_ID, STANDARD_FIELD_ATTRIBUTE_TEXT_LABEL} from '../../src/constants';

export class TextFieldComponent {
    private readonly page: Page;
    public readonly field: Locator;
    private readonly deleteBtn: Locator;
    private readonly label: Locator;
    public constructor(page: Page) {
        this.page = page;
        this.field = this.page.getByRole('textbox', {name: STANDARD_FIELD_ATTRIBUTE_TEXT_LABEL});
        this.deleteBtn = this.page.locator(`#standardfield-${STANDARD_FIELD_ATTRIBUTE_TEXT_ID}`).getByRole('button');
        this.label = this.page
            .locator(`#standardfield-${STANDARD_FIELD_ATTRIBUTE_TEXT_ID}`)
            .getByText(STANDARD_FIELD_ATTRIBUTE_TEXT_LABEL);
    }

    public async fillText(text: string) {
        await this.field.fill(text);
        await this.label.click();
    }

    public async clear() {
        await this.label.click();
        await this.deleteBtn.click();
        await this.label.click();
    }

    public isSimpleTextSave(word: string) {
        return this.page.getByTitle(word);
    }
}
