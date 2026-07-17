import {type Locator, type Page} from '@playwright/test';
import {STANDARD_FIELD_LIBRARY_LABEL} from '../src/constants';

export class ExplorerStudioPage {
    private readonly page: Page;
    // Workspaces are auto-populated by the core for every library (`<libraryId>_workspace`),
    // titled with the library label, and listed in the left-side navigation menu.
    private readonly libraryWorkspaceMenuItem: Locator;

    public constructor(page: Page) {
        this.page = page;
        this.libraryWorkspaceMenuItem = this.page.getByText(`${STANDARD_FIELD_LIBRARY_LABEL} (fr)`);
    }

    public async enterLibraryWorkspace() {
        await this.libraryWorkspaceMenuItem.click();
    }
}
