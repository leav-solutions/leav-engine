import {type RouteObject} from 'react-router-dom';
import {type MockedResponse} from '@apollo/client/testing';
import {render, screen} from '../../../_tests/testUtils';
import {mockApplicationDetails} from '../../../__mocks__/common/applications';
import App from '.';
import {
    GetApplicationByEndpointDocument,
    GetGlobalSettingsDocument,
    GetLangsDocument,
    IsAllowedDocument,
    MeDocument,
    PermissionsActions,
    PermissionTypes,
} from '../../../_gqlTypes';

vi.mock('../../../config/router/adminRouter', async () => {
    const {createMemoryRouter} = await vi.importActual<{
        createMemoryRouter: (routes: RouteObject[]) => unknown;
    }>('react-router-dom');
    return {
        adminRouter: createMemoryRouter([{path: '/', element: 'Home'}]),
    };
});

vi.mock('../MessagesDisplay', () => ({
    default: function MessagesDisplay() {
        return <div>MessagesDisplay</div>;
    },
}));

vi.mock('../../../constants', async importOriginal => ({
    ...(await importOriginal<object>()),
    APP_ENDPOINT: 'admin',
}));

test('Renders app', async () => {
    const mocks: MockedResponse[] = [
        {
            request: {
                query: MeDocument,
                variables: {},
            },
            result: {
                data: {
                    me: {
                        login: 'admin',
                        whoAmI: {
                            id: '1',
                            library: {
                                id: 'users',
                                label: {
                                    en: 'Users',
                                    fr: 'Utilisateurs',
                                },
                                __typename: 'Library',
                            },
                            label: 'admin',
                            color: null,
                            preview: null,
                            __typename: 'RecordIdentity',
                        },
                        __typename: 'User',
                    },
                },
            },
        },
        {
            request: {
                query: GetLangsDocument,
                variables: {},
            },
            result: {
                data: {
                    langs: ['fr'],
                },
            },
        },
        {
            request: {
                query: IsAllowedDocument,
                variables: {
                    type: PermissionTypes.admin,
                    actions: Object.values(PermissionsActions).filter(a => !!a.match(/^admin_/)),
                },
            },
            result: {
                data: {
                    isAllowed: Object.values(PermissionsActions)
                        .filter(a => !!a.match(/^admin_/))
                        .map(action => ({name: action, allowed: true, __typename: 'PermissionAction'})),
                },
            },
        },
        {
            request: {
                query: GetApplicationByEndpointDocument,
                variables: {
                    endpoint: 'admin',
                },
            },
            result: {
                data: {
                    applications: {
                        __typename: 'ApplicationsList',
                        list: [mockApplicationDetails],
                    },
                },
            },
        },
        {
            request: {
                query: GetGlobalSettingsDocument,
                variables: {},
            },
            result: {
                data: {
                    globalSettings: {
                        __typename: 'GlobalSettings',
                        name: 'my app',
                        icon: null,
                    },
                },
            },
        },
    ];

    render(<App />, {apolloMocks: mocks, cacheSettings: {possibleTypes: {Record: ['User']}}, noRouter: true});

    expect(await screen.findByText('Home')).toBeInTheDocument();
});
