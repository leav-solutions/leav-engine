import {type Locator, type Page} from '@playwright/test';
import {type Year, type Month, type Day} from './_types';
import {STANDARD_FIELD_ATTRIBUTE_DATE_ID, STANDARD_FIELD_ATTRIBUTE_DATE_LABEL} from '../../src/constants';

export class DateFieldComponent {
    private readonly page: Page;
    private readonly root: Locator;
    private readonly field: Locator;
    private readonly deleteBtn: Locator;
    private readonly yearField: Locator;
    private readonly decadeField: Locator;
    private readonly input: Locator;
    public constructor(page: Page, root: Locator) {
        this.page = page;
        this.root = root;
        this.field = this.root.getByText(STANDARD_FIELD_ATTRIBUTE_DATE_LABEL, {exact: true});
        this.input = this.page.locator(`#standardfield-${STANDARD_FIELD_ATTRIBUTE_DATE_ID}`).locator('input');
        // DS clear icons are FontAwesome svgs carrying `aria-label="clear"`.
        this.deleteBtn = this.page.locator(`#standardfield-${STANDARD_FIELD_ATTRIBUTE_DATE_ID}`).getByLabel('clear');
        this.yearField = this.page.getByRole('button', {name: 'year panel'});
        this.decadeField = this.page.getByRole('button', {name: 'decade panel'});
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

    public async selectDate({year, month, day}: {year: Year; month: Month; day: Day}) {
        await this.field.click();
        await this.yearField.click();
        await this.selectDecade(year);
        await this.getYear(year).click();
        await this.selectMonth(month);
        await this.selectDay(month, day);
        return this.convertDateToTimestanmp(year, month, day);
    }

    public async convertDateToTimestanmp(year: string, month: string, day: string) {
        const date = new Date(Number(year), Number(month) - 1, Number(day), 12, 0, 0);
        return String(Math.floor(date.getTime() / 1000));
    }

    public isSimpleDateSave(date: string) {
        return this.page.getByText(date);
    }

    public async clear() {
        // The clear icon (antd allowClear) is only rendered while the picker input is hovered.
        await this.input.hover();
        await this.deleteBtn.click();
    }
}
