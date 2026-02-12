// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Locator, type Page} from '@playwright/test';
import {STANDARD_FIELD_LIBRARY_LABEL} from '../src/constants';

export class DataStudioPage {
    private readonly page: Page;
    private readonly libraryLink: Locator;

    public constructor(page: Page) {
        this.page = page;
        this.libraryLink = this.page.getByRole('link', {name: `file ${STANDARD_FIELD_LIBRARY_LABEL} (fr)`});
    }

    public async enterLibrary() {
        await this.libraryLink.click();
    }
}
