// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ISearchState} from 'hooks/useSearchReducer/_types';
import React from 'react';
import {render, screen} from '_tests/testUtils';
import MockSearchContextProvider from '__mocks__/common/mockSearch/mockSearchContextProvider';
import {mockRecordWhoAmI} from '__mocks__/common/record';
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
        const mockState: Partial<ISearchState> = {
            records: [
                {
                    fields: {},
                    whoAmI: {
                        ...mockRecordWhoAmI,
                        id: 'test'
                    },
                    index: 0
                }
            ]
        };

        render(
            <MockSearchContextProvider state={mockState}>
                <TileDisplay />
            </MockSearchContextProvider>
        );

        expect(screen.getByText('ItemTileDisplay')).toBeInTheDocument();
        expect(screen.getByText('LibraryItemsListPagination')).toBeInTheDocument();
    });
});
