// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import toBooleanAction from './toBooleanAction';

describe('toBooleanAction', () => {
    const action = toBooleanAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.NUMERIC, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText, userId: 'test_user'};
    test('toBoolean', async () => {
        expect((await action([{payload: true}], {}, ctx)).values[0].payload).toBe(true);
        expect((await action([{payload: false}], {}, ctx)).values[0].payload).toBe(false);
        expect((await action([{payload: 1}], {}, ctx)).values[0].payload).toBe(true);
        expect((await action([{payload: 0}], {}, ctx)).values[0].payload).toBe(false);
        expect((await action([{payload: 'true'}], {}, ctx)).values[0].payload).toBe(true);
        expect((await action([{payload: 'false'}], {}, ctx)).values[0].payload).toBe(false);
        expect((await action([{payload: 'totot'}], {}, ctx)).values[0].payload).toBe(true);
        expect((await action([{payload: null}], {}, ctx)).values[0].payload).toBe(false);
    });
});
