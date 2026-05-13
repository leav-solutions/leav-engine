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
