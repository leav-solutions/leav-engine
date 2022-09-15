// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import formatDateRangeAction from './formatDateRangeAction';

describe('formatDateRangeAction', () => {
    const action = formatDateRangeAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.DATE_RANGE, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};

    test('formatDateRange', async () => {
        const formattedDate = action({from: '2119477320', to: '2119477380'}, {format: 'D/M/YY HH:mm'}, ctx) as {
            from: string;
            to: string;
        };
        expect(formattedDate.from).toBeTruthy();
        expect(formattedDate.to).toBeTruthy();

        const formattedDateNoFormat = action({from: '2119477320', to: '2119477380'}, {format: 'D/M/YY HH:mm'}, ctx) as {
            from: string;
            to: string;
        };
        expect(formattedDateNoFormat.from).toBeTruthy();
        expect(formattedDateNoFormat.to).toBeTruthy();

        expect(action('aaaa', {}, ctx)).toBe(null);
        expect(action({from: '2119477320'}, {}, ctx)).toBe(null);
        expect(action({to: '2119477320'}, {}, ctx)).toBe(null);
        expect(action(null, {}, ctx)).toBe(null);
    });
});
