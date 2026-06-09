import {render, screen} from '../../../_tests/testUtils';
import {mockApplicationDetails} from '../../../__mocks__/common/applications';
import EditApplication from './EditApplication';
import {GetApplicationByIdDocument} from '../../../_gqlTypes';

vi.mock('./EditApplicationTabs/InfosTab', () => ({
    default: function InfosTab() {
        return <div>InfosTab</div>;
    },
}));

vi.mock('./EditApplicationTabs/PermissionsTab', () => ({
    default: function PermissionsTab() {
        return <div>PermissionsTab</div>;
    },
}));

vi.mock('./EditApplicationTabs/SettingsTab', () => ({
    default: function SettingsTab() {
        return <div>SettingsTab</div>;
    },
}));

const mockUseParams = vi.fn().mockReturnValue({id: mockApplicationDetails.id});

vi.mock('react-router-dom', async () => ({
    ...(await vi.importActual<object>('react-router-dom')),
    useLocation: () => ({hash: ''}),
    useParams: () => mockUseParams(),
}));

describe('EditApplication', () => {
    test('Edit existing app', async () => {
        const mocks = [
            {
                request: {
                    query: GetApplicationByIdDocument,
                    variables: {
                        id: mockApplicationDetails.id,
                    },
                },
                result: {
                    data: {
                        applications: {
                            list: [mockApplicationDetails],
                        },
                    },
                },
            },
        ];

        render(<EditApplication />, {apolloMocks: mocks});

        expect(screen.getByText(/loading/)).toBeInTheDocument();

        expect(await screen.findByText(mockApplicationDetails.label.en)).toBeInTheDocument();
        expect(screen.getByText('InfosTab')).toBeInTheDocument();
        expect(screen.getByText(/admin.permissions/)).toBeInTheDocument();
        expect(screen.getByText(/settings/)).toBeInTheDocument();
    });

    test('Edit new app', async () => {
        mockUseParams.mockReturnValueOnce({id: undefined});

        render(<EditApplication />);

        expect(screen.getByText(/applications.new/)).toBeInTheDocument();
        expect(screen.getByText('InfosTab')).toBeInTheDocument();
        expect(screen.queryByText(/admin.permissions/)).not.toBeInTheDocument();
    });

    test('Display a link to open app', async () => {
        const mocks = [
            {
                request: {
                    query: GetApplicationByIdDocument,
                    variables: {
                        id: mockApplicationDetails.id,
                    },
                },
                result: {
                    data: {
                        applications: {
                            list: [mockApplicationDetails],
                        },
                    },
                },
            },
        ];

        render(<EditApplication />, {apolloMocks: mocks});

        expect(screen.getByText(/loading/)).toBeInTheDocument();

        expect(await screen.findByRole('link', {name: /open/})).toBeInTheDocument();
    });
});
