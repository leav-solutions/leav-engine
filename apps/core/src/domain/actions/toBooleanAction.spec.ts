// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActionsListFunctionResult} from '_types/actionsList';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import toBooleanAction from './toBooleanAction';

describe('toBooleanAction', () => {
    const action = toBooleanAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('toBoolean', async () => {
        expect((action([{value: true}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(true);
        expect((action([{value: false}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(false);
        expect((action([{value: 1}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(true);
        expect((action([{value: 0}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(false);
        expect((action([{value: 'true'}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(true);
        expect((action([{value: 'false'}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(false);
        expect((action([{value: 'totot'}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(true);
        expect((action([{value: null}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(false);
    });
});
