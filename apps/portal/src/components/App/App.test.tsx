import {getApplicationsEventsSubscription} from '../../queries/applications/getApplicationsEventsSubscription';
import {getGlobalSettingsQuery} from '../../queries/globalSettings/getGlobalSettingsQuery';
import {getMe} from '../../queries/me/me';
import {mockUser} from '../../_tests/mocks/user';
import {render, screen} from '../../_tests/testUtils';
import App from './App';
import {getApplicationsQuery} from '../../queries/applications/getApplicationsQuery';
import {getLangs} from '../../queries/core/getLangs';

vi.mock('../UserMenu', () => ({
    default: function UserMenu() {
        return <div>UserMenu</div>;
    },
}));

vi.mock('../Applications', () => ({
    default: function Applications() {
        return <div>Applications</div>;
    },
}));

vi.mock('../../constants', async () => ({
    ...(await vi.importActual<object>('../../constants')),
    APP_ENDPOINT: 'portal',
}));

vi.mock('../../hooks/useApplicationEventsSubscription', () => ({
    useApplicationEventsSubscription: vi.fn(),
}));

describe('App', () => {
    test('Render test', async () => {
        const mocks = [
            {
                request: {
                    query: getMe,
                    variables: {},
                },
                result: {
                    data: {
                        me: mockUser,
                    },
                },
            },
            {
                request: {
                    query: getLangs,
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
                    query: getApplicationsQuery,
                    variables: {
                        filters: {endpoint: 'portal'},
                    },
                },
                result: {
                    data: {
                        applications: {
                            __typename: 'ApplicationsList',
                            list: [
                                {
                                    id: 'portal',
                                    label: {fr: 'Portal'},
                                    description: {fr: 'Portal'},
                                    endpoint: '/portal',
                                },
                            ],
                        },
                    },
                },
            },
            {
                request: {
                    query: getGlobalSettingsQuery,
                    variables: {},
                },
                result: {
                    data: {
                        globalSettings: {
                            __typename: 'GlobalSettings',
                            name: 'My App',
                            icon: null,
                        },
                    },
                },
            },
            {
                request: {
                    query: getApplicationsEventsSubscription,
                    variables: {},
                },
                result: {
                    data: {
                        applicationsEvents: null,
                    },
                },
            },
        ];

        render(<App />, {apolloMocks: mocks});

        expect(await screen.findByText('UserMenu')).toBeInTheDocument();
        expect(screen.getByText('Applications')).toBeInTheDocument();
    });
});
