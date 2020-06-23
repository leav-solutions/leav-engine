import {render} from 'enzyme';
import React from 'react';
import {displayListItemTypes} from '../../../_types/types';
import {LibraryItemListReducerAction, LibraryItemListState} from '../LibraryItemsListReducer';
import DisplayTypeSelector from './DisplayTypeSelector';

describe('DisplayTypeSelector', () => {
    test('Snapshot test', async () => {
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

        const comp = render(<DisplayTypeSelector stateItems={stateItems} dispatchItems={dispatchItems} />);

        expect(comp).toMatchSnapshot();
    });
});
