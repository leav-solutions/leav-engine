// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getLibraryDetailExtendedQuery} from 'graphQL/queries/libraries/getLibraryDetailExtendQuery';
import {RootState} from 'reduxStore/store';
import {InfoType, WorkspacePanels} from '_types/types';
import {mockActiveLibrary} from '__mocks__/common/activeLibrary';
import {
    mockGetLibraryDetailExtendedQuery,
    mockGetLibraryDetailExtendedQueryVar
} from '__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';

jest.mock('@leav/ui', () => ({
    ...jest.requireActual('@leav/ui'),
    LibraryItemsList: () => <div>LibraryItemsList</div>
}));

const mockUpdateActiveLib = jest.fn();

jest.mock('hooks/useActiveLibrary', () => ({
    useActiveLibrary: () => [mockActiveLibrary, mockUpdateActiveLib]
}));

describe('LibraryHome', () => {
    const mockStoreState: Partial<RootState> = {
        info: {
            base: {
                content: 'base info',
                type: InfoType.basic
            },
            stack: []
        },
        activePanel: WorkspacePanels.LIBRARY
    };

    const mocks = [
        {
            request: {
                query: getLibraryDetailExtendedQuery,
                variables: mockGetLibraryDetailExtendedQueryVar
            },
            result: {
                data: mockGetLibraryDetailExtendedQuery
            }
        }
    ];

    beforeEach(() => jest.clearAllMocks());

    test('Load library research', async () => {
        // await act(async () => {
        //     render(<LibraryHome library={mockGetLibraryDetailExtendedQueryVar.libId} />, {
        //         apolloMocks: mocks,
        //         storeState: mockStoreState
        //     });
        // });
        // await waitFor(() => screen.getByText('LibraryItemsList'));
        // expect(screen.getByText('LibraryItemsList')).toBeInTheDocument();
    });

    test('Update active library', async () => {
        // await act(async () => {
        //     render(<LibraryHome library={mockGetLibraryDetailExtendedQueryVar.libId} />, {
        //         apolloMocks: mocks,
        //         storeState: mockStoreState
        //     });
        // });
        // await waitFor(() => screen.getByText('LibraryItemsList'));
        // expect(mockUpdateActiveLib).toBeCalled();
    });
});
