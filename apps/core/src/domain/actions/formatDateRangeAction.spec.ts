// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import moment from 'moment-timezone';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import formatDateRangeAction from './formatDateRangeAction';

describe('formatDateAction', () => {
    // Force timezone to make sure tests are consistent and don't depends on user's TZ
    moment.tz.setDefault('Europe/Paris');

    const action = formatDateRangeAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.DATE_RANGE, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};

    test('formatDate', async () => {
        expect(action({from: '2119477320', to: '2119477380'}, {format: 'D/M/YY HH:mm'}, ctx)).toEqual({
            from: '1/3/37 00:42',
            to: '1/3/37 00:43'
        });
        expect(action({from: '2119477320', to: '2119477362'}, {}, ctx)).toEqual({
            from: '2037-03-01T00:42:00+01:00',
            to: '2037-03-01T00:42:42+01:00'
        });
        expect(action('aaaa', {}, ctx)).toBe(null);
        expect(action({from: '2119477320'}, {}, ctx)).toBe(null);
        expect(action({to: '2119477320'}, {}, ctx)).toBe(null);
        expect(action(null, {}, ctx)).toBe(null);
    });
});
