import {render} from 'enzyme';
import React from 'react';
import {displayListItemTypes} from '../../../../_types/types';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListReducerAction, LibraryItemListState} from '../../LibraryItemsListReducer';
import LibraryItemsListTableRow from './LibraryItemsListTableRow';
describe('LibraryItemsListTableRow', () => {
    test('Snapshot test', async () => {
        const itemMock = {
            id: 'test',
            label: 'test'
        };

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

        const comp = render(
            <MockedProviderWithFragments>
                <LibraryItemsListTableRow item={itemMock} stateItems={stateItems} dispatchItems={dispatchItems} />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });
});
