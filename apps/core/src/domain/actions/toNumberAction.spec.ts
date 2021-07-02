// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import toNumberAction from './toNumberAction';

describe('toNumberAction', () => {
    const action = toNumberAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('toNumber', async () => {
        expect(action(12345, {}, ctx)).toBe(12345);
        expect(action('12345', {}, ctx)).toBe(12345);
        expect(action('12345.45', {}, ctx)).toBe(12345.45);
        expect(action(true, {}, ctx)).toBe(1);
        expect(action(false, {}, ctx)).toBe(0);
        expect(action('aaaa', {}, ctx)).toBe(NaN);
        expect(action(null, {}, ctx)).toBe(null);
    });
});
