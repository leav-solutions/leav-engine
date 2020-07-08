import {render} from 'enzyme';
import React from 'react';
import {DisplayListItemTypes} from '../../../_types/types';
import {LibraryItemListReducerAction, LibraryItemListState} from '../LibraryItemsListReducer';
import LibraryItemsListPagination from './LibraryItemsListPagination';

describe('LibraryItemsListPagination', () => {
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
        displayType: DisplayListItemTypes.listMedium,
        showFilters: false,
        selectionMode: false,
        itemsSelected: {},
        queryFilters: []
    };

    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('Snapshot test', async () => {
        const comp = render(<LibraryItemsListPagination stateItems={stateItems} dispatchItems={dispatchItems} />);

        expect(comp).toMatchSnapshot();
    });
});
