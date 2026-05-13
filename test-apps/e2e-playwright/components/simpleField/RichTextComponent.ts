import {type Locator, type Page} from '@playwright/test';
import {STANDARD_FIELD_ATTRIBUTE_RICH_TEXT_ID, STANDARD_FIELD_ATTRIBUTE_RICH_TEXT_LABEL} from '../../src/constants';

export class RichTextComponent {
    private readonly page: Page;
    private readonly field: Locator;
    private readonly label: Locator;
    private readonly collapseMenu: Locator;
    private readonly boldFont: Locator;
    public constructor(page: Page) {
        this.page = page;
        this.field = this.page.locator(`#standardfield-${STANDARD_FIELD_ATTRIBUTE_RICH_TEXT_ID}`).getByRole('textbox');
        this.label = this.page.getByLabel(STANDARD_FIELD_ATTRIBUTE_RICH_TEXT_LABEL);
        this.collapseMenu = this.page.getByRole('button', {name: 'Plus d’options'});
        this.boldFont = this.page.getByRole('tooltip', {name: 'Gras Italique Souligner'}).getByLabel('Gras');
    }

    public async writeTextInBold(text: string) {
        await this.field.click();
        await this.collapseMenu.click();
        await this.boldFont.click();
        await this.field.fill(text);
        await this.label.click();
    }

    public isValueSave(word: string) {
        return this.page.getByTitle(word);
    }
}
