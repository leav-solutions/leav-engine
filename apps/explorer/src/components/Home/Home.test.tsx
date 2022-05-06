// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {getLibrariesListQuery} from 'graphQL/queries/libraries/getLibrariesListQuery';
import {getTreeListQuery} from 'graphQL/queries/trees/getTreeListQuery';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import React from 'react';
import {MemoryRouter} from 'react-router-dom';
import {act, render, screen, within} from '_tests/testUtils';
import {mockApplicationDetails} from '__mocks__/common/applications';
import Home from './Home';
import {FAVORITE_LIBRARIES_KEY} from './LibrariesList/LibrariesList';
import {FAVORITE_TREES_KEY} from './TreeList/TreeList';

jest.mock('./LibrariesList/ImportModal', () => {
    return function ImportModal() {
        return <div>ImportModal</div>;
    };
});

describe('Home', () => {
    const mocks = [
        {
            request: {
                query: getLibrariesListQuery
            },
            result: {
                data: {
                    libraries: {
                        __typename: 'LibrariesList',
                        list: [
                            {
                                __typename: 'Library',
                                id: 'test',
                                system: false,
                                label: {fr: 'First lib'},
                                gqlNames: {
                                    __typename: 'Test',
                                    query: 'test',
                                    filter: 'TestFilter',
                                    searchableFields: 'TestSearch'
                                },
                                attributes: {
                                    __typename: 'Attribute',
                                    id: 'string',
                                    type: 'string',
                                    format: 'string',
                                    label: {}
                                },
                                permissions: {
                                    access_library: true,
                                    access_record: true,
                                    edit_record: true,
                                    create_record: true,
                                    delete_record: true
                                }
                            },
                            {
                                __typename: 'Library',
                                id: 'test2',
                                system: false,
                                label: {fr: 'Second lib'},
                                gqlNames: {
                                    __typename: 'Test2',
                                    query: 'test2',
                                    filter: 'Test2Filter',
                                    searchableFields: 'Test2Search'
                                },
                                attributes: {
                                    __typename: 'Attribute',
                                    id: 'string',
                                    type: 'string',
                                    format: 'string',
                                    label: {}
                                },
                                permissions: {
                                    access_library: true,
                                    access_record: true,
                                    edit_record: true,
                                    create_record: true,
                                    delete_record: true
                                }
                            }
                        ]
                    }
                }
            }
        },
        {
            request: {
                query: getUserDataQuery,
                variables: {keys: [FAVORITE_LIBRARIES_KEY]}
            },
            result: {
                data: {
                    userData: {
                        __typename: 'UserData',
                        global: false,
                        data: {[FAVORITE_LIBRARIES_KEY]: ['test2']}
                    }
                }
            }
        },
        {
            request: {
                query: getTreeListQuery
            },
            result: {
                data: {
                    trees: {
                        list: [
                            {
                                id: 'idTree',
                                label: {fr: 'First tree'},
                                libraries: [
                                    {
                                        library: {
                                            id: 'idLib',
                                            label: {fr: 'labelLib', en: 'labelLib'}
                                        }
                                    }
                                ],
                                permissions: {
                                    access_tree: true,
                                    detach: true,
                                    edit_children: true
                                }
                            },
                            {
                                id: 'idTree2',
                                label: {fr: 'Second tree'},
                                libraries: [
                                    {
                                        library: {
                                            id: 'idLib',
                                            label: {fr: 'labelLib', en: 'labelLib'}
                                        }
                                    }
                                ],
                                permissions: {
                                    access_tree: true,
                                    detach: true,
                                    edit_children: true
                                }
                            }
                        ]
                    }
                }
            }
        },
        {
            request: {
                query: getUserDataQuery,
                variables: {keys: [FAVORITE_TREES_KEY]}
            },
            result: {
                data: {
                    userData: {
                        __typename: 'UserData',
                        global: false,
                        data: {[FAVORITE_TREES_KEY]: ['idTree2']}
                    }
                }
            }
        }
    ];

    const currentApp = {
        ...mockApplicationDetails,
        libraries: [],
        trees: []
    };

    test('Display libraries and tree lists', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <Home />
                </MemoryRouter>,
                {apolloMocks: mocks, currentApp}
            );
        });

        const librariesListBlock = screen.getByTestId('libraries-list');
        const treesListBlock = screen.getByTestId('trees-list');

        expect(librariesListBlock).toBeInTheDocument();
        expect(treesListBlock).toBeInTheDocument();

        expect(within(librariesListBlock).getAllByRole('row')).toHaveLength(3); // one for header + data
        expect(within(treesListBlock).getAllByRole('row')).toHaveLength(3);
    });

    test('Display favorites first in libraries', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <Home />
                </MemoryRouter>,
                {apolloMocks: mocks, currentApp}
            );
        });

        const librariesListBlock = screen.getByTestId('libraries-list');

        expect(librariesListBlock).toBeInTheDocument();

        const firstRow = within(librariesListBlock).getAllByRole('row')[1];
        const secondRow = within(librariesListBlock).getAllByRole('row')[2];
        expect(within(firstRow).getByText('Second lib')).toBeInTheDocument();
        expect(within(secondRow).getByText('First lib')).toBeInTheDocument();

        const favoriteStarIcon = within(secondRow).getByTestId('favorite-star');
        expect(favoriteStarIcon).toBeInTheDocument();
    });

    test('Display favorites first in trees', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <Home />
                </MemoryRouter>,
                {apolloMocks: mocks, currentApp}
            );
        });

        const treesListBlock = screen.getByTestId('trees-list');

        expect(treesListBlock).toBeInTheDocument();

        const firstRow = within(treesListBlock).getAllByRole('row')[1];
        const secondRow = within(treesListBlock).getAllByRole('row')[2];
        expect(within(firstRow).getByText('Second tree')).toBeInTheDocument();
        expect(within(secondRow).getByText('First tree')).toBeInTheDocument();

        const favoriteStarIcon = within(secondRow).getByTestId('favorite-star');
        expect(favoriteStarIcon).toBeInTheDocument();
    });

    test('Can import data', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <Home />
                </MemoryRouter>,
                {apolloMocks: mocks, currentApp}
            );
        });

        const librariesListBlock = screen.getByTestId('libraries-list');

        expect(librariesListBlock).toBeInTheDocument();

        const firstRow = within(librariesListBlock).getAllByRole('row')[1];
        const importBtn = within(firstRow).getByRole('button', {name: /upload/, hidden: true});
        expect(importBtn).toBeInTheDocument();

        await act(async () => {
            userEvent.click(importBtn);
        });

        expect(screen.getByText('ImportModal')).toBeInTheDocument();
    });
});
