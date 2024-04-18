// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ValidationError from '../../errors/ValidationError';
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import validateURLAction from './validateURLAction';
import {IActionsListFunctionResult} from '_types/actionsList';
import exp from 'constants';

describe('validateURLFormatAction', () => {
    const action = validateURLAction().action;

    const ctx = {attribute: {id: 'test_attr', format: AttributeFormats.TEXT, type: AttributeTypes.SIMPLE}};

    test('validateURL should throw', async () => {
        const res = action([{value: 'test'}], null, ctx) as IActionsListFunctionResult;
        expect(res.errors.length).toBe(1);
    });

    test('validateURL should return URL', async () => {
        const res = action([{value: 'http://url.com'}], null, ctx) as IActionsListFunctionResult;
        expect(res.values[0].value).toBe('http://url.com');
    });
});
