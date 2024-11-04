// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {QueryResult} from '@apollo/client';
import {Mockify, WithTypename} from '@leav/utils';
import * as gqlTypes from '_ui/_gqlTypes';
import {getUserDataQuery} from '_ui/_queries/userData/getUserData';
import {getViewsListQuery} from '_ui/_queries/views/getViewsListQuery';
import {render, screen} from '_ui/_tests/testUtils';
import MockSearchContextProvider from '_ui/__mocks__/common/mockSearchContextProvider';
import {mockGetLibraryDetailExtendedElement} from '_ui/__mocks__/mockQuery/mockGetLibraryDetailExtendedQuery';
import ViewPanel from './ViewPanel';

jest.mock(
    './View',
    () =>
        function View() {
            return <div>View</div>;
        }
);

describe('ViewPanel', () => {
    const mockView: WithTypename<gqlTypes.ViewDetailsFragment> = {
        __typename: 'View',
        id: 'id',
        display: {type: gqlTypes.ViewTypes.list, size: gqlTypes.ViewSizes.MEDIUM},
        shared: false,
        created_by: {
            __typename: 'User',
            id: '1',
            whoAmI: {
                id: '1',
                label: null,
                library: {
                    id: 'users'
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
        filters: [] as any,
        sort: {
            __typename: 'RecordSort',
            field: 'id',
            order: gqlTypes.SortOrder.asc
        },
        valuesVersions: [] as any,
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
        const mockResultGetViewsList: Mockify<typeof gqlTypes.useGetViewsListQuery> = {
            loading: false,
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
            },
            called: true
        };
        jest.spyOn(gqlTypes, 'useGetViewsListQuery').mockImplementation(
            () => mockResultGetViewsList as QueryResult<gqlTypes.GetViewsListQuery, gqlTypes.GetViewsListQueryVariables>
        );

        render(
            <MockSearchContextProvider>
                <ViewPanel />
            </MockSearchContextProvider>,
            {
                mocks,
                cacheSettings: {
                    possibleTypes: {
                        Record: ['User']
                    }
                }
            }
        );

        expect(screen.getAllByText('View')).toHaveLength(2);
    });
});
