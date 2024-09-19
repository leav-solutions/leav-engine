// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import validateRegexAction from './validateRegexAction';

describe('validateRegexAction', () => {
    const action = validateRegexAction().action;
    const attrText = {id: 'test_attr', format: AttributeFormats.TEXT, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('validateRegex', async () => {
        const res = await action([{payload: 'test'}], {regex: '^test$'}, ctx);
        expect(res.values[0].payload).toBe('test');

        const resError = await action([{payload: 'test'}], {regex: '^toto$'}, ctx);
        expect(resError.errors.length).toBe(1);
    });
});
