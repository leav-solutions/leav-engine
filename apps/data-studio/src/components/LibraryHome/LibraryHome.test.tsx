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

jest.mock('components/LibraryItemsList', () => {
    return function LibraryItemsList() {
        return <div>LibraryItemsList</div>;
    };
});

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({libId: 'test', libQueryName: 'test', filterName: 'TestFilter'})),
    useHistory: jest.fn()
}));

jest.mock('../../hooks/LangHook/LangHook');

const mockUpdateActiveLib = jest.fn();

jest.mock('hooks/ActiveLibHook/ActiveLibHook', () => ({
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
