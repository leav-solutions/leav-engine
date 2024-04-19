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
        expect((await action([{value: 12345}], {}, ctx)).values[0].value).toBe(12345);
        expect((await action([{value: '12345'}], {}, ctx)).values[0].value).toBe(12345);
        expect((await action([{value: '12345.45'}], {}, ctx)).values[0].value).toBe(12345.45);
        expect((await action([{value: true}], {}, ctx)).values[0].value).toBe(1);
        expect((await action([{value: false}], {}, ctx)).values[0].value).toBe(0);
        expect((await action([{value: 'aaaa'}], {}, ctx)).values[0].value).toBe(NaN);
        expect((await action([{value: null}], {}, ctx)).values[0].value).toBe(null);
    });
});
