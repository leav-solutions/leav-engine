import {mount} from 'enzyme';
import React from 'react';
import {DisplayListItemTypes, IItem, OrderSearch} from '../../../../_types/types';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListState} from '../../LibraryItemsListReducer';
import RecordPreview from '../../LibraryItemsListTable/LibraryItemsListTableRow/RecordPreview';
import ItemTileDisplay from './ItemTileDisplay';

describe('ItemTileDisplay', () => {
    const itemMock: IItem = {
        id: 'test'
    };

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

    test('Snapshot test', async () => {
        const stateMock = {
            ...stateItems,
            items: [itemMock]
        };
        const comp = mount(
            <MockedProviderWithFragments>
                <ItemTileDisplay
                    item={itemMock}
                    stateItems={stateMock}
                    dispatchItems={jest.fn()}
                    showRecordEdition={jest.fn()}
                />
            </MockedProviderWithFragments>
        );

        expect(comp.find(RecordPreview)).toHaveLength(1);
    });
});
