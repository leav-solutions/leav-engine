// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import MockSearchContextProvider from '__mocks__/common/mockSearch/mockSearchContextProvider';
import {mockGetLibraryDetailExtendedElement} from '__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import {getViewsListQuery} from '../../../graphQL/queries/views/getViewsListQuery';
import {ViewType} from '../../../_types/types';
import ViewPanel from './ViewPanel';

jest.mock(
    './View',
    () =>
        function View() {
            return <div>View</div>;
        }
);

describe('ViewPanel', () => {
    const mocks = [
        {
            request: {
                query: getUserDataQuery,
                variables: {
                    keys: [
                        'user_views_order_' + mockGetLibraryDetailExtendedElement.id,
                        'shared_views_order_' + mockGetLibraryDetailExtendedElement.id
                    ]
                }
            },
            result: {
                data: {
                    userData: {
                        __typename: 'UserData',
                        global: false,
                        data: {
                            ['user_views_order_' + mockGetLibraryDetailExtendedElement.id]: [],
                            ['shared_views_order_' + mockGetLibraryDetailExtendedElement.id]: []
                        }
                    }
                }
            }
        },
        {
            request: {
                query: getViewsListQuery,
                variables: {
                    libraryId: mockGetLibraryDetailExtendedElement.id
                }
            },
            result: {
                data: {
                    views: {
                        totalCount: 2,
                        list: [
                            {
                                id: 'id',
                                type: ViewType.list,
                                shared: false,
                                created_by: {
                                    id: '1',
                                    whoAmI: {
                                        id: '1',
                                        label: null,
                                        library: {
                                            id: 'users',
                                            gqlNames: {
                                                query: 'users',
                                                type: 'Users'
                                            }
                                        }
                                    }
                                },
                                label: {
                                    fr: 'list',
                                    en: 'list'
                                },
                                description: {
                                    fr: 'this is a list ',
                                    en: 'this is a list '
                                },
                                color: '#e48232',
                                filters: [],
                                sort: {
                                    field: 'id',
                                    order: 'asc'
                                },
                                settings: null
                            },
                            {
                                id: 'otherId',
                                type: ViewType.cards,
                                shared: true,
                                created_by: {
                                    id: '1',
                                    whoAmI: {
                                        id: '1',
                                        label: null,
                                        library: {
                                            id: 'users',
                                            gqlNames: {
                                                query: 'users',
                                                type: 'Users'
                                            }
                                        }
                                    }
                                },
                                label: {
                                    fr: 'cards',
                                    en: 'cards'
                                },
                                description: {
                                    fr: 'this is a test ',
                                    en: 'this is a test '
                                },
                                color: '#e48232',
                                filters: [],
                                sort: {
                                    field: 'id',
                                    order: 'asc'
                                },
                                settings: null
                            }
                        ]
                    }
                }
            }
        }
    ];

    test('should display n View', async () => {
        await act(async () => {
            render(
                <MockSearchContextProvider>
                    <ViewPanel />
                </MockSearchContextProvider>,
                {apolloMocks: mocks}
            );
        });

        expect(screen.getAllByText('View')).toHaveLength(2);
    });
});
