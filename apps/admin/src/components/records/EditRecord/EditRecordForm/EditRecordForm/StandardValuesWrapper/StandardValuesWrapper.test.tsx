// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {shallow} from 'enzyme';
import React from 'react';
import {mockAttrAdv, mockAttrSimple} from '../../../../../../__mocks__/attributes';
import StandardValuesWrapper from './StandardValuesWrapper';

jest.mock(
    './EditRecordInput',
    () =>
        function EditRecordInput() {
            return <div>EditRecordInput</div>;
        }
);

jest.mock('../../../../../../hooks/useLang');

describe('MultipleValuesWrapper', () => {
    const onSubmit = jest.fn();
    const onDelete = jest.fn();

    test('Render 1 value', async () => {
        const value = {
            id_value: null,
            value: 'simple_value',
            raw_value: 'simple_value',
            created_at: null,
            modified_at: null,
            version: null
        };
        const comp = shallow(
            <StandardValuesWrapper
                attribute={{...mockAttrSimple}}
                readonly={false}
                values={value}
                onSubmit={onSubmit}
                onDelete={onDelete}
            />
        );

        expect(comp.find('EditRecordInput')).toHaveLength(1);
    });

    test('Render multiple values', async () => {
        const values = [
            {
                id_value: '12345',
                value: 'adv_value',
                raw_value: 'adv_value',
                created_at: null,
                modified_at: null,
                version: null
            },
            {
                id_value: '6789',
                value: 'adv_value2',
                raw_value: 'adv_value2',
                created_at: null,
                modified_at: null,
                version: null
            }
        ];

        const comp = shallow(
            <StandardValuesWrapper
                attribute={{...mockAttrAdv}}
                readonly={false}
                values={values}
                onSubmit={onSubmit}
                onDelete={onDelete}
            />
        );

        expect(comp.find('EditRecordInput')).toHaveLength(2);
    });

    test('Display add value button if can add', async () => {
        const values = [
            {
                id_value: '12345',
                value: 'adv_value',
                raw_value: 'adv_value',
                created_at: null,
                modified_at: null,
                version: null
            },
            {
                id_value: '6789',
                value: 'adv_value2',
                raw_value: 'adv_value2',
                created_at: null,
                modified_at: null,
                version: null
            }
        ];

        const comp = shallow(
            <StandardValuesWrapper
                attribute={{...mockAttrAdv, multiple_values: true}}
                readonly={false}
                values={values}
                onSubmit={onSubmit}
                onDelete={onDelete}
            />
        );

        expect(comp.find('[data-test-id="add_value_btn"]')).toHaveLength(1);
    });

    test("If readonly, don't display add value button", async () => {
        const values = [
            {
                id_value: '12345',
                value: 'adv_value',
                raw_value: 'adv_value',
                created_at: null,
                modified_at: null,
                version: null
            },
            {
                id_value: '6789',
                value: 'adv_value2',
                raw_value: 'adv_value2',
                created_at: null,
                modified_at: null,
                version: null
            }
        ];

        const comp = shallow(
            <StandardValuesWrapper
                attribute={{...mockAttrAdv, multiple_values: true}}
                readonly
                values={values}
                onSubmit={onSubmit}
                onDelete={onDelete}
            />
        );

        expect(comp.find('[data-test-id="add_value_btn"]')).toHaveLength(0);
    });
});
