// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import formatDateAction from './formatDateAction';

describe('formatDateAction', () => {
    const action = formatDateAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.DATE, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};

    test('formatDate', async () => {
        expect(action(2119477320, {format: 'D/M/YY HH:mm'}, ctx)).toBeTruthy();
        expect(action(2119477320, {}, ctx)).toBeTruthy();
        expect(action('aaaa', {}, ctx)).toBe('');
        expect(action(null, {}, ctx)).toBe(null);
    });
});
