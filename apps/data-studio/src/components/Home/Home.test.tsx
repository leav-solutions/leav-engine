// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import userEvent from '@testing-library/user-event';
import {getLibrariesListQuery} from 'graphQL/queries/libraries/getLibrariesListQuery';
import {getTreeListQuery} from 'graphQL/queries/trees/getTreeListQuery';
import {getUserDataQuery} from 'graphQL/queries/userData/getUserData';
import {MemoryRouter} from 'react-router-dom';
import {LibraryBehavior, TreeBehavior} from '_gqlTypes/globalTypes';
import {act, render, screen, waitFor, within} from '_tests/testUtils';
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
                query: getLibrariesListQuery,
                variables: {filters: {id: []}}
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
                query: getTreeListQuery,
                variables: {
                    filters: {id: []}
                }
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
        settings: {libraries: 'all', trees: 'all'}
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('Display libraries and tree lists', async () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>,
            {apolloMocks: mocks, currentApp}
        );

        const librariesListBlock = await screen.findByTestId('libraries-list');
        const treesListBlock = await screen.findByTestId('trees-list');

        expect(librariesListBlock).toBeInTheDocument();
        expect(treesListBlock).toBeInTheDocument();

        await waitFor(() => expect(within(librariesListBlock).getAllByRole('row')).toHaveLength(3)); // one for header + data
        await waitFor(() => expect(within(treesListBlock).getAllByRole('row')).toHaveLength(3)); // one for header + data
    });

    test('Display favorites first in libraries', async () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>,
            {apolloMocks: mocks, currentApp}
        );

        const librariesListBlock = await screen.findByTestId('libraries-list');

        expect(librariesListBlock).toBeInTheDocument();

        // Wait for the data to be loaded
        await waitFor(() => expect(within(librariesListBlock).getAllByRole('row')).toHaveLength(3));

        const rows = within(librariesListBlock).getAllByRole('row');

        const firstRow = rows[1];
        const secondRow = rows[2];
        expect(await within(firstRow).findByText('Lib B')).toBeInTheDocument();
        expect(within(secondRow).getByText('Lib A')).toBeInTheDocument();

        const favoriteStarIcon = within(secondRow).getByTestId('favorite-star');
        expect(favoriteStarIcon).toBeInTheDocument();
    });

    test('Display favorites first in trees', async () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>,
            {apolloMocks: mocks, currentApp}
        );

        const treesListBlock = await screen.findByTestId('trees-list');

        expect(treesListBlock).toBeInTheDocument();

        // Wait for the data to be loaded
        await waitFor(() => expect(within(treesListBlock).getAllByRole('row')).toHaveLength(3));
        const rows = within(treesListBlock).getAllByRole('row');

        const firstRow = rows[1];
        const secondRow = rows[2];
        expect(await within(firstRow).findByText('Tree B')).toBeInTheDocument();
        expect(within(secondRow).getByText('Tree A')).toBeInTheDocument();

        const favoriteStarIcon = within(secondRow).getByTestId('favorite-star');
        expect(favoriteStarIcon).toBeInTheDocument();
    });

    test('Can import data', async () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>,
            {apolloMocks: mocks, currentApp}
        );

        const librariesListBlock = await screen.findByTestId('libraries-list');

        expect(librariesListBlock).toBeInTheDocument();

        // Wait for the data to be loaded
        await waitFor(() => expect(within(librariesListBlock).getAllByRole('row')).toHaveLength(3));

        const firstRow = within(librariesListBlock).getAllByRole('row')[1];
        const importBtn = within(firstRow).getByRole('button', {name: /upload/, hidden: true});
        expect(importBtn).toBeInTheDocument();

        await act(async () => {
            userEvent.click(importBtn);
        });

        expect(screen.getByText('ImportModal')).toBeInTheDocument();
    });

    test('If no libraries allowed, do not display libraries list at all', async () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>,
            {
                apolloMocks: mocks,
                currentApp: {
                    ...currentApp,
                    settings: {...currentApp.settings, libraries: 'none', trees: 'all'}
                }
            }
        );

        const librariesListBlock = screen.queryByTestId('libraries-list');
        const treesListBlock = await screen.findByTestId('trees-list');

        expect(librariesListBlock).not.toBeInTheDocument();
        expect(treesListBlock).toBeInTheDocument();
    });

    test('If no trees allowed, do not display trees list at all', async () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>,
            {
                apolloMocks: mocks,
                currentApp: {
                    ...currentApp,
                    settings: {...currentApp.settings, trees: 'none', libraries: 'all'}
                }
            }
        );

        const librariesListBlock = await screen.findByTestId('libraries-list');
        const treesListBlock = screen.queryByTestId('trees-list');

        expect(librariesListBlock).toBeInTheDocument();
        expect(treesListBlock).not.toBeInTheDocument();
    });

    test('If no trees or libraries allowed, display a message', async () => {
        render(
            <MemoryRouter>
                <Home />
            </MemoryRouter>,
            {
                apolloMocks: mocks,
                currentApp: {
                    ...currentApp,
                    settings: {libraries: 'none', trees: 'none'}
                }
            }
        );

        expect(screen.getByText(/no_libraries_or_trees/)).toBeInTheDocument();
    });
});
