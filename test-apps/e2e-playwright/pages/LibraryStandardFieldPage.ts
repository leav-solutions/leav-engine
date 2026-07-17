import {expect, type Locator, type Page} from '@playwright/test';
import {TextFieldComponent} from '../components/simpleField/TextFieldComponent';
import {ModalComponent} from '../components/ModalComponent';
import {BooleanFieldComponent} from '../components/simpleField/BooleanFieldComponent';
import {DateFieldComponent} from '../components/simpleField/DateFieldComponent';
import {DateRangeComponent} from '../components/simpleField/DateRangeComponent';
import {ColorComponent} from '../components/simpleField/ColorComponent';
import {PasswordComponent} from '../components/simpleField/PasswordComponent';
import {RichTextComponent} from '../components/simpleField/RichTextComponent';
import {DropdownComponent} from '../components/simpleField/DropdownComponent';

export class LibraryStandardFieldPage {
    private readonly page: Page;
    public readonly createBtn: Locator;
    public simpleTextComponent: TextFieldComponent;
    public modal: ModalComponent;
    public booleanSwitch: BooleanFieldComponent;
    public dateComponent: DateFieldComponent;
    public dateRangeComponent: DateRangeComponent;
    public colorComponent: ColorComponent;
    public passwordComponent: PasswordComponent;
    public richTextComponent: RichTextComponent;
    public dropdownComponent: DropdownComponent;

    public constructor(page: Page) {
        this.page = page;
        // In explorer-studio, app-studio always passes `hideFirstActionLabel` to the Explorer,
        // so the create primary action is an icon-only "+" button (no « Créer » text).
        // KitButton renders a plain <button> with literal `kit-btn-*` classes (not an antd button).
        this.createBtn = this.page
            .locator('button.kit-btn-primary')
            .filter({has: this.page.locator('svg[data-icon="plus"]')});
        this.simpleTextComponent = new TextFieldComponent(this.page);
        this.modal = new ModalComponent(this.page);
        this.booleanSwitch = new BooleanFieldComponent(this.modal.modal);
        this.dateComponent = new DateFieldComponent(this.page, this.modal.modal);
        this.dateRangeComponent = new DateRangeComponent(this.page);
        this.colorComponent = new ColorComponent(this.page);
        this.passwordComponent = new PasswordComponent(this.page);
        this.richTextComponent = new RichTextComponent(this.page);
        this.dropdownComponent = new DropdownComponent(this.page, this.modal.modal);
    }

    public async openCreationModal() {
        await expect(this.createBtn).toBeVisible({
            timeout: 1000000,
        });
        await this.createBtn.click();
    }

    public async accessObjectForm(label: string) {
        await this.page.getByText(label).click();
    }

    public async doesBooleanHaveValue(value: boolean) {
        const booleanValue = await this.booleanSwitch.getValue(value);
        return this.modal.sidePanel.getByText(booleanValue);
    }
}
