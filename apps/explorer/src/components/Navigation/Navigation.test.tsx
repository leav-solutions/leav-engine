// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedResponse} from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import {treeNavigationPageSize} from 'constants/constants';
import {getTreeLibraries} from 'graphQL/queries/trees/getTreeLibraries';
import {treeNodeChildrenQuery} from 'graphQL/queries/trees/getTreeNodeChildren';
import {act, render, screen, waitFor, within} from '_tests/testUtils';
import {SharedStateSelectionType} from '_types/types';
import {mockApplicationDetails} from '__mocks__/common/applications';
import {mockInitialState} from '__mocks__/common/mockRedux/mockInitialState';
import {mockRecord} from '__mocks__/common/record';
import {mockTreeNodePermissions} from '__mocks__/common/treeElements';
import {getTreeListQuery} from '../../graphQL/queries/trees/getTreeListQuery';
import Navigation from './Navigation';

jest.mock('react-router-dom', () => ({
    useParams: jest.fn(() => ({treeId: 'TreeId'})),
    useHistory: jest.fn()
}));

jest.mock('../../hooks/ActiveTreeHook/ActiveTreeHook', () => ({
    useActiveTree: () => [
        {
            id: 'my_tree',
            libraries: ['my_lib'],
            label: 'My Tree Label',
            permissions: {...mockTreeNodePermissions}
        },
        jest.fn()
    ]
}));

describe('Navigation', () => {
    const mockRecordWithTypenames = {
        ...mockRecord,
        __typename: 'RecordIdentity',
        id: '1',
        label: 'first-child',
        preview: {...mockRecord.preview, __typename: 'Preview'},
        library: {
            ...mockRecord.library,
            __typename: 'Library',
            gqlNames: {...mockRecord.library.gqlNames, __typename: 'LibraryGraphqlNames'}
        }
    };

    const mockTreeLibrary = {
        __typename: 'TreeLibrary',
        library: {
            id: 'my_lib',
            label: {fr: 'My Lib', en: 'My lib'},
            __typename: 'Library'
        },
        settings: {
            allowMultiplePositions: false,
            allowedAtRoot: true,
            allowedChildren: ['my_lib']
        }
    };

    const getTreeListMock = {
        request: {
            query: getTreeListQuery,
            variables: {
                treeId: 'my_tree'
            }
        },
        result: {
            data: {
                trees: {
                    __typename: 'TreesList',
                    totalCount: 1,
                    list: [
                        {
                            __typename: 'Tree',
                            id: 'my_tree',
                            label: {fr: 'My Tree Label', en: 'My Tree Label'},
                            libraries: [mockTreeLibrary],
                            permissions: mockTreeNodePermissions
                        }
                    ]
                }
            }
        }
    };

    const getTreeLibrariesMock = {
        request: {
            query: getTreeLibraries,
            variables: {
                treeId: 'my_tree'
            }
        },
        result: {
            data: {
                trees: {
                    __typename: 'TreesList',
                    totalCount: 1,
                    list: [
                        {
                            __typename: 'Tree',
                            id: 'my_tree',
                            libraries: [mockTreeLibrary]
                        }
                    ]
                }
            }
        }
    };

    const getTreeNodeChildrenMockResultFirstLevel = {
        data: {
            treeNodeChildren: {
                totalCount: 2,
                list: [
                    {
                        __typename: 'TreeNode',
                        id: '12345',
                        record: {
                            __typename: 'RecordLib',
                            id: '1',
                            whoAmI: {...mockRecordWithTypenames, id: '1', label: 'first-child'}
                        },
                        childrenCount: 2,
                        permissions: mockTreeNodePermissions
                    },
                    {
                        __typename: 'TreeNode',
                        id: '2',
                        record: {
                            __typename: 'RecordLib',
                            id: '2',
                            whoAmI: {...mockRecordWithTypenames, id: '2', label: 'second-child'}
                        },
                        childrenCount: 2,
                        permissions: mockTreeNodePermissions
                    }
                ]
            }
        }
    };

    const getTreeNodeChildrenMockResultFirstPage = {
        data: {
            treeNodeChildren: {
                totalCount: treeNavigationPageSize + 5,
                list: new Array(treeNavigationPageSize).fill(null).map((el, i) => ({
                    __typename: 'TreeNode',
                    id: '654987' + i,
                    record: {
                        __typename: 'RecordLib',
                        id: '1',
                        whoAmI: {...mockRecordWithTypenames, id: '1', label: 'child-first-page'}
                    },
                    childrenCount: 2,
                    permissions: mockTreeNodePermissions
                }))
            }
        }
    };

    const getTreeNodeChildrenMockResultSecondPage = {
        data: {
            treeNodeChildren: {
                totalCount: treeNavigationPageSize + 5,
                list: new Array(5).fill(null).map((e, i) => ({
                    __typename: 'TreeNode',
                    id: '654987' + i,
                    record: {
                        __typename: 'RecordLib',
                        id: '1',
                        whoAmI: {...mockRecordWithTypenames, id: '1', label: 'child-second-page'}
                    },
                    childrenCount: 2,
                    permissions: mockTreeNodePermissions
                }))
            }
        }
    };

    const getTreeNodeChildrenMockResultSecondLevel = {
        data: {
            treeNodeChildren: {
                totalCount: 2,
                list: [
                    {
                        __typename: 'TreeNode',
                        id: '11',
                        record: {
                            __typename: 'RecordLib',
                            id: '11',
                            whoAmI: {...mockRecordWithTypenames, id: '11', label: 'child-1-1'}
                        },
                        childrenCount: 0,
                        permissions: mockTreeNodePermissions
                    },
                    {
                        __typename: 'TreeNode',
                        id: '12',
                        record: {
                            __typename: 'RecordLib',
                            id: '12',
                            whoAmI: {...mockRecordWithTypenames, id: '12', label: 'child-1-2'}
                        },
                        childrenCount: 0,
                        permissions: mockTreeNodePermissions
                    }
                ]
            }
        }
    };

    const getTreeContentMockResultNoChildren = {
        data: {
            treeNodeChildren: {totalCount: 0, list: []}
        }
    };

    const mocks: MockedResponse[] = [
        getTreeListMock,
        getTreeLibrariesMock,
        // Call on first level
        {
            request: {
                query: treeNodeChildrenQuery,
                variables: {
                    treeId: 'my_tree',
                    node: null,
                    pagination: {
                        limit: treeNavigationPageSize,
                        offset: 0
                    }
                }
            },
            result: getTreeNodeChildrenMockResultFirstLevel
        },
        {
            request: {
                query: treeNodeChildrenQuery,
                variables: {
                    treeId: 'my_tree',
                    node: '12345',
                    pagination: {
                        limit: treeNavigationPageSize,
                        offset: 0
                    }
                }
            },
            result: getTreeNodeChildrenMockResultSecondLevel
        }
    ];

    const renderOptions = {
        apolloMocks: mocks,
        cacheSettings: {
            possibleTypes: {
                Record: ['RecordLib']
            }
        },
        currentApp: {
            ...mockApplicationDetails,
            trees: []
        }
    };

    test('Render first level of the tree', async () => {
        await act(async () => {
            render(<Navigation tree="my_tree" />, renderOptions);
        });

        await waitFor(() => screen.getAllByTestId('navigation-column'));

        expect(screen.getAllByTestId('navigation-column')).toHaveLength(1);
        const colHeader = screen.getAllByRole('banner')[0];

        expect(within(colHeader).getByText('My Tree Label')).toBeInTheDocument();
        expect(screen.getByText('first-child')).toBeInTheDocument();
        expect(screen.getByText('second-child')).toBeInTheDocument();
    });

    test('Render first level of the tree with pagination', async () => {
        const mocksForPagination: MockedResponse[] = [
            getTreeListMock,
            // Call on first level
            {
                request: {
                    query: treeNodeChildrenQuery,
                    variables: {
                        treeId: 'my_tree',
                        node: null,
                        pagination: {
                            limit: treeNavigationPageSize,
                            offset: 0
                        }
                    }
                },
                result: getTreeNodeChildrenMockResultFirstPage
            },
            {
                request: {
                    query: treeNodeChildrenQuery,
                    variables: {
                        treeId: 'my_tree',
                        node: null,
                        pagination: {
                            limit: treeNavigationPageSize,
                            offset: 20
                        }
                    }
                },
                result: getTreeNodeChildrenMockResultSecondPage
            },
            {
                request: {
                    query: treeNodeChildrenQuery,
                    variables: {
                        treeId: 'my_tree',
                        node: null,
                        pagination: {
                            limit: treeNavigationPageSize,
                            offset: 0
                        }
                    }
                },
                result: getTreeNodeChildrenMockResultFirstPage
            },
            {
                request: {
                    query: treeNodeChildrenQuery,
                    variables: {
                        treeId: 'my_tree',
                        node: null,
                        pagination: {
                            limit: treeNavigationPageSize,
                            offset: 20
                        }
                    }
                },
                result: getTreeNodeChildrenMockResultSecondPage
            }
        ];

        await act(async () => {
            render(<Navigation tree="my_tree" />, {...renderOptions, apolloMocks: mocksForPagination});
        });

        expect(await screen.findAllByText('child-first-page')).toHaveLength(treeNavigationPageSize);

        // Go next page
        const nextPageButton = screen.getByRole('listitem', {name: /Next/});
        await act(async () => {
            userEvent.click(nextPageButton);
        });
        expect(await screen.findAllByText('child-second-page')).toHaveLength(5);

        // Go previous page
        const prevPageButton = screen.getByRole('listitem', {name: /Previous/});
        await act(async () => {
            userEvent.click(prevPageButton);
        });
        expect(await screen.findAllByText('child-first-page')).toHaveLength(treeNavigationPageSize);
    });

    test('When an element is in path, navigate in the tree to this element', async () => {
        await act(async () => {
            render(<Navigation tree="my_tree" />, {
                ...renderOptions,
                storeState: {
                    ...mockInitialState,
                    navigation: {
                        ...mockInitialState.navigation,
                        activeTree: 'my_tree',
                        path: [
                            {
                                id: '12345',
                                record: {
                                    id: '1',
                                    whoAmI: {
                                        ...mockRecordWithTypenames,
                                        label: 'first-child',
                                        library: {
                                            ...mockRecordWithTypenames.library,
                                            id: 'my_lib'
                                        }
                                    }
                                },
                                permissions: mockTreeNodePermissions,
                                childrenCount: 0
                            }
                        ]
                    }
                }
            });
        });
        await waitFor(() => screen.getAllByTestId('navigation-column'));

        expect(screen.getAllByTestId('navigation-column')).toHaveLength(2);

        const childColHeader = screen.getAllByRole('banner')[1];
        expect(within(childColHeader).getByText('first-child')).toBeInTheDocument();

        const childColumn = screen.getAllByTestId('navigation-column')[1];
        expect(within(childColumn).getByText('child-1-2')).toBeInTheDocument();
    });

    test('When element has no children, display its details', async () => {
        const mocksNoChildren: MockedResponse[] = [
            getTreeListMock,
            // Call on first level
            {
                request: {
                    query: treeNodeChildrenQuery,
                    variables: {
                        treeId: 'my_tree',
                        node: null,
                        pagination: {
                            limit: treeNavigationPageSize,
                            offset: 0
                        }
                    }
                },
                result: getTreeNodeChildrenMockResultFirstLevel
            },
            {
                request: {
                    query: treeNodeChildrenQuery,
                    variables: {
                        treeId: 'my_tree',
                        node: '12345',
                        pagination: {
                            limit: treeNavigationPageSize,
                            offset: 0
                        }
                    }
                },
                result: getTreeContentMockResultNoChildren
            }
        ];

        await act(async () => {
            render(<Navigation tree="my_tree" />, {
                ...renderOptions,
                apolloMocks: mocksNoChildren,
                storeState: {
                    ...mockInitialState,
                    navigation: {
                        ...mockInitialState.navigation,
                        activeTree: 'my_tree',
                        path: [
                            {
                                id: '12345',
                                record: {id: '1', whoAmI: {...mockRecordWithTypenames, label: 'first-child'}},
                                permissions: mockTreeNodePermissions,
                                childrenCount: 0
                            }
                        ]
                    }
                }
            });
        });

        expect(screen.getAllByTestId('navigation-column')).toHaveLength(1);
        expect(screen.getAllByTestId('navigation-column-with-details')).toHaveLength(1);
    });

    test('When no selection is set, display appropriate buttons on header', async () => {
        await act(async () => {
            render(<Navigation tree="my_tree" />, renderOptions);
        });

        await waitFor(() => screen.getAllByTestId('navigation-column'));
        expect(screen.getAllByTestId('navigation-column')).toHaveLength(1);
        const colHeader = screen.getAllByRole('banner')[0];

        expect(within(colHeader).getByRole('button', {name: 'add-by-search'}));
        expect(within(colHeader).getByRole('button', {name: 'add-by-creation'}));
    });

    test('Selection from current column, display appropriate buttons on header', async () => {
        await act(async () => {
            render(<Navigation tree="my_tree" />, {
                ...renderOptions,
                storeState: {
                    selection: {
                        searchSelection: null,
                        selection: {
                            type: SharedStateSelectionType.navigation,
                            parent: null,
                            selected: [
                                {
                                    id: '1',
                                    library: 'my_lib',
                                    label: 'first-child'
                                }
                            ]
                        }
                    }
                }
            });
        });

        await waitFor(() => screen.getAllByTestId('navigation-column'));

        expect(screen.getAllByTestId('navigation-column')).toHaveLength(1);
        const colHeader = screen.getAllByRole('banner')[0];

        expect(within(colHeader).getByText('1')).toBeInTheDocument(); // Selection count
        expect(within(colHeader).getByRole('button', {name: 'clear-selection'}));
        expect(within(colHeader).getByRole('button', {name: 'detach-selection'}));
    });

    test('Selection from other column, display appropriate buttons on header', async () => {
        await act(async () => {
            render(<Navigation tree="my_tree" />, {
                ...renderOptions,
                storeState: {
                    ...mockInitialState,
                    navigation: {
                        ...mockInitialState.navigation,
                        activeTree: 'my_tree',
                        path: [
                            {
                                id: '12345',
                                record: {
                                    id: '1',
                                    whoAmI: {
                                        ...mockRecordWithTypenames,
                                        label: 'first-child',
                                        library: {
                                            ...mockRecordWithTypenames.library,
                                            id: 'my_lib'
                                        }
                                    }
                                },
                                permissions: mockTreeNodePermissions,
                                childrenCount: 0
                            }
                        ]
                    },
                    selection: {
                        searchSelection: null,
                        selection: {
                            type: SharedStateSelectionType.navigation,
                            parent: null,
                            selected: [
                                {
                                    id: '1',
                                    library: 'my_lib',
                                    label: 'first-child'
                                }
                            ]
                        }
                    }
                }
            });
        });

        await waitFor(() => screen.getAllByTestId('navigation-column'));
        const childColHeader = screen.getAllByRole('banner')[1];

        expect(within(childColHeader).getByText('1')).toBeInTheDocument(); // Selection count
        expect(within(childColHeader).getByRole('button', {name: 'clear-selection'}));
        expect(within(childColHeader).getByRole('button', {name: 'add-selection'}));
        expect(within(childColHeader).getByRole('button', {name: 'move-selection'}));
        expect(within(childColHeader).getByRole('button', {name: 'detach-selection'}));
    });

    test('Selection from search, display appropriate buttons on header', async () => {
        await act(async () => {
            render(<Navigation tree="my_tree" />, {
                ...renderOptions,
                storeState: {
                    ...mockInitialState,
                    navigation: {
                        ...mockInitialState.navigation,
                        activeTree: 'my_tree',
                        path: [
                            {
                                id: '12345',
                                record: {
                                    id: '1',
                                    whoAmI: {
                                        ...mockRecordWithTypenames,
                                        label: 'first-child',
                                        library: {
                                            ...mockRecordWithTypenames.library,
                                            id: 'my_lib'
                                        }
                                    }
                                },
                                permissions: mockTreeNodePermissions,
                                childrenCount: 0
                            }
                        ]
                    },
                    selection: {
                        searchSelection: null,
                        selection: {
                            type: SharedStateSelectionType.search,
                            allSelected: false,
                            selected: [
                                {
                                    id: '1',
                                    library: 'my_lib',
                                    label: 'first-child'
                                }
                            ]
                        }
                    }
                }
            });
        });

        await waitFor(() => screen.getAllByTestId('navigation-column'));
        const childColHeader = screen.getAllByRole('banner')[1];

        expect(within(childColHeader).getByText('1')).toBeInTheDocument(); // Selection count
        expect(within(childColHeader).getByRole('button', {name: 'clear-selection'}));
        expect(within(childColHeader).getByRole('button', {name: 'add-selection'}));
    });
});
