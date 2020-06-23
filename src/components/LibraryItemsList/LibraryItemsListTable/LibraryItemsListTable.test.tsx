import {render} from 'enzyme';
import React from 'react';
import {displayListItemTypes} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListReducerAction, LibraryItemListState} from '../LibraryItemsListReducer';
import LibraryItemsListTable from './LibraryItemsListTable';

jest.mock(
    './LibraryItemsListTableRow',
    () =>
        function LibraryItemsListTableRow() {
            return <div>LibraryItemsListTableRow</div>;
        }
);

jest.mock(
    '../LibraryItemsListPagination',
    () =>
        function LibraryItemsListPagination() {
            return <div>LibraryItemsListPagination</div>;
        }
);

describe('LibraryItemsListTable', () => {
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
        const comp = render(
            <MockedProviderWithFragments>
                <LibraryItemsListTable stateItems={stateItems} dispatchItems={dispatchItems} />
            </MockedProviderWithFragments>
        );

        expect(comp).toMatchSnapshot();
    });
});
