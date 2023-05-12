// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedResponse} from '@apollo/client/testing';
import {getGlobalSettingsQuery} from 'queries/globalSettings/getGlobalSettingsQuery';
import {isAllowedQuery} from 'queries/permissions/isAllowedQuery';
import {getMe} from 'queries/users/me';
import React from 'react';
import {PermissionsActions, PermissionTypes} from '_gqlTypes/globalTypes';
import {act, render, screen} from '_tests/testUtils';
import {mockApplicationDetails} from '__mocks__/common/applications';
import App from '.';
import {getLangs} from 'queries/core/getLangs';
import {getApplicationByEndpointQuery} from 'queries/applications/getApplicationByEndpointQuery';
import {enableFetchMocks} from 'jest-fetch-mock';

enableFetchMocks();

jest.mock('../Home', () => {
    return function Home() {
        return <div>Home</div>;
    };
});

jest.mock('../MessagesDisplay', () => {
    return function MessagesDisplay() {
        return <div>MessagesDisplay</div>;
    };
});

jest.mock('../../../constants', () => ({
    APP_ENDPOINT: 'admin'
}));

test('Renders app', async () => {
    const mocks: MockedResponse[] = [
        {
            request: {
                query: getMe,
                variables: {}
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
                                    fr: 'Utilisateurs'
                                },
                                __typename: 'Library'
                            },
                            label: 'admin',
                            color: null,
                            preview: null,
                            __typename: 'RecordIdentity'
                        },
                        __typename: 'User'
                    }
                }
            }
        },
        {
            request: {
                query: getLangs,
                variables: {}
            },
            result: {
                data: {
                    langs: ['fr']
                }
            }
        },
        {
            request: {
                query: isAllowedQuery,
                variables: {
                    type: PermissionTypes.admin,
                    actions: Object.values(PermissionsActions).filter(a => !!a.match(/^admin_/))
                }
            },
            result: {
                data: {
                    isAllowed: Object.values(PermissionsActions)
                        .filter(a => !!a.match(/^admin_/))
                        .map(action => ({name: action, allowed: true, __typename: 'PermissionAction'}))
                }
            }
        },
        {
            request: {
                query: getApplicationByEndpointQuery,
                variables: {
                    endpoint: 'admin'
                }
            },
            result: {
                data: {
                    applications: {
                        __typename: 'ApplicationsList',
                        list: [mockApplicationDetails]
                    }
                }
            }
        },
        {
            request: {
                query: getGlobalSettingsQuery,
                variables: {}
            },
            result: {
                data: {
                    globalSettings: {
                        __typename: 'GlobalSettings',
                        name: 'my app',
                        icon: null
                    }
                }
            }
        }
    ];

    render(<App />, {apolloMocks: mocks, cacheSettings: {possibleTypes: {Record: ['User']}}});

    expect(await screen.findByText('Home')).toBeInTheDocument();
});
