// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedResponse} from '@apollo/client/testing';
import userEvent from '@testing-library/user-event';
import {treeNavigationPageSize} from 'constants/constants';
import {getTreeLibraries} from 'graphQL/queries/trees/getTreeLibraries';
import {treeNodeChildrenQuery} from 'graphQL/queries/trees/getTreeNodeChildren';
import {LibraryBehavior, TreeBehavior} from '_gqlTypes/globalTypes';
import {act, render, screen, waitFor, within} from '_tests/testUtils';
import {SharedStateSelectionType} from '_types/types';
import {mockApplicationDetails} from '__mocks__/common/applications';
import {mockInitialState} from '__mocks__/common/mockRedux/mockInitialState';
import {mockRecord} from '__mocks__/common/record';
import {mockTree} from '__mocks__/common/tree';
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
            behavior: 'standard',
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
            system: false,
            behavior: LibraryBehavior.standard,
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
                filters: {id: ['my_tree']}
            }
        },
        result: {
            data: {
                trees: {
                    __typename: 'TreesList',
                    totalCount: 1,
                    list: [
                        {
                            ...mockTree,
                            __typename: 'Tree',
                            id: 'my_tree',
                            label: {fr: 'My Tree Label', en: 'My Tree Label'},
                            behavior: TreeBehavior.standard,
                            system: false,
                            permissions: mockTreeNodePermissions,
                            libraries: [mockTreeLibrary]
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
                treeId: ['my_tree']
            }
        },
        result: {
            data: {
                trees: {
                    __typename: 'TreesList',
                    totalCount: 1,
                    list: [
                        {
                            ...mockTree,
                            __typename: 'Tree',
                            id: 'my_tree',
                            libraries: [mockTreeLibrary],
                            behavior: TreeBehavior.standard,
                            system: false
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
                            active: true,
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
                            active: true,
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
                        whoAmI: {...mockRecordWithTypenames, id: '1', label: 'child-first-page'},
                        active: true
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
                        active: true,
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
                            whoAmI: {...mockRecordWithTypenames, id: '11', label: 'child-1-1'},
                            active: true
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
                            whoAmI: {...mockRecordWithTypenames, id: '12', label: 'child-1-2'},
                            active: true
                        },
                        childrenCount: 0,
                        permissions: mockTreeNodePermissions
                    }
                ]
            }
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
            settings: {...mockApplicationDetails.settings, trees: 'all'}
        }
    };

    test('Render first level of the tree', async () => {
        await act(async () => {
            render(<Navigation tree="my_tree" />, renderOptions);
        });

        expect(await screen.findAllByTestId('navigation-column')).toHaveLength(1);
        const colHeader = screen.getAllByRole('banner')[0];

        expect(within(colHeader).getByText('My Tree Label')).toBeInTheDocument();
        expect(await screen.findByText('first-child')).toBeInTheDocument();
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
                                    },
                                    active: true
                                },
                                permissions: mockTreeNodePermissions,
                                childrenCount: 0
                            }
                        ]
                    }
                }
            });
        });

        await screen.findAllByTestId('navigation-column');

        const childColHeader = screen.getAllByRole('banner')[1];
        expect(await within(childColHeader).findByText('first-child')).toBeInTheDocument();

        const childColumn = screen.getAllByTestId('navigation-column')[1];
        expect(await within(childColumn).findByText('child-1-2')).toBeInTheDocument();
    });

    test('When no selection is set, display appropriate buttons on header', async () => {
        render(<Navigation tree="my_tree" />, renderOptions);

        expect(screen.getByTestId('loading')).toBeInTheDocument();
        expect(await screen.findByTestId('navigation-column')).toBeInTheDocument();

        expect(screen.getAllByTestId('navigation-column')).toHaveLength(1);
        const colHeader = screen.getAllByRole('banner')[0];

        expect(await within(colHeader).findByRole('button', {name: 'add-by-search'}));
        expect(await within(colHeader).findByRole('button', {name: 'add-by-creation'}));
    });

    test('Selection from current column, display appropriate buttons on header', async () => {
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

        expect(screen.getByTestId('loading')).toBeInTheDocument();
        expect(await screen.findByTestId('navigation-column')).toBeInTheDocument();

        expect(screen.getAllByTestId('navigation-column')).toHaveLength(1);
        const colHeader = screen.getAllByRole('banner')[0];

        expect(within(colHeader).getByText(/1/)).toBeInTheDocument(); // Selection count
        expect(within(colHeader).getByRole('button', {name: 'clear-selection'}));
        expect(within(colHeader).getByRole('button', {name: 'detach-selection'}));
    });

    test('Selection from other column, display appropriate buttons on header', async () => {
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
                                },
                                active: true
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

        expect(screen.getByTestId('loading')).toBeInTheDocument();
        await waitFor(async () => expect(await screen.findAllByTestId('navigation-column')).toHaveLength(2));

        const childColHeader = screen.getAllByRole('banner')[1];

        expect(within(childColHeader).getByText(/1/)).toBeInTheDocument(); // Selection count
        expect(await within(childColHeader).findByRole('button', {name: 'clear-selection'}));
        expect(await within(childColHeader).findByRole('button', {name: 'add-selection'}));
        expect(await within(childColHeader).findByRole('button', {name: 'move-selection'}));
        expect(await within(childColHeader).findByRole('button', {name: 'detach-selection'}));
    });

    test('Selection from search, display appropriate buttons on header', async () => {
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
                                },
                                active: true
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

        expect(screen.getByTestId('loading')).toBeInTheDocument();
        await waitFor(async () => expect(await screen.findAllByTestId('navigation-column')).toHaveLength(2));

        const childColHeader = screen.getAllByRole('banner')[1];

        expect(within(childColHeader).getByText(/1/)).toBeInTheDocument(); // Selection count
        expect(await within(childColHeader).findByRole('button', {name: 'clear-selection'}));
        expect(await within(childColHeader).findByRole('button', {name: 'add-selection'}));
    });
});
