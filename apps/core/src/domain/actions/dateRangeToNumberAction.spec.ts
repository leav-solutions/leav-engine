// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockStandardValue} from '../../__tests__/mocks/value';
import {AttributeFormats, AttributeTypes, IAttribute} from '../../_types/attribute';
import dateRangeToNumberAction from './dateRangeToNumberAction';

describe('dateRangeToNumberAction', () => {
    const action = dateRangeToNumberAction().action;
    const attrText: IAttribute = {id: 'test_attr', format: AttributeFormats.DATE_RANGE, type: AttributeTypes.SIMPLE};
    const ctx = {attribute: attrText, userId: 'test_user'};
    test('dateRangeToNumberAction', async () => {
        expect(action([{...mockStandardValue, payload: {from: 12345, to: 12346}}], {}, ctx)).toEqual({
            errors: [],
            values: [{...mockStandardValue, payload: {from: 12345, to: 12346}}]
        });
        expect(
            action(
                [
                    {...mockStandardValue, payload: {from: 12345, to: 12346}},
                    {...mockStandardValue, payload: {from: 654321, to: 654320}}
                ],
                {},
                ctx
            )
        ).toEqual({
            errors: [],
            values: [
                {...mockStandardValue, payload: {from: 12345, to: 12346}},
                {...mockStandardValue, payload: {from: 654321, to: 654320}}
            ]
        });
        expect(action([{...mockStandardValue, payload: {from: '12345', to: '12346'}}], {}, ctx)).toEqual({
            errors: [],
            values: [{...mockStandardValue, payload: {from: 12345, to: 12346}}]
        });
        expect(action([{...mockStandardValue, payload: {to: '12346'}}], {}, ctx)).toEqual({
            errors: [],
            values: [{...mockStandardValue, payload: {from: 0, to: 12346}}]
        });
        expect(action([{...mockStandardValue, payload: {from: '12345'}}], {}, ctx)).toEqual({
            errors: [],
            values: [{...mockStandardValue, payload: {from: 12345, to: 0}}]
        });
        expect(action([{...mockStandardValue, payload: 'bad value'}], {}, ctx)).toEqual({
            errors: [],
            values: [{...mockStandardValue, payload: {from: 0, to: 0}}]
        });
    });
});
