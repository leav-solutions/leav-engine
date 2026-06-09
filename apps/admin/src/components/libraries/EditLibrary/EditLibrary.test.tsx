import {mockLibrary} from '../../../__mocks__/libraries';
import {PermissionsActions, GetLibByIdDocument} from '../../../_gqlTypes';
import {render, screen} from '../../../_tests/testUtils';
import EditLibrary from './EditLibrary';

vi.mock('./EditLibraryTabs', () => ({
    default: function EditLibraryTabs() {
        return <div>EditLibraryTabs</div>;
    },
}));

const mockUseParams = vi.fn().mockReturnValue({id: 'test'});

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual<object>('react-router-dom')),
    useParams: () => mockUseParams(),
}));

describe('EditLibrary', () => {
    test('Render tabs when editing library', async () => {
        const mocks = [
            {
                request: {
                    query: GetLibByIdDocument,
                    variables: {
                        id: ['test'],
                    },
                },
                result: {
                    data: {
                        libraries: {
                            list: [
                                {
                                    ...mockLibrary,
                                },
                            ],
                        },
                    },
                },
            },
        ];

        render(<EditLibrary />, {apolloMocks: mocks});

        expect(screen.getByText(/loading/)).toBeInTheDocument();

        expect(await screen.findByText('EditLibraryTabs')).toBeInTheDocument();
    });

    test('Render tabs when creating library', async () => {
        mockUseParams.mockReturnValueOnce({id: undefined});

        render(<EditLibrary />);

        expect(screen.getByText('EditLibraryTabs')).toBeInTheDocument();
    });

    test('Display error if not allowed to create', async () => {
        mockUseParams.mockReturnValueOnce({id: undefined});

        render(<EditLibrary />, {
            userPermissions: {[PermissionsActions.admin_create_library]: false},
        });

        expect(screen.getByText('errors.access_denied')).toBeInTheDocument();
    });

    test('Display error if unknown library', async () => {
        const mocks = [
            {
                request: {
                    query: GetLibByIdDocument,
                    variables: {
                        id: ['test'],
                    },
                },
                result: {
                    data: {
                        libraries: {
                            list: [],
                        },
                    },
                },
            },
        ];

        render(<EditLibrary />, {apolloMocks: mocks});

        expect(screen.getByText(/loading/)).toBeInTheDocument();

        expect(await screen.findByText(/unknown_library/)).toBeInTheDocument();
    });
});
