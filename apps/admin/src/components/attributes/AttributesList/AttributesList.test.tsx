// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedProvider} from '@apollo/client/testing';
import {mount, shallow} from 'enzyme';
import React from 'react';
import {GET_ATTRIBUTE_BY_ID_attributes_list} from '_gqlTypes/GET_ATTRIBUTE_BY_ID';
import {AttributeFormat, AttributeType} from '../../../_gqlTypes/globalTypes';
import {mockAttrSimple} from '../../../__mocks__/attributes';
import AttributesList from './AttributesList';

jest.mock('../../../hooks/useLang');

describe('AttributesList', () => {
    const attributes: GET_ATTRIBUTE_BY_ID_attributes_list[] = [
        {
            ...mockAttrSimple,
            id: 'attr1',
            type: AttributeType.simple,
            format: AttributeFormat.text,
            system: false,
            label: {fr: 'Test 1', en: null},
            linked_tree: null,
            permissions_conf: null
        },
        {
            ...mockAttrSimple,
            id: 'attr2',
            type: AttributeType.simple,
            format: AttributeFormat.text,
            system: false,
            label: {fr: 'Test 2', en: null},
            linked_tree: null,
            permissions_conf: null
        },
        {
            ...mockAttrSimple,
            id: 'attr3',
            type: AttributeType.simple,
            format: AttributeFormat.text,
            system: false,
            label: {fr: 'Test 3', en: null},
            linked_tree: null,
            permissions_conf: null
        }
    ];

    const onRowClick = jest.fn();
    const onFiltersUpdate = jest.fn();
    test('Render attributes list with filters', async () => {
        const comp = shallow(
            <MockedProvider>
                <AttributesList
                    loading={false}
                    attributes={attributes}
                    onRowClick={onRowClick}
                    onFiltersUpdate={onFiltersUpdate}
                    filters={['test', 'test2']}
                />
            </MockedProvider>
        );

        const attrListComp = comp.find('AttributesList').shallow();
        expect(attrListComp.find('TableBody TableRow').length).toEqual(3);
        expect(attrListComp.find('TableRow.filters').length).toEqual(1);
    });

    test('Render attributes list without filters', async () => {
        const comp = shallow(
            <MockedProvider>
                <AttributesList
                    loading={false}
                    attributes={attributes}
                    onRowClick={onRowClick}
                    onFiltersUpdate={onFiltersUpdate}
                    withFilters={false}
                />
            </MockedProvider>
        );
        const attrListComp = comp.find('AttributesList').shallow();
        expect(attrListComp.find('TableRow.filters').length).toEqual(0);
    });

    test('Render children in actions cell', async () => {
        const comp = shallow(
            <MockedProvider>
                <AttributesList
                    loading={false}
                    attributes={attributes}
                    onRowClick={onRowClick}
                    onFiltersUpdate={onFiltersUpdate}
                    withFilters={false}
                    actions={<div key="attr_lib_test" className="children_to_render" />}
                />
            </MockedProvider>
        );
        const attrListComp = comp.find('AttributesList').shallow();
        expect(attrListComp.find('TableCell.actions .children_to_render').length).toEqual(3);
    });

    test('Render without children in actions cell', async () => {
        const comp = shallow(
            <MockedProvider>
                <AttributesList
                    loading={false}
                    attributes={attributes}
                    onRowClick={onRowClick}
                    onFiltersUpdate={onFiltersUpdate}
                    withFilters={false}
                />
            </MockedProvider>
        );
        const attrListComp = comp.find('AttributesList').shallow();
        expect(attrListComp.find('TableCell.actions').children().length).toEqual(0);
    });

    test('Calls callback on filter update', () => {
        const changeFilter = jest.fn();
        const comp = mount(
            <MockedProvider>
                <AttributesList
                    loading={false}
                    attributes={attributes}
                    onRowClick={onRowClick}
                    onFiltersUpdate={changeFilter}
                />
            </MockedProvider>
        );

        comp.find('.filters input[name="label"]').simulate('change', {target: {value: 'MyLabel'}});
        comp.find('.filters input[name="id"]').simulate('change');
        comp.find('.filters div[name="format"]').simulate('change');
        comp.find('.filters div[name="type"]').simulate('change');
        comp.find('.filters input[name="system"]').simulate('change');

        expect(changeFilter).toHaveBeenCalledTimes(5);
        expect(changeFilter.mock.calls[0][0]).toMatchObject({value: 'MyLabel'});
    });
});
