// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import ValuesSummary from './ValuesSummary';

const multipleValue1 = 'multipleValue1';
const multipleValue2 = 'multipleValue2';
const multipleValues = [multipleValue1, multipleValue2];

const calculatedValue = 'calculated value';

describe('ValuesSummary', () => {
    it('Should display one tab: values version', async () => {
        render(<ValuesSummary globalValues={[]} calculatedValue={null} />);

        expect(screen.getByText('record_summary.values_version')).toBeVisible();
    });

    it('Should display no value without values', async () => {
        render(<ValuesSummary globalValues={[]} calculatedValue={null} />);

        expect(screen.getAllByText('record_summary.no_value')).toHaveLength(2);
    });

    it('Should display global values with badge', async () => {
        render(<ValuesSummary globalValues={multipleValues} calculatedValue={null} />);

        expect(screen.getByText(multipleValue1)).toBeVisible();
        expect(screen.getByText(multipleValue2)).toBeVisible();
        expect(screen.getByTitle('2')).toBeVisible();
    });

    it('Should display calculated value with badge', async () => {
        render(<ValuesSummary globalValues={[]} calculatedValue={calculatedValue} />);

        expect(screen.getByText(calculatedValue)).toBeVisible();
        expect(screen.getByTitle('1')).toBeVisible();
    });

    it('Should strip global and calculated values', async () => {
        render(<ValuesSummary globalValues={['<div>12</div>']} calculatedValue="<p><span>23</span></p>" />);

        expect(screen.getByText('12')).toBeVisible();
        expect(screen.getByText('23')).toBeVisible();
    });
});
