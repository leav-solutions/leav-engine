import {mount} from 'enzyme';
import React from 'react';
import {IItem} from '../../../../_types/types';
import MockedProviderWithFragments from '../../../../__mocks__/MockedProviderWithFragments';
import {LibraryItemListInitialState} from '../../LibraryItemsListReducer';
import RecordPreview from '../../LibraryItemsListTable/RecordPreview';
import ItemTileDisplay from './ItemTileDisplay';

describe('ItemTileDisplay', () => {
    const itemMock: IItem = {
        id: 'test'
    };

    const stateItems = LibraryItemListInitialState;

    test('should call RecordPreview', async () => {
        const stateMock = {
            ...stateItems,
            items: [itemMock]
        };
        const comp = mount(
            <MockedProviderWithFragments>
                <ItemTileDisplay
                    item={itemMock}
                    stateItems={stateMock}
                    dispatchItems={jest.fn()}
                    showRecordEdition={jest.fn()}
                />
            </MockedProviderWithFragments>
        );

        expect(comp.find(RecordPreview)).toHaveLength(1);
    });
});
