// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IActionsListFunctionResult} from '_types/actionsList';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import toJSONAction from './toJSONAction';

describe('toJSONAction', () => {
    const action = toJSONAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('toJSON', async () => {
        expect((action([{value: {test: 'aaa', toto: {tata: true}}}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe('{"test":"aaa","toto":{"tata":true}}');
        expect((action([{value: null}], {}, ctx) as IActionsListFunctionResult).values[0].value).toBe(null);
    });
});
