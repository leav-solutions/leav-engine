// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ISearchState} from '_ui/components/LibraryItemsList/hooks/useSearchReducer/_types';
import {render, screen} from '_ui/_tests/testUtils';
import MockSearchContextProvider from '_ui/__mocks__/common/mockSearchContextProvider';
import LibraryItemsListPagination from './LibraryItemsListPagination';

describe('LibraryItemsListPagination', () => {
    test('should have pagination', async () => {
        const mockState: Partial<ISearchState> = {pagination: 5, offset: 0, totalCount: 15};
        render(
            <MockSearchContextProvider state={mockState}>
                <LibraryItemsListPagination />
            </MockSearchContextProvider>
        );

        expect(screen.getAllByRole('listitem')).toHaveLength(6); // 3 page, 1 previous, 1 next and 1 size selector
    });
});
