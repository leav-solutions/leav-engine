// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import toNumberAction from './toNumberAction';

describe('toNumberAction', () => {
    const action = toNumberAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText, userId: 'test_user'};
    test('toNumber', async () => {
        expect((await action([{payload: 12345}], {}, ctx)).values[0].payload).toBe(12345);
        expect((await action([{payload: '12345'}], {}, ctx)).values[0].payload).toBe(12345);
        expect((await action([{payload: '12345.45'}], {}, ctx)).values[0].payload).toBe(12345.45);
        expect((await action([{payload: true}], {}, ctx)).values[0].payload).toBe(1);
        expect((await action([{payload: false}], {}, ctx)).values[0].payload).toBe(0);
        expect((await action([{payload: 'aaaa'}], {}, ctx)).values[0].payload).toBe(NaN);
        expect((await action([{payload: null}], {}, ctx)).values[0].payload).toBe(null);
    });
});
