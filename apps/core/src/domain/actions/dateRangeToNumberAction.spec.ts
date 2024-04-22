// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockStandardValue} from '../../__tests__/mocks/value';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import dateRangeToNumberAction from './dateRangeToNumberAction';

describe('dateRangeToNumberAction', () => {
    const action = dateRangeToNumberAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.DATE_RANGE, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText};
    test('dateRangeToNumberAction', async () => {
        expect(action([{...mockStandardValue, value: {from: 12345, to: 12346}}], {}, ctx)).toEqual({
            errors: [],
            values: [{...mockStandardValue, value: {from: 12345, to: 12346}}]
        });
        expect(
            action(
                [
                    {...mockStandardValue, value: {from: 12345, to: 12346}},
                    {...mockStandardValue, value: {from: 654321, to: 654320}}
                ],
                {},
                ctx
            )
        ).toEqual({
            errors: [],
            values: [
                {...mockStandardValue, value: {from: 12345, to: 12346}},
                {...mockStandardValue, value: {from: 654321, to: 654320}}
            ]
        });
        expect(action([{...mockStandardValue, value: {from: '12345', to: '12346'}}], {}, ctx)).toEqual({
            errors: [],
            values: [{...mockStandardValue, value: {from: 12345, to: 12346}}]
        });
        expect(action([{...mockStandardValue, value: {to: '12346'}}], {}, ctx)).toEqual({
            errors: [],
            values: [{...mockStandardValue, value: {from: 0, to: 12346}}]
        });
        expect(action([{...mockStandardValue, value: {from: '12345'}}], {}, ctx)).toEqual({
            errors: [],
            values: [{...mockStandardValue, value: {from: 12345, to: 0}}]
        });
        expect(action([{...mockStandardValue, value: 'bad value'}], {}, ctx)).toEqual({
            errors: [],
            values: [{...mockStandardValue, value: {from: 0, to: 0}}]
        });
    });
});
