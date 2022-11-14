// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ValidationError from '../../errors/ValidationError';
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import validateEmailAction from './validateEmailAction';

describe('validateEmailFormatAction', () => {
    const action = validateEmailAction().action;

    const ctx = {attribute: {id: 'test_attr', format: AttributeFormats.TEXT, type: AttributeTypes.SIMPLE}};

    test('validateEmail should throw', async () => {
        expect(() => action('test', null, ctx)).toThrow(ValidationError);
    });

    test('validateEmail should return email', async () => {
        expect(action('email@domain.com', null, ctx)).toBe('email@domain.com');
    });
});
