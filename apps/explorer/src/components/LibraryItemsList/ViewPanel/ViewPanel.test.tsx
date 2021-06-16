// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {act, render, screen} from '_tests/testUtils';
import {getViewsListQuery} from '../../../graphQL/queries/views/getViewsListQuery';
import {ViewType} from '../../../_types/types';
import ViewPanel from './ViewPanel';

jest.mock(
    '../View',
    () =>
        function View() {
            return <div>View</div>;
        }
);

describe('ViewPanel', () => {
    const mocks = [
        {
            request: {
                query: getViewsListQuery,
                variables: {
                    libraryId: ''
                }
            },
            result: {
                data: {
                    views: {
                        totalCount: 1,
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
            render(<ViewPanel />, {apolloMocks: mocks});
        });

        expect(screen.getAllByText('View')).toHaveLength(2);
    });
});
