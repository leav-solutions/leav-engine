import {mount} from 'enzyme';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {List} from 'semantic-ui-react';
import {displayListItemTypes, OrderSearch} from '../../../../_types/types';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListState} from '../../LibraryItemsListReducer';
import AddFilter from './AddFilter';

describe('AttributeList', () => {
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

    test('should have a List', async () => {
        let comp: any;

        await act(async () => {
            comp = mount(
                <MockedProviderWithFragments>
                    <AddFilter
                        stateItems={stateItems}
                        setFilters={jest.fn()}
                        showAttr={true}
                        setShowAttr={jest.fn()}
                        updateFilters={jest.fn()}
                    />
                </MockedProviderWithFragments>
            );
        });

        expect(comp.find(List)).toHaveLength(1);
    });
});
