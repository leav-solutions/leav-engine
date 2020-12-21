// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import moment from 'moment-timezone';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import formatDateAction from './formatDateAction';

describe('formatDateAction', () => {
    // Force timezone to make sure tests are consistent and don't depends on user's TZ
    moment.tz.setDefault('Europe/Paris');

    const action = formatDateAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.DATE, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};

    test('formatDate', async () => {
        expect(action(2119477320, {format: 'D/M/YY HH:mm'}, ctx)).toBe('1/3/37 00:42');
        expect(action(2119477320, {}, ctx)).toBe('2037-03-01T00:42:00+01:00');
        expect(action('aaaa', {}, ctx)).toBe('');
    });
});
