import {type Locator, type Page} from '@playwright/test';
import {
    STANDARD_FIELD_ATTRIBUTE_DROPDOWN_ID,
    STANDARD_FIELD_ATTRIBUTE_DROPDOWN_LABEL,
    STANDARD_FIELD_ATTRIBUTE_DROPDOWN_OPTION_1,
} from '../../src/constants';

export class DropdownComponent {
    private readonly page: Page;
    private readonly root: Locator;
    public readonly field: Locator;
    private readonly option: Locator;
    private readonly label: Locator;
    private readonly deleteBtn: Locator;
    public constructor(page: Page, root: Locator) {
        this.page = page;
        this.root = root;
        // Anchor on the `#standardfield-<attributeId>` wrapper: in the edition popup the label is not
        // linked to the select, so role-based accessible names are unreliable there.
        // The select inner search input is invisible while unfocused, so target the visible
        // `.ant-select` container for pointer interactions.
        this.field = this.page.locator(`#standardfield-${STANDARD_FIELD_ATTRIBUTE_DROPDOWN_ID}`).locator('.ant-select');
        this.option = this.page.getByText(STANDARD_FIELD_ATTRIBUTE_DROPDOWN_OPTION_1).nth(1);
        this.label = this.root.getByText(STANDARD_FIELD_ATTRIBUTE_DROPDOWN_LABEL, {exact: true});
        // DS clear icons are FontAwesome svgs carrying `aria-label="clear"`.
        this.deleteBtn = this.page
            .locator(`#standardfield-${STANDARD_FIELD_ATTRIBUTE_DROPDOWN_ID}`)
            .getByLabel('clear');
    }

    public async select() {
        await this.field.click();
        await this.option.click();
    }

    public async clear() {
        // The clear icon (antd allowClear) is only rendered while the select is hovered.
        await this.field.hover();
        await this.deleteBtn.click();
        await this.label.click();
    }

    public isValueSave(word: string) {
        return this.page.getByTitle(word);
    }
}
