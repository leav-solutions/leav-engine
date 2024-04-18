// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActionsListFunctionResult} from '_types/actionsList';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import formatDateAction from './formatDateAction';

describe('formatDateAction', () => {
    const action = formatDateAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.DATE, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};

    test('formatDate', async () => {
        expect((action([{value: 2119477320}], {format: 'D/M/YY HH:mm'}, ctx) as IActionsListFunctionResult).values[0].value).toBeTruthy();
        expect((action([{value: 2119477320}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBeTruthy();
        expect((action([{value: 'aaaa'}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe('');
        expect((action([{value: null}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(null);
    });
});
