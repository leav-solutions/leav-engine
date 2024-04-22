// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import toJSONAction from './toJSONAction';

describe('toJSONAction', () => {
    const action = toJSONAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('toJSON', async () => {
        expect((await action([{value: {test: 'aaa', toto: {tata: true}}}], {}, ctx)).values[0].value).toBe(
            '{"test":"aaa","toto":{"tata":true}}'
        );
        expect((await action([{value: null}], {}, ctx)).values[0].value).toBe(null);
    });
});
