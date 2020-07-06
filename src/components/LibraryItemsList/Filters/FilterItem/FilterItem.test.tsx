import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Checkbox, Dropdown, TextArea} from 'semantic-ui-react';
import {
    AttributeFormat,
    conditionFilter,
    displayListItemTypes,
    FilterTypes,
    IFilter,
    operatorFilter,
    OrderSearch
} from '../../../../_types/types';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListState} from '../../LibraryItemsListReducer';
import FilterItem from './FilterItem';

describe('FilterItem', () => {
    const stateItems: LibraryItemListState = {
        libQuery: 'test',
        libFilter: 'test',
        libSearchableField: 'test',
        itemsSortField: 'test',
        itemsSortOrder: OrderSearch.asc,
        itemsTotalCount: 0,
        offset: 0,
        pagination: 20,
        displayType: displayListItemTypes.listSmall,
        showFilters: false,
        selectionMode: false,
        itemsSelected: {},
        queryFilters: [],
        attributes: [],
        columns: []
    };

    const mockFilter: IFilter = {
        type: FilterTypes.filter,
        key: 1,
        operator: false,
        condition: conditionFilter.contains,
        value: '',
        attributeId: 'test',
        active: true,
        format: AttributeFormat.text
    };

    const conditionOptions = [{text: 'Contains', value: conditionFilter.contains}];

    const operatorOptions = [{text: 'AND', value: operatorFilter.and}];

    test('should have a Checkbox', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <FilterItem
                        stateItems={stateItems}
                        filter={mockFilter}
                        conditionOptions={conditionOptions}
                        operatorOptions={operatorOptions}
                        setFilters={jest.fn()}
                        resetFilters={jest.fn()}
                        updateFilters={jest.fn()}
                        filterOperator={operatorFilter.and}
                        setFilterOperator={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Checkbox)).toHaveLength(1);
    });

    test('should have Dropdown', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <FilterItem
                        stateItems={stateItems}
                        filter={mockFilter}
                        conditionOptions={conditionOptions}
                        operatorOptions={operatorOptions}
                        setFilters={jest.fn()}
                        resetFilters={jest.fn()}
                        updateFilters={jest.fn()}
                        filterOperator={operatorFilter.and}
                        setFilterOperator={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(Dropdown)).toHaveLength(1);
    });

    test('should have a TextArea', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <FilterItem
                        stateItems={stateItems}
                        filter={mockFilter}
                        conditionOptions={conditionOptions}
                        operatorOptions={operatorOptions}
                        setFilters={jest.fn()}
                        resetFilters={jest.fn()}
                        updateFilters={jest.fn()}
                        filterOperator={operatorFilter.and}
                        setFilterOperator={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(TextArea)).toHaveLength(1);
    });
});
