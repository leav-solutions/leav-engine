// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {getLibrariesListQuery} from 'graphQL/queries/libraries/getLibrariesListQuery';
import {getTreeListQuery} from 'graphQL/queries/trees/getTreeListQuery';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import {MemoryRouter} from 'react-router-dom';
import {LibraryBehavior, TreeBehavior} from '_gqlTypes/globalTypes';
import {act, render, screen, within} from '_tests/testUtils';
import {mockApplicationDetails} from '__mocks__/common/applications';
import {mockLibrary} from '__mocks__/common/library';
import {mockTree} from '__mocks__/common/tree';
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
                                id: 'libA',
                                system: false,
                                label: {fr: 'Lib A'},
                                behavior: LibraryBehavior.standard,
                                icon: null,
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
                                id: 'libB',
                                system: false,
                                label: {fr: 'Lib B'},
                                behavior: LibraryBehavior.standard,
                                icon: null,
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
                        data: {[FAVORITE_LIBRARIES_KEY]: ['libB']}
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
                                ...mockTree,
                                id: 'treeA',
                                behavior: TreeBehavior.standard,
                                label: {fr: 'Tree A'},
                                libraries: [
                                    {
                                        library: {
                                            ...mockLibrary
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
                                ...mockTree,
                                id: 'treeB',
                                behavior: TreeBehavior.standard,
                                label: {fr: 'Tree B'},
                                libraries: [
                                    {
                                        library: {
                                            ...mockLibrary
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
                        data: {[FAVORITE_TREES_KEY]: ['treeB']}
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

    test('Sort libraries and tree lists according to order in application', async () => {
        const currentAppWithLibraries = {
            ...mockApplicationDetails,
            libraries: [
                {
                    id: 'libB'
                },
                {
                    id: 'libA'
                }
            ],
            trees: [
                {
                    id: 'treeB'
                },
                {
                    id: 'treeA'
                }
            ]
        };

        await act(async () => {
            render(
                <MemoryRouter>
                    <Home />
                </MemoryRouter>,
                {apolloMocks: mocks, currentApp: currentAppWithLibraries}
            );
        });

        const librariesListBlock = screen.getByTestId('libraries-list');
        const treesListBlock = screen.getByTestId('trees-list');

        expect(within(librariesListBlock).getAllByRole('row')[1]).toHaveTextContent('Lib B');
        expect(within(librariesListBlock).getAllByRole('row')[2]).toHaveTextContent('Lib A');

        expect(within(treesListBlock).getAllByRole('row')[1]).toHaveTextContent('Tree B');
        expect(within(treesListBlock).getAllByRole('row')[2]).toHaveTextContent('Tree A');
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
        expect(within(firstRow).getByText('Lib B')).toBeInTheDocument();
        expect(within(secondRow).getByText('Lib A')).toBeInTheDocument();

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
        expect(within(firstRow).getByText('Tree B')).toBeInTheDocument();
        expect(within(secondRow).getByText('Tree A')).toBeInTheDocument();

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

    test('If no libraries allowed, do not display libraries list at all', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <Home />
                </MemoryRouter>,
                {
                    apolloMocks: mocks,
                    currentApp: {
                        ...currentApp,
                        libraries: null
                    }
                }
            );
        });

        const librariesListBlock = screen.queryByTestId('libraries-list');
        const treesListBlock = screen.queryByTestId('trees-list');

        expect(librariesListBlock).not.toBeInTheDocument();
        expect(treesListBlock).toBeInTheDocument();
    });

    test('If no trees allowed, do not display trees list at all', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <Home />
                </MemoryRouter>,
                {
                    apolloMocks: mocks,
                    currentApp: {
                        ...currentApp,
                        trees: null
                    }
                }
            );
        });

        const librariesListBlock = screen.queryByTestId('libraries-list');
        const treesListBlock = screen.queryByTestId('trees-list');

        expect(librariesListBlock).toBeInTheDocument();
        expect(treesListBlock).not.toBeInTheDocument();
    });

    test('If no trees or libraries allowed, display a message', async () => {
        await act(async () => {
            render(
                <MemoryRouter>
                    <Home />
                </MemoryRouter>,
                {
                    apolloMocks: mocks,
                    currentApp: {
                        ...currentApp,
                        libraries: null,
                        trees: null
                    }
                }
            );
        });

        expect(screen.getByText(/no_libraries_or_trees/)).toBeInTheDocument();
    });
});
