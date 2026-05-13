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
        this.field = this.page.getByRole('combobox', {name: STANDARD_FIELD_ATTRIBUTE_DROPDOWN_LABEL});
        this.option = this.page.getByText(STANDARD_FIELD_ATTRIBUTE_DROPDOWN_OPTION_1).nth(1);
        this.label = this.root.getByText(STANDARD_FIELD_ATTRIBUTE_DROPDOWN_LABEL, {exact: true});
        this.deleteBtn = this.page.getByTestId(STANDARD_FIELD_ATTRIBUTE_DROPDOWN_ID).getByLabel('clear');
    }

    public async select() {
        await this.field.click();
        await this.option.click();
    }

    public async clear() {
        await this.deleteBtn.click();
        await this.label.click();
    }

    public isValueSave(word: string) {
        return this.page.getByTitle(word);
    }
}
