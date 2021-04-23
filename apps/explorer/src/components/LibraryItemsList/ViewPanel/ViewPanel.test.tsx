// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {render, screen} from '@testing-library/react';
import React from 'react';
import {act} from 'react-dom/test-utils';
import {itemsInitialState} from 'redux/items';
import MockStore from '__mocks__/common/mockRedux/mockStore';
import {getViewsListQuery} from '../../../graphQL/queries/views/getViewsListQuery';
import {ViewType} from '../../../_types/types';
import MockedProviderWithFragments from '../../../__mocks__/MockedProviderWithFragments';
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
                                            id: 'users'
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
            const mockState = {items: {...itemsInitialState, loading: false}};

            render(
                <MockedProviderWithFragments mocks={mocks} addTypename={true}>
                    <MockStore state={mockState}>
                        <ViewPanel />
                    </MockStore>
                </MockedProviderWithFragments>
            );
        });

        expect(screen.getAllByText('View')).toHaveLength(2);
    });
});
