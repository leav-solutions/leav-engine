// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes} from '../../_types/attribute';
import toUppercaseAction from './toUppercaseAction';

describe('toUppercaseAction', () => {
    const action = toUppercaseAction().action;
    const ctx = {
        attribute: {id: 'test_attr', format: AttributeFormats.TEXT, type: AttributeTypes.SIMPLE},
        userId: 'test_user'
    };

    test('toUppercase', async () => {
        expect((await action([{payload: 'azerty'}], {}, ctx)).values[0].payload).toBe('AZERTY');
        expect((await action([{payload: null}], {}, ctx)).values[0].payload).toBe(null);
    });
});
