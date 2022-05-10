// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getApplicationByIdQuery} from 'graphQL/queries/applications/getApplicationByIdQuery';
import {getMe} from 'graphQL/queries/userData/me';
import React from 'react';
import {render, screen} from '_tests/testUtils';
import {mockApplicationDetails} from '__mocks__/common/applications';
import AppHandler from './AppHandler';

jest.mock(
    '../../Router',
    () =>
        function Router() {
            return <div>Router</div>;
        }
);

describe('AppHandler', () => {
    test('Should contain Router', async () => {
        process.env.REACT_APP_APPLICATION_ID = mockApplicationDetails.id;

        const mocks = [
            {
                request: {
                    query: getMe,
                    variables: {}
                },
                result: {
                    data: {
                        me: {
                            login: 'admin',
                            id: '1',
                            whoAmI: {
                                id: '1',
                                label: 'admin',
                                color: null,
                                library: {
                                    id: 'users',
                                    label: {
                                        en: 'Users',
                                        fr: 'Utilisateurs'
                                    },
                                    gqlNames: {
                                        query: 'users',
                                        type: 'User',
                                        __typename: 'LibraryGraphqlNames'
                                    },
                                    __typename: 'Library'
                                },
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
                    query: getApplicationByIdQuery,
                    variables: {
                        id: mockApplicationDetails.id
                    }
                },
                result: {
                    data: {
                        applications: {
                            list: [mockApplicationDetails]
                        }
                    }
                }
            }
        ];
        render(<AppHandler />, {apolloMocks: mocks});

        expect(await screen.findByText('Router')).toBeInTheDocument();
    });
});
