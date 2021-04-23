// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {itemsInitialState} from 'redux/items';
import {RootState} from 'redux/store';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import LibraryItemsListPagination from './LibraryItemsListPagination';

describe('LibraryItemsListPagination', () => {
    const mockState: Partial<RootState> = {items: {...itemsInitialState, pagination: 5, offset: 0, totalCount: 15}};

    test('should have pagination', async () => {
        render(
            <MockStore state={mockState}>
                <LibraryItemsListPagination />
            </MockStore>
        );

        expect(screen.getAllByRole('listitem')).toHaveLength(6); // 3 page, 1 previous, 1 next and 1 size selector
    });
});
