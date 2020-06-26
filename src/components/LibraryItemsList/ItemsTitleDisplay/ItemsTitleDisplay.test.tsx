import {mount} from 'enzyme';
import React from 'react';
import {displayListItemTypes, IItem, OrderSearch} from '../../../_types/types';
import LibraryItemsListPagination from '../LibraryItemsListPagination';
import {LibraryItemListReducerAction, LibraryItemListState} from '../LibraryItemsListReducer';
import RecordPreview from '../LibraryItemsListTable/LibraryItemsListTableRow/RecordPreview';
import ItemsTitleDisplay from './ItemsTitleDisplay';

jest.mock(
    '../LibraryItemsListPagination',
    () =>
        function LibraryItemsListPagination() {
            return <div>LibraryItemsListPagination</div>;
        }
);

describe('ItemsTitleDisplay', () => {
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

    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();
    test('Check render', async () => {
        const itemsMock: IItem[] = [
            {
                id: 'test'
            }
        ];

        const stateMock = {...stateItems, items: itemsMock};
        const comp = mount(<ItemsTitleDisplay stateItems={stateMock} dispatchItems={dispatchItems} />);

        expect(comp.find(RecordPreview)).toHaveLength(1);
        expect(comp.find(LibraryItemsListPagination)).toHaveLength(1);
    });
});
