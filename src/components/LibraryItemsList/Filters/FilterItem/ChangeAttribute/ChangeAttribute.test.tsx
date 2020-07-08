import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {
    AttributeFormat,
    conditionFilter,
    DisplayListItemTypes,
    FilterTypes,
    IFilter,
    OrderSearch
} from '../../../../../_types/types';
import MockedProviderWithFragments from '../../../../../__mocks__/MockedProviderWithFragments';
import ListAttributes from '../../../../ListAttributes';
import {LibraryItemListState} from '../../../LibraryItemsListReducer';
import ChangeAttribute from './ChangeAttribute';

describe('ChangeAttribute', () => {
    const stateItems: LibraryItemListState = {
        libQuery: 'test',
        libFilter: 'test',
        libSearchableField: 'test',
        itemsSortField: 'test',
        itemsSortOrder: OrderSearch.asc,
        itemsTotalCount: 0,
        offset: 0,
        pagination: 20,
        displayType: DisplayListItemTypes.listSmall,
        showFilters: false,
        selectionMode: false,
        itemsSelected: {},
        queryFilters: [],
        attributes: [],
        columns: []
    };

    const filterMock: IFilter = {
        type: FilterTypes.filter,
        key: 0,
        operator: false,
        condition: conditionFilter.contains,
        value: '',
        attributeId: 'id',
        active: true,
        format: AttributeFormat.text
    };

    test('should list attribute', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <ChangeAttribute
                        stateItems={stateItems}
                        setFilters={jest.fn()}
                        filter={filterMock}
                        showModal={true}
                        setShowModal={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(ListAttributes)).toHaveLength(1);
    });
});
