// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ActionsListEvents, type IActionsListContext} from '../../_types/actionsList';
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import validateRegexAction from './validateRegexAction';

describe('validateRegexAction', () => {
    const action = validateRegexAction().action;
    const attrText = {id: 'test_attr', format: AttributeFormats.TEXT, type: AttributeTypes.SIMPLE};
    const ctx: IActionsListContext = {
        attribute: attrText,
        userId: 'test_user',
        actionEvent: ActionsListEvents.SAVE_VALUE,
    };
    test('validateRegex', async () => {
        const res = await action([{payload: 'test'}], {regex: '^test$'}, ctx);
        expect(res.values[0].payload).toBe('test');

        const resError = await action([{payload: 'test'}], {regex: '^toto$'}, ctx);
        expect(resError.errors.length).toBe(1);
    });
});
