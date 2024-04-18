// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActionsListFunctionResult} from '_types/actionsList';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import toStringAction from './toStringAction';

describe('toStringAction', () => {
    const action = toStringAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.TEXT, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('toString', async () => {
        expect((action([{value: 'test'}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe('test');
        expect((action([{value: 12345}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe('12345');
        expect((action([{value: true}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe('true');
        expect((action([{value: null}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(null);
    });
});
