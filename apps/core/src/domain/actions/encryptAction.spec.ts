// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import encryptAction from './encryptAction';

describe('encryptAction', () => {
    const action = encryptAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('encrypt', async () => {
        const res = await action('MyPAssWd', {}, ctx);
        expect(typeof res).toBe('string');
        expect(('' + res).length).toBe(60);
        expect(await action(null, {}, ctx)).toBe(null);
    });
});
