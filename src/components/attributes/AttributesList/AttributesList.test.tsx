import {mount, shallow} from 'enzyme';
import React from 'react';
import {MockedProvider} from 'react-apollo/test-utils';
import {GET_ATTRIBUTES_attributes} from '../../../_gqlTypes/GET_ATTRIBUTES';
import {AttributeFormat, AttributeType} from '../../../_gqlTypes/globalTypes';
import AttributesList from './AttributesList';

describe('AttributesList', () => {
    const attributes: GET_ATTRIBUTES_attributes[] = [
        {
            id: 'attr1',
            type: AttributeType.simple,
            format: AttributeFormat.text,
            system: false,
            label: {fr: 'Test 1', en: null},
            linked_tree: null,
            permissions_conf: null
        },
        {
            id: 'attr2',
            type: AttributeType.simple,
            format: AttributeFormat.text,
            system: false,
            label: {fr: 'Test 2', en: null},
            linked_tree: null,
            permissions_conf: null
        },
        {
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
                >
                    <div key="attr_lib_test" className="children_to_render" />
                </AttributesList>
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
