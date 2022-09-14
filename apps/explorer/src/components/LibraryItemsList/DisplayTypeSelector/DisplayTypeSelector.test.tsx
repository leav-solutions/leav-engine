// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {render, screen} from '_tests/testUtils';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import DisplayTypeSelector from './DisplayTypeSelector';

jest.mock(
    '../TileDisplay',
    () =>
        function ItemsTitleDisplay() {
            return <div>ItemsTitleDisplay</div>;
        }
);

jest.mock(
    '../LibraryItemsListTable',
    () =>
        function LibraryItemsListTable() {
            return <div>LibraryItemsListTable</div>;
        }
);

describe('DisplayTypeSelector', () => {
    test('Should call LibraryItemsListTable', async () => {
        render(
            <MockStore>
                <DisplayTypeSelector />
            </MockStore>
        );

        expect(screen.getByText('LibraryItemsListTable')).toBeInTheDocument();
    });
});
