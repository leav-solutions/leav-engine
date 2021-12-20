// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import dateRangeToNumberAction from './dateRangeToNumberAction';

describe('dateRangeToNumberAction', () => {
    const action = dateRangeToNumberAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.DATE_RANGE, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('dateRangeToNumberAction', async () => {
        expect(action({from: 12345, to: 12346}, {}, ctx)).toEqual({from: 12345, to: 12346});
        expect(action({from: '12345', to: '12346'}, {}, ctx)).toEqual({from: 12345, to: 12346});
        expect(action({to: '12346'}, {}, ctx)).toEqual({from: 0, to: 12346});
        expect(action({from: '12345'}, {}, ctx)).toEqual({from: 12345, to: 0});
        expect(action('bad value', {}, ctx)).toEqual({from: 0, to: 0});
    });
});
