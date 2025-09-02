// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_ui/_tests/testUtils';
import ValuesSummary from './ValuesSummary';
import {IRecordIdentityWhoAmI} from '_ui/types';

const multipleValue1 = 'multipleValue1';
const multipleValue2 = 'multipleValue2';
const multipleValues = [multipleValue1, multipleValue2];
const record: IRecordIdentityWhoAmI = {
    id: '1',
    label: 'record 1',
    library: {
        id: 'lib1'
    }
};
const attributeId = 'attr1';

const calculatedValue = 'calculated value';

describe('ValuesSummary', () => {
    it('Should display one tab: values version', async () => {
        render(<ValuesSummary record={record} attributeId={attributeId} globalValues={[]} calculatedValue={null} />);

        expect(screen.getByText('record_summary.values_version')).toBeVisible();
    });

    it('Should display no value without values', async () => {
        render(<ValuesSummary record={null} attributeId={attributeId} globalValues={[]} calculatedValue={null} />);

        expect(screen.getAllByText('record_summary.no_value')).toHaveLength(2);
    });

    it('Should display global values with badge', async () => {
        render(
            <ValuesSummary
                record={record}
                attributeId={attributeId}
                globalValues={multipleValues}
                calculatedValue={null}
            />
        );

        expect(screen.getByText(multipleValue1)).toBeVisible();
        expect(screen.getByText(multipleValue2)).toBeVisible();
        expect(screen.getByTitle('2')).toBeVisible();
    });

    it('Should display calculated value with badge', async () => {
        render(
            <ValuesSummary
                record={record}
                attributeId={attributeId}
                globalValues={[]}
                calculatedValue={calculatedValue}
            />
        );

        expect(screen.getByText(calculatedValue)).toBeVisible();
        expect(screen.getByTitle('1')).toBeVisible();
    });

    it('Should strip global and calculated values', async () => {
        render(
            <ValuesSummary
                record={record}
                attributeId={attributeId}
                globalValues={['<div>12</div>']}
                calculatedValue="<p><span>23</span></p>"
            />
        );

        expect(screen.getByText('12')).toBeVisible();
        expect(screen.getByText('23')).toBeVisible();
    });

    it('Should display period as strings for global and calculated values', async () => {
        render(
            <ValuesSummary
                record={record}
                attributeId={attributeId}
                globalValues={[{from: 1, to: 2}]}
                calculatedValue={{from: 3, to: 4}}
            />
        );

        expect(screen.getAllByTitle(/record_edition.date_range_value|1|2/)[0]).toBeVisible();
        expect(screen.getAllByTitle(/record_edition.date_range_value|3|4/)[0]).toBeVisible();
    });

    it('Should display yes and no for boolean values', async () => {
        render(<ValuesSummary record={record} attributeId={attributeId} globalValues={[true, false]} />);

        expect(screen.getByText('global.yes')).toBeVisible();
        expect(screen.getByText('global.no')).toBeVisible();
    });
});
