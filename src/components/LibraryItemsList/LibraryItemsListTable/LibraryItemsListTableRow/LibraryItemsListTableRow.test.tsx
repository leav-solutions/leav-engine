import {render} from 'enzyme';
import React from 'react';
import {displayListItemTypes, OrderSearch} from '../../../../_types/types';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListReducerAction, LibraryItemListState} from '../../LibraryItemsListReducer';
import LibraryItemsListTableRow from './LibraryItemsListTableRow';

describe('LibraryItemsListTableRow', () => {
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

    test('should call InfosRow', async () => {
        const itemMock = {
            id: 'test',
            label: 'test'
        };

        const stateMock = {...stateItems, columns: [{id: 'infos'}]};

        const comp = render(
            <MockedProviderWithFragments>
                <LibraryItemsListTableRow item={itemMock} stateItems={stateMock} dispatchItems={dispatchItems} />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });
});
