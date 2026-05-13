import {type Locator, type Page} from '@playwright/test';

export class ModalComponent {
    private readonly page: Page;
    public readonly modal: Locator;
    public readonly sidePanel: Locator;
    public constructor(page: Page) {
        this.page = page;
        this.modal = this.page.locator('form').filter({hasText: 'Vous pouvez personnaliser'});
        this.sidePanel = this.page.getByLabel('side-panel');
    }
}
