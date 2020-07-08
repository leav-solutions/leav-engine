import {mount} from 'enzyme';
import React from 'react';
import {DisplayListItemTypes, OrderSearch} from '../../../_types/types';
import {LibraryItemListReducerAction, LibraryItemListState} from '../LibraryItemsListReducer';
import LibraryItemsListTable from '../LibraryItemsListTable';
import TileDisplay from '../TileDisplay';
import DisplayTypeSelector from './DisplayTypeSelector';

jest.mock(
    '../TileDisplay',
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
        displayType: DisplayListItemTypes.listSmall,
        showFilters: false,
        selectionMode: false,
        itemsSelected: {},
        queryFilters: [],
        attributes: [],
        columns: []
    };

    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();

    test('Should call ItemsTitleDisplay', async () => {
        const mockState = {...stateItems, displayType: DisplayListItemTypes.tile};
        const comp = mount(<DisplayTypeSelector stateItems={mockState} dispatchItems={dispatchItems} />);

        expect(comp.find(TileDisplay)).toHaveLength(1);
    });

    test('Should call LibraryItemsListTable', async () => {
        const mockState = {...stateItems, displayType: DisplayListItemTypes.listSmall};
        const comp = mount(<DisplayTypeSelector stateItems={mockState} dispatchItems={dispatchItems} />);

        expect(comp.find(LibraryItemsListTable)).toHaveLength(1);
    });

    test('Should call LibraryItemsListTable', async () => {
        const mockState = {...stateItems, displayType: DisplayListItemTypes.listMedium};
        const comp = mount(<DisplayTypeSelector stateItems={mockState} dispatchItems={dispatchItems} />);

        expect(comp.find(LibraryItemsListTable)).toHaveLength(1);
    });

    test('Should call LibraryItemsListTable', async () => {
        const mockState = {...stateItems, displayType: DisplayListItemTypes.listBig};
        const comp = mount(<DisplayTypeSelector stateItems={mockState} dispatchItems={dispatchItems} />);

        expect(comp.find(LibraryItemsListTable)).toHaveLength(1);
    });
});
