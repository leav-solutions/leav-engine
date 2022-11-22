// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {WithTypename} from '@leav/utils';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import React from 'react';
import {GET_VIEWS_LIST_views_list} from '_gqlTypes/GET_VIEWS_LIST';
import {SortOrder, ViewSizes, ViewTypes} from '_gqlTypes/globalTypes';
import {act, render, screen} from '_tests/testUtils';
import MockSearchContextProvider from '__mocks__/common/mockSearch/mockSearchContextProvider';
import {mockGetLibraryDetailExtendedElement} from '__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import {getViewsListQuery} from '../../../graphQL/queries/views/getViewsListQuery';
import ViewPanel from './ViewPanel';

jest.mock(
    './View',
    () =>
        function View() {
            return <div>View</div>;
        }
);

describe('ViewPanel', () => {
    const mockView: WithTypename<GET_VIEWS_LIST_views_list> = {
        __typename: 'View',
        id: 'id',
        display: {type: ViewTypes.list, size: ViewSizes.MEDIUM},
        shared: false,
        created_by: {
            __typename: 'User',
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
            __typename: 'RecordSort',
            field: 'id',
            order: SortOrder.asc
        },
        valuesVersions: [],
        settings: null
    };

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
                            mockView,
                            {
                                ...mockView,
                                id: 'otherId'
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
                {
                    apolloMocks: mocks,
                    cacheSettings: {
                        possibleTypes: {
                            Record: ['User']
                        }
                    }
                }
            );
        });

        expect(screen.getAllByText('View')).toHaveLength(2);
    });
});
