import {shallow} from 'enzyme';
import React from 'react';
import {DisplayListItemTypes} from '../../../_types/types';
import {LibraryItemListReducerAction, LibraryItemListState} from '../LibraryItemsListReducer';
import MenuItemList from './MenuItemList';

jest.mock('../LibraryItemsListMenuPagination', () => {
    return function LibraryItemsListMenuPagination() {
        return <div>LibraryItemsListMenuPagination</div>;
    };
});

describe('MenuItemList', () => {
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
        const comp = shallow(
            <MenuItemList stateItems={stateItems} dispatchItems={dispatchItems} refetch={jest.fn()} />
        );

        expect(comp).toMatchSnapshot();
    });
});
