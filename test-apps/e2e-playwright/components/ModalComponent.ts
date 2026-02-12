// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
