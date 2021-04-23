// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mount} from 'enzyme';
import React from 'react';
import {itemsInitialState} from 'redux/items';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {IItem} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
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
    test('Check render', async () => {
        const itemsMock: IItem[] = [
            {
                fields: {},
                whoAmI: {
                    id: 'test'
                },
                index: 0
            }
        ];

        const stateMock = {items: {...itemsInitialState, items: itemsMock}};

        const comp = mount(
            <MockedProviderWithFragments>
                <MockStore state={stateMock}>
                    <TileDisplay />
                </MockStore>
            </MockedProviderWithFragments>
        );

        expect(comp.find('ItemTileDisplay')).toHaveLength(1);
        expect(comp.find('LibraryItemsListPagination')).toHaveLength(1);
    });
});
