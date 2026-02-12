// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Locator, type Page} from '@playwright/test';

export class PortalPage {
    private readonly page: Page;
    private readonly connectionBtn: Locator;
    private readonly idInput: Locator;
    private readonly passwordInput: Locator;
    public readonly pageTitle: Locator;
    public readonly dataStudioTitle: Locator;

    public constructor(page: Page) {
        this.page = page;
        this.connectionBtn = this.page.getByRole('button', {name: 'Se connecter'});
        this.idInput = this.page.getByLabel('Identifiant');
        this.passwordInput = this.page.getByLabel('Mot de passe');
        this.pageTitle = this.page.getByRole('heading', {name: 'app-studio (fr)'});
        this.dataStudioTitle = this.page.getByText('Data Studio');
    }

    public async login({id, password}: {id: string; password: string}) {
        await this.idInput.fill(id);
        await this.passwordInput.fill(password);
        await this.connectionBtn.click();
    }

    public async accessDataStudio() {
        await this.dataStudioTitle.click();
    }
}
