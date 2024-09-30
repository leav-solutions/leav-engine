// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import validateEmailAction from './validateEmailAction';
import {IActionsListFunctionResult} from '_types/actionsList';

describe('validateEmailFormatAction', () => {
    const action = validateEmailAction().action;

    const ctx = {
        attribute: {id: 'test_attr', format: AttributeFormats.TEXT, type: AttributeTypes.SIMPLE},
        userId: 'test_user'
    };

    test('validateEmail should throw', async () => {
        const res = action([{payload: 'test'}], {}, ctx) as IActionsListFunctionResult;
        expect(res.errors.length).toBe(1);
    });

    test('validateEmail should return email', async () => {
        expect((await action([{payload: 'email@domain.com'}], {}, ctx)).values[0].payload).toBe('email@domain.com');
    });
});
