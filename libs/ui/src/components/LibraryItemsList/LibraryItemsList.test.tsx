// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {AttributeType} from '_ui/_gqlTypes';
import {getRecordsFromLibraryQuery} from '_ui/_queries/records/getRecordsFromLibraryQuery';
import {getUserDataQuery} from '_ui/_queries/userData/getUserData';
import {act, render, screen, waitFor} from '_ui/_tests/testUtils';
import {mockGetLibraryDetailExtendedElement} from '_ui/__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import {
    mockGetRecordsFromLibraryQuery,
    mockGetRecordsFromLibraryQueryVar
} from '_ui/__mocks__/mockQuery/mockGetRecordsFromLibraryQuery';
import LibraryItemsList from './LibraryItemsList';

jest.mock('_ui/hooks/useGetRecordUpdatesSubscription', () => ({
    useGetRecordUpdatesSubscription: jest.fn()
}));

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({libId: 'test', libQueryName: 'test', filterName: 'TestFilter'})),
    useHistory: jest.fn()
}));

jest.mock(
    './Sidebar',
    () =>
        function Sidebar() {
            return <div>Sidebar</div>;
        }
);
jest.mock(
    './MenuItemList',
    () =>
        function MenuItemList() {
            return <div>MenuItemList</div>;
        }
);
jest.mock(
    './MenuItemListSelected',
    () =>
        function MenuItemListSelected() {
            return <div>MenuItemListSelected</div>;
        }
);
jest.mock(
    './DisplayTypeSelector',
    () =>
        function DisplayTypeSelector() {
            return <div>DisplayTypeSelector</div>;
        }
);

describe('LibraryItemsList', () => {
    const libQueryName = 'test';

    const mockStateItem = {
        pagination: 20,
        offset: 0,
        field: [
            {
                id: 'testId',
                label: 'Test',
                library: 'testLib',
                type: AttributeType.simple,
                key: 'testId_testLib'
            }
        ]
    };

    test('should call the child', async () => {
        const mocks = [
            {
                request: {
                    query: getRecordsFromLibraryQuery([], true),
                    variables: mockGetRecordsFromLibraryQueryVar
                },
                result: {
                    data: mockGetRecordsFromLibraryQuery(libQueryName, mockStateItem.field)
                }
            },
            {
                request: {
                    query: getUserDataQuery,
                    variables: {keys: ['selected_view_test']}
                },
                result: {
                    data: {
                        userData: {
                            global: false,
                            data: []
                        }
                    }
                }
            }
        ];

        await act(async () => {
            render(<LibraryItemsList library={mockGetLibraryDetailExtendedElement} selectionMode={true} />, {
                mocks
            });
        });

        await waitFor(() => screen.getByText('DisplayTypeSelector'));

        expect(screen.getByText('Sidebar')).toBeInTheDocument();
        expect(screen.getByText('MenuItemList')).toBeInTheDocument();
        expect(screen.getByText('DisplayTypeSelector')).toBeInTheDocument();
    });
});
