import {type Locator, type Page} from '@playwright/test';

export class PortalPage {
    private readonly page: Page;
    private readonly connectionBtn: Locator;
    private readonly idInput: Locator;
    private readonly passwordInput: Locator;
    public readonly pageTitle: Locator;
    // System application created by the core migrations (label fr: « Explorateur Studio »).
    public readonly explorerStudioTitle: Locator;

    public constructor(page: Page) {
        this.page = page;
        this.connectionBtn = this.page.getByRole('button', {name: 'Se connecter'});
        this.idInput = this.page.getByLabel('Identifiant');
        this.passwordInput = this.page.getByLabel('Mot de passe');
        this.pageTitle = this.page.getByRole('heading', {name: 'app-studio (fr)'});
        this.explorerStudioTitle = this.page.getByText('Explorateur Studio');
    }

    public async login({id, password}: {id: string; password: string}) {
        await this.idInput.fill(id);
        await this.passwordInput.fill(password);
        await this.connectionBtn.click();
    }

    public async accessExplorerStudio() {
        await this.explorerStudioTitle.click();
    }
}
