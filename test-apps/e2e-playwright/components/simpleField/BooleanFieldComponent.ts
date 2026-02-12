// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Locator} from '@playwright/test';
import {STANDARD_FIELD_ATTRIBUTE_BOOLEAN_LABEL} from '../../src/constants';

export class BooleanFieldComponent {
    private readonly switchBtn: Locator;
    private readonly root: Locator;
    public constructor(root: Locator) {
        this.root = root;
        this.switchBtn = this.root.getByText(STANDARD_FIELD_ATTRIBUTE_BOOLEAN_LABEL);
    }

    public async toggleBoolean() {
        await this.switchBtn.click();
    }

    public async getValue(value: boolean) {
        return value ? 'Oui' : 'Non';
    }
}
