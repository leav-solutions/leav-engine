// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import validateURLAction from './validateURLAction';

describe('validateURLFormatAction', () => {
    const action = validateURLAction().action;

    const ctx = {
        attribute: {id: 'test_attr', format: AttributeFormats.TEXT, type: AttributeTypes.SIMPLE},
        userId: 'test_user'
    };

    test('validateURL should throw', async () => {
        const res = await action([{payload: 'test'}], {}, ctx);
        expect(res.errors.length).toBe(1);
    });

    test('validateURL should return URL', async () => {
        const res = await action([{payload: 'http://url.com'}], {}, ctx);
        expect(res.values[0].payload).toBe('http://url.com');
    });
});
