// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import toBooleanAction from './toBooleanAction';

describe('toBooleanAction', () => {
    const action = toBooleanAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('toBoolean', async () => {
        expect((await action([{value: true}], {}, ctx)).values[0].value).toBe(true);
        expect((await action([{value: false}], {}, ctx)).values[0].value).toBe(false);
        expect((await action([{value: 1}], {}, ctx)).values[0].value).toBe(true);
        expect((await action([{value: 0}], {}, ctx)).values[0].value).toBe(false);
        expect((await action([{value: 'true'}], {}, ctx)).values[0].value).toBe(true);
        expect((await action([{value: 'false'}], {}, ctx)).values[0].value).toBe(false);
        expect((await action([{value: 'totot'}], {}, ctx)).values[0].value).toBe(true);
        expect((await action([{value: null}], {}, ctx)).values[0].value).toBe(false);
    });
});
