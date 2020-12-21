// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {IItem} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
import LibraryItemsListPagination from '../LibraryItemsListPagination';
import {LibraryItemListInitialState, LibraryItemListReducerAction} from '../LibraryItemsListReducer';
import ItemTileDisplay from './ItemTileDisplay';
import TileDisplay from './TileDisplay';

jest.mock(
    '../LibraryItemsListPagination',
    () =>
        function LibraryItemsListPagination() {
            return <div>LibraryItemsListPagination</div>;
        }
);

jest.mock(
    './ItemTileDisplay',
    () =>
        function ItemTileDisplay() {
            return <div>ItemTileDisplay</div>;
        }
);

jest.mock(
    '../LibraryItemsListTable/LibraryItemsModal',
    () =>
        function LibraryItemsModal() {
            return <div>LibraryItemsModal</div>;
        }
);

describe('TileDisplay', () => {
    const stateItems = LibraryItemListInitialState;

    const dispatchItems: React.Dispatch<LibraryItemListReducerAction> = jest.fn();
    test('Check render', async () => {
        const itemsMock: IItem[] = [
            {
                id: 'test'
            }
        ];

        const stateMock = {...stateItems, items: itemsMock, itemsLoading: false};
        const comp = mount(
            <MockedProviderWithFragments>
                <TileDisplay stateItems={stateMock} dispatchItems={dispatchItems} />
            </MockedProviderWithFragments>
        );

        expect(comp.find(ItemTileDisplay)).toHaveLength(1);
        expect(comp.find(LibraryItemsListPagination)).toHaveLength(1);
    });
});
