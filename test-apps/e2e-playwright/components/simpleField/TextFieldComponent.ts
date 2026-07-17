import {type Locator, type Page} from '@playwright/test';
import {STANDARD_FIELD_ATTRIBUTE_TEXT_ID, STANDARD_FIELD_ATTRIBUTE_TEXT_LABEL} from '../../src/constants';

export class TextFieldComponent {
    private readonly page: Page;
    public readonly field: Locator;
    private readonly deleteBtn: Locator;
    private readonly label: Locator;
    public constructor(page: Page) {
        this.page = page;
        // Anchor on the `#standardfield-<attributeId>` wrapper: in the edition popup the label is not
        // linked to the input, so role-based accessible names are unreliable there.
        this.field = this.page.locator(`#standardfield-${STANDARD_FIELD_ATTRIBUTE_TEXT_ID}`).locator('input');
        // DS clear icons are FontAwesome svgs carrying `aria-label="clear"`.
        this.deleteBtn = this.page.locator(`#standardfield-${STANDARD_FIELD_ATTRIBUTE_TEXT_ID}`).getByLabel('clear');
        this.label = this.page
            .locator(`#standardfield-${STANDARD_FIELD_ATTRIBUTE_TEXT_ID}`)
            .getByText(STANDARD_FIELD_ATTRIBUTE_TEXT_LABEL);
    }

    public async fillText(text: string) {
        await this.field.fill(text);
        await this.label.click();
    }

    public async clear() {
        // The clear icon (antd allowClear) is only rendered while the input is hovered or focused.
        await this.field.hover();
        await this.deleteBtn.click();
        await this.label.click();
    }

    public isSimpleTextSave(word: string) {
        return this.page.getByTitle(word);
    }
}
