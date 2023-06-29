// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import toUppercaseAction from './toUppercaseAction';

describe('toUppercaseAction', () => {
    const action = toUppercaseAction().action;
    const ctx = {attribute: {id: 'test_attr', format: AttributeFormats.TEXT, type: AttributeTypes.SIMPLE}};

    test('toUppercase', async () => {
        expect(action('azerty', {}, ctx)).toBe('AZERTY');
    });
});
