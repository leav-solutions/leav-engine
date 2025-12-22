// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type match} from 'react-router-dom-v5';
import {render, screen} from '_tests/testUtils';
import {type Mockify} from '_types/Mockify';
import {mockApplicationDetails} from '__mocks__/common/applications';
import EditApplication, {type IEditApplicationMatchParams} from './EditApplication';
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

jest.mock('react-router-v5', () => ({
    ...jest.requireActual('react-router-v5'),
    useLocation: () => ({hash: ''}),
}));

describe('EditApplication', () => {
    type MatchType = match<IEditApplicationMatchParams>;
    test('Edit existing app', async () => {
        const mockMatch: Mockify<MatchType> = {
            params: {id: mockApplicationDetails.id},
        };

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

        render(<EditApplication match={mockMatch as MatchType} />, {
            apolloMocks: mocks,
            routerProps: {
                initialEntries: [`/applications/edit/${mockApplicationDetails.id}`],
            },
        });

        expect(screen.getByText(/loading/)).toBeInTheDocument();

        expect(await screen.findByText(mockApplicationDetails.label.en)).toBeInTheDocument();
        expect(screen.getByText('InfosTab')).toBeInTheDocument();
        expect(screen.getByText(/admin.permissions/)).toBeInTheDocument();
        expect(screen.getByText(/settings/)).toBeInTheDocument();
    });

    test('Edit new app', async () => {
        const mockMatch: Mockify<MatchType> = {
            params: {id: null},
        };

        render(<EditApplication match={mockMatch as MatchType} />);

        expect(screen.getByText(/applications.new/)).toBeInTheDocument();
        expect(screen.getByText('InfosTab')).toBeInTheDocument();
        expect(screen.queryByText(/admin.permissions/)).not.toBeInTheDocument();
    });

    test('Display a link to open app', async () => {
        const mockMatch: Mockify<MatchType> = {
            params: {id: mockApplicationDetails.id},
        };

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

        render(<EditApplication match={mockMatch as MatchType} />, {apolloMocks: mocks});

        expect(screen.getByText(/loading/)).toBeInTheDocument();

        expect(await screen.findByRole('link', {name: /open/})).toBeInTheDocument();
    });
});
