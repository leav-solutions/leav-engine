import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {DisplayListItemTypes, OrderSearch} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListReducerAction, LibraryItemListState} from '../LibraryItemsListReducer';
import Filters from './Filters';

jest.mock(
    './FilterSeparator',
    () =>
        function FilterSeparator() {
            return <div>FilterSeparator</div>;
        }
);

jest.mock(
    './FilterItem',
    () =>
        function FilterItem() {
            return <div>FilterItem</div>;
        }
);

jest.mock(
    './AddFilter',
    () =>
        function AddFilter() {
            return <div>AddFilter</div>;
        }
);

describe('Filters', () => {
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

    test('check child', async () => {
        let comp: any;
        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <Filters stateItems={stateItems} dispatchItems={dispatchItems} />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find('AddFilter')).toHaveLength(1);
    });
});
