import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {Dropdown} from 'semantic-ui-react';
import {DisplayListItemTypes} from '../../../_types/types';
import {LibraryItemListReducerAction, LibraryItemListState} from '../LibraryItemsListReducer';
import LibraryItemsListMenuPagination from './LibraryItemsListMenuPagination';

describe('LibraryItemsListMenuPagination', () => {
    const items: any = [];
    const totalCount = 0;
    const offset = 0;
    const pagination = 20;

    const stateItems: LibraryItemListState = {
        libQuery: 'test',
        libFilter: 'test',
        libSearchableField: 'test',
        itemsSortField: 'test',
        itemsSortOrder: 'test',
        items: items,
        itemsTotalCount: totalCount,
        offset: offset,
        pagination: pagination,
        displayType: DisplayListItemTypes.listMedium,
        showFilters: false,
        selectionMode: false,
        itemsSelected: {},
        queryFilters: []
    };

    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('should display a dropdown', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(<LibraryItemsListMenuPagination stateItems={stateItems} dispatchItems={dispatchItems} />);
        });

        expect(comp.find(Dropdown)).toHaveLength(1);

        // check button for selection
        expect(comp.text()).toContain('items-menu-dropdown.select-all');
        expect(comp.text()).toContain('items-menu-dropdown.select-visible');

        // check nb items selection
        expect(comp.text()).toContain('items-menu-dropdown.items-display');
    });
});
