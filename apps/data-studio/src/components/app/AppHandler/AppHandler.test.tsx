import {getApplicationByEndpointQuery} from '../../../graphQL/queries/applications/getApplicationByEndpointQuery';
import {getLangs} from '../../../graphQL/queries/core/getLangs';
import {getGlobalSettingsQuery} from '../../../graphQL/queries/globalSettings/getGlobalSettingsQuery';
import {getTasks} from '../../../graphQL/queries/tasks/getTasks';
import {getMe} from '../../../graphQL/queries/userData/me';
import {getTaskUpdates} from '../../../graphQL/subscribes/tasks/getTaskUpdates';
import {act, render, screen} from '../../../_tests/testUtils';
import {mockApplicationDetails} from '../../../__mocks__/common/applications';
import {mockTask} from '../../../__mocks__/common/task';
import AppHandler from './AppHandler';

vi.mock('../../Router', () => ({
    default: function Router() {
        return <div>Router</div>;
    },
}));

vi.mock('../../../constants', async importOriginal => ({
    ...(await importOriginal<object>()),
    APP_ENDPOINT: 'data-studio',
}));

describe('AppHandler', () => {
    test('Should contain Router', async () => {
        const mocks = [
            {
                request: {
                    query: getMe,
                    variables: {},
                },
                result: {
                    data: {
                        me: {
                            login: 'admin',
                            id: '1',
                            whoAmI: {
                                id: '1',
                                label: 'admin',
                                subLabel: 'null',
                                color: null,
                                library: {
                                    id: 'users',
                                    label: {
                                        en: 'Users',
                                        fr: 'Utilisateurs',
                                    },
                                    __typename: 'Library',
                                },
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
                    query: getApplicationByEndpointQuery,
                    variables: {
                        endpoint: 'data-studio',
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
            {
                request: {
                    query: getTasks,
                    variables: {
                        filters: {
                            created_by: '1',
                        },
                    },
                },
                result: {
                    data: {
                        tasks: {
                            list: [mockTask],
                        },
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
                    query: getTaskUpdates,
                    variables: {
                        created_by: '1',
                    },
                },
                result: {
                    data: {
                        tasks: {
                            list: [mockTask],
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
                            name: 'My app',
                            icon: null,
                        },
                    },
                },
            },
        ];

        await act(async () => {
            render(<AppHandler />, {apolloMocks: mocks});
        });

        expect(await screen.findByText('Router')).toBeInTheDocument();
    });
});
