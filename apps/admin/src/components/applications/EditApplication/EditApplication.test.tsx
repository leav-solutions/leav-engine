// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '_tests/testUtils';
import {mockApplicationDetails} from '__mocks__/common/applications';
import EditApplication from './EditApplication';
import {GetApplicationByIdDocument} from '_gqlTypes';

jest.mock(
    './EditApplicationTabs/InfosTab',
    () =>
        function InfosTab() {
            return <div>InfosTab</div>;
        },
);

jest.mock(
    './EditApplicationTabs/PermissionsTab',
    () =>
        function PermissionsTab() {
            return <div>PermissionsTab</div>;
        },
);

jest.mock(
    './EditApplicationTabs/SettingsTab',
    () =>
        function SettingsTab() {
            return <div>SettingsTab</div>;
        },
);

const mockUseParams = jest.fn().mockReturnValue({id: mockApplicationDetails.id});

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
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
