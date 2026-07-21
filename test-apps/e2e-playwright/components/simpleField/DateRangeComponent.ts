import {type Locator, type Page} from '@playwright/test';
import {type Year, type Month, type Day} from './_types';
import {STANDARD_FIELD_ATTRIBUTE_DATE_RANGE_ID} from '../../src/constants';

export class DateRangeComponent {
    private readonly page: Page;
    public readonly field: Locator;
    private readonly deleteBtn: Locator;
    private readonly yearField: Locator;
    private readonly decadeField: Locator;
    public constructor(page: Page) {
        this.page = page;
        // Anchor on the `#standardfield-<attributeId>` wrapper: in the edition popup the label is not
        // linked to the input, so role-based accessible names are unreliable there. The range picker
        // holds two inputs (from/to); the first one carries the value used by the scenario.
        this.field = this.page
            .locator(`#standardfield-${STANDARD_FIELD_ATTRIBUTE_DATE_RANGE_ID}`)
            .locator('input')
            .first();
        // DS clear icons are FontAwesome svgs carrying `aria-label="clear"`.
        this.deleteBtn = this.page
            .locator(`#standardfield-${STANDARD_FIELD_ATTRIBUTE_DATE_RANGE_ID}`)
            .getByLabel('clear');
        this.yearField = this.page.getByRole('button', {name: 'Choisissez une année'}).first();
        this.decadeField = this.page.getByRole('button', {name: 'Choisissez une décennie'});
    }

    private getDecade(decade: string) {
        return this.page.getByText(decade);
    }

    private getYear(year: string) {
        return this.page.getByText(year);
    }

    private getMonth(month: string) {
        return this.page.getByText(month);
    }

    private getDay(date: string) {
        return this.page.getByTitle(date);
    }

    private async selectDecade(year: string) {
        await this.decadeField.click();
        const decade = Math.floor(Number(year) / 10) * 10 + 9;
        await this.getDecade(`-${decade}`).click();
    }

    private async selectMonth(month: string) {
        const monthNames = [
            'janvier',
            'février',
            'mars',
            'avril',
            'mai',
            'juin',
            'juillet',
            'août',
            'septembre',
            'octobre',
            'novembre',
            'décembre',
        ];
        const monthName = monthNames[Number(month) - 1];
        await this.getMonth(monthName).click();
    }

    private async selectDay(month: string, day: string) {
        await this.getDay(`-${month}-${day}`).click();
    }

    public async convertDateToTimestanmp(year: string, month: string, day: string) {
        const date = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);
        return String(Math.floor(date.getTime() / 1000));
    }

    public isSimpleDateSave(date: string) {
        return this.page.getByText(date);
    }

    public async selectDate({year, month, fromDay, toDay}: {year: Year; month: Month; fromDay: Day; toDay: Day}) {
        await this.field.click();
        await this.yearField.click();
        await this.selectDecade(year);
        await this.getYear(year).click();
        await this.selectMonth(month);
        await this.selectDay(month, fromDay);
        const month2 = String(Number(month) + 1).padStart(2, '0');
        await this.selectDay(month2, toDay);
        return this.convertDateToTimestanmp(year, month, fromDay);
    }

    public async clear() {
        // The clear icon (antd allowClear) is only rendered while the picker input is hovered.
        await this.field.hover();
        await this.deleteBtn.click();
    }

    public isDateRangeSave(date: string) {
        return this.page.getByText(`Du ${date} au`);
    }
}
