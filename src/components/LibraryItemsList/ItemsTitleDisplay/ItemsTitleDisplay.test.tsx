import {render} from 'enzyme';
import React from 'react';
import {displayListItemTypes} from '../../../_types/types';
import {LibraryItemListReducerAction, LibraryItemListState} from '../LibraryItemsListReducer';
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
        itemsSortOrder: 'test',
        items: [],
        itemsTotalCount: 0,
        offset: 0,
        pagination: 20,
        displayType: displayListItemTypes.listMedium,
        showFilters: false,
        selectionMode: false,
        itemsSelected: {},
        queryFilters: []
    };

    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();
    test('Snapshot test', async () => {
        const comp = render(<ItemsTitleDisplay stateItems={stateItems} dispatchItems={dispatchItems} />);

        expect(comp).toMatchSnapshot();
    });
});
