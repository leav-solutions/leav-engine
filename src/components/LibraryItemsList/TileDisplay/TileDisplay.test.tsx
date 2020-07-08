import {mount} from 'enzyme';
import React from 'react';
import {DisplayListItemTypes, IItem, OrderSearch} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import LibraryItemsListPagination from '../LibraryItemsListPagination';
import {LibraryItemListReducerAction, LibraryItemListState} from '../LibraryItemsListReducer';
import RecordPreview from '../LibraryItemsListTable/LibraryItemsListTableRow/RecordPreview';
import TileDisplay from './TileDisplay';

jest.mock(
    '../LibraryItemsListPagination',
    () =>
        function LibraryItemsListPagination() {
            return <div>LibraryItemsListPagination</div>;
        }
);

describe('TileDisplay', () => {
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

    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();
    test('Check render', async () => {
        const itemsMock: IItem[] = [
            {
                id: 'test'
            }
        ];

        const stateMock = {...stateItems, items: itemsMock};
        const comp = mount(
            <MockedProviderWithFragments>
                <TileDisplay stateItems={stateMock} dispatchItems={dispatchItems} />
            </MockedProviderWithFragments>
        );

        expect(comp.find(RecordPreview)).toHaveLength(1);
        expect(comp.find(LibraryItemsListPagination)).toHaveLength(1);
    });
});
