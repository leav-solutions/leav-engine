// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getLibraryDetailExtendedQuery} from '_ui/_queries/libraries/getLibraryDetailExtendQuery';
import {render, screen, waitFor} from '_ui/_tests/testUtils';
import {
    mockGetLibraryDetailExtendedQuery,
    mockGetLibraryDetailExtendedQueryVar
} from '_ui/__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import SearchModal from './SearchModal';

jest.mock('_ui/components/LibraryItemsList', () => ({
    LibraryItemsList: () => <div>LibraryItemsList</div>
}));

describe('SearchModal', () => {
    test('should contain LibraryItemsList', async () => {
        const mocks = [
            {
                request: {
                    query: getLibraryDetailExtendedQuery(100),
                    variables: mockGetLibraryDetailExtendedQueryVar
                },
                result: {
                    data: mockGetLibraryDetailExtendedQuery
                }
            }
        ];

        render(<SearchModal libId="test" visible={true} setVisible={jest.fn()} submitAction={jest.fn()} />, {
            mocks
        });

        await waitFor(() => screen.getByText('LibraryItemsList'));

        expect(screen.getByText('LibraryItemsList')).toBeInTheDocument();
    });
});
