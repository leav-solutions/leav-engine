// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockStandardValue} from '../../__tests__/mocks/value';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import encryptAction from './encryptAction';

describe('encryptAction', () => {
    const action = encryptAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};

    test('should encrypt a value', async () => {
        const res = await action([{...mockStandardValue, value: 'MyPAssWd'}], {}, ctx);

        const valuePayload = res.values[0].value;
        expect(typeof valuePayload).toBe('string');
        expect(('' + valuePayload).length).toBe(60);
    });

    test('should return null if no value', async () => {
        expect(await action([{...mockStandardValue, value: null}], {}, ctx)).toEqual({
            errors: [],
            values: [{...mockStandardValue, value: null}]
        });
    });
});
