// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActionsListFunctionResult} from '_types/actionsList';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import toNumberAction from './toNumberAction';

describe('toNumberAction', () => {
    const action = toNumberAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('toNumber', async () => {
        expect((action([{value: 12345}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(12345);
        expect((action([{value: '12345'}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(12345);
        expect((action([{value: '12345.45'}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(12345.45);
        expect((action([{value: true}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(1);
        expect((action([{value: false}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(0);
        expect((action([{value: 'aaaa'}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(NaN);
        expect((action([{value: null}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(null);
    });
});
