// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ValidationError from '../../errors/ValidationError';
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import validateURLAction from './validateURLAction';

describe('validateURLFormatAction', () => {
    const action = validateURLAction().action;

    const ctx = {attribute: {id: 'test_attr', format: AttributeFormats.TEXT, type: AttributeTypes.SIMPLE}};

    test('validateURL should throw', async () => {
        expect(() => action('test', null, ctx)).toThrow(ValidationError);
    });

    test('validateURL should return URL', async () => {
        expect(action('http://url.com', null, ctx)).toBe('http://url.com');
    });
});
