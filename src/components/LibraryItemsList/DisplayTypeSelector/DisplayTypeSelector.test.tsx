import {mount} from 'enzyme';
import React from 'react';
import {displayListItemTypes, OrderSearch} from '../../../_types/types';
import ItemsTitleDisplay from '../ItemsTitleDisplay';
import {LibraryItemListReducerAction, LibraryItemListState} from '../LibraryItemsListReducer';
import LibraryItemsListTable from '../LibraryItemsListTable';
import DisplayTypeSelector from './DisplayTypeSelector';

jest.mock(
    '../ItemsTitleDisplay',
    () =>
        function ItemsTitleDisplay() {
            return <div>ItemsTitleDisplay</div>;
        }
);

jest.mock(
    '../LibraryItemsListTable',
    () =>
        function LibraryItemsListTable() {
            return <div>LibraryItemsListTable</div>;
        }
);

describe('DisplayTypeSelector', () => {
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

    test('Should call ItemsTitleDisplay', async () => {
        const mockState = {...stateItems, displayType: displayListItemTypes.tile};
        const comp = mount(<DisplayTypeSelector stateItems={mockState} dispatchItems={dispatchItems} />);

        expect(comp.find(ItemsTitleDisplay)).toHaveLength(1);
    });

    test('Should call LibraryItemsListTable', async () => {
        const mockState = {...stateItems, displayType: displayListItemTypes.listSmall};
        const comp = mount(<DisplayTypeSelector stateItems={mockState} dispatchItems={dispatchItems} />);

        expect(comp.find(LibraryItemsListTable)).toHaveLength(1);
    });

    test('Should call LibraryItemsListTable', async () => {
        const mockState = {...stateItems, displayType: displayListItemTypes.listMedium};
        const comp = mount(<DisplayTypeSelector stateItems={mockState} dispatchItems={dispatchItems} />);

        expect(comp.find(LibraryItemsListTable)).toHaveLength(1);
    });

    test('Should call LibraryItemsListTable', async () => {
        const mockState = {...stateItems, displayType: displayListItemTypes.listBig};
        const comp = mount(<DisplayTypeSelector stateItems={mockState} dispatchItems={dispatchItems} />);

        expect(comp.find(LibraryItemsListTable)).toHaveLength(1);
    });
});
