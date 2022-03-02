// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {MockedResponse} from '@apollo/client/testing';
import {getTreeContentQuery} from 'graphQL/queries/trees/getTreeContentQuery';
import React from 'react';
import {act, render, screen, waitFor, within} from '_tests/testUtils';
import {SharedStateSelectionType} from '_types/types';
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
                    list: [
                        {
                            __typename: 'Tree',
                            id: 'my_tree',
                            label: {fr: 'My Tree Label', en: 'My Tree Label'},
                            libraries: [
                                {
                                    __typename: 'TreeLibrary',
                                    library: {
                                        id: 'my_lib',
                                        label: {fr: 'My Lib', en: 'My lib'},
                                        __typename: 'Library'
                                    }
                                }
                            ],
                            permissions: mockTreeNodePermissions
                        }
                    ]
                }
            }
        }
    };

    const getTreeContentMockResult = {
        data: {
            treeContent: [
                {
                    __typename: 'TreeNode',
                    id: '12345',
                    record: {
                        id: '1',
                        __typename: 'RecordLib',
                        whoAmI: {...mockRecordWithTypenames, id: '1', label: 'first-child'}
                    },
                    children: [
                        {
                            __typename: 'TreeNode',
                            id: '11',
                            record: {
                                id: '11',
                                __typename: 'RecordLib',
                                whoAmI: {...mockRecordWithTypenames, id: '11', label: 'child-1-1'}
                            },
                            children: [],
                            permissions: mockTreeNodePermissions
                        },
                        {
                            __typename: 'TreeNode',
                            id: '12',
                            record: {
                                id: '12',
                                __typename: 'RecordLib',
                                whoAmI: {...mockRecordWithTypenames, id: '12', label: 'child-1-2'}
                            },
                            children: [],
                            permissions: mockTreeNodePermissions
                        }
                    ],
                    permissions: mockTreeNodePermissions
                },
                {
                    __typename: 'TreeNode',
                    id: '2',
                    record: {
                        id: '2',
                        __typename: 'RecordLib',
                        whoAmI: {...mockRecordWithTypenames, id: '2', label: 'second-child'}
                    },
                    children: [
                        {
                            __typename: 'TreeNode',
                            id: '21',
                            record: {
                                id: '21',
                                __typename: 'RecordLib',
                                whoAmI: {...mockRecordWithTypenames, id: '21', label: 'child-2-1'}
                            },
                            children: [],
                            permissions: mockTreeNodePermissions
                        },
                        {
                            __typename: 'TreeNode',
                            id: '22',
                            record: {
                                id: '22',
                                __typename: 'RecordLib',
                                whoAmI: {...mockRecordWithTypenames, id: '22', label: 'child-2-2'}
                            },
                            children: [],
                            permissions: mockTreeNodePermissions
                        }
                    ],
                    permissions: mockTreeNodePermissions
                }
            ]
        }
    };

    const getTreeContentMockResultNoChildren = {
        data: {
            treeContent: [
                {
                    __typename: 'TreeNode',
                    id: '1',
                    record: {
                        id: '1',
                        __typename: 'RecordLib',
                        whoAmI: {...mockRecordWithTypenames, id: '1', label: 'first-child'}
                    },
                    children: [],
                    permissions: mockTreeNodePermissions
                }
            ]
        }
    };

    const mocks: MockedResponse[] = [
        getTreeListMock,
        // Call on first level
        {
            request: {
                query: getTreeContentQuery(1),
                variables: {
                    treeId: 'my_tree'
                }
            },
            result: getTreeContentMockResult
        },
        {
            request: {
                query: getTreeContentQuery(2),
                variables: {
                    treeId: 'my_tree'
                }
            },
            result: getTreeContentMockResult
        }
    ];

    const renderOptions = {
        apolloMocks: mocks,
        cacheSettings: {
            possibleTypes: {
                Record: ['RecordLib']
            }
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
                                record: {id: '1', whoAmI: {...mockRecordWithTypenames, label: 'first-child'}},
                                permissions: mockTreeNodePermissions,
                                children: []
                            }
                        ],
                        isLoading: false
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
                    query: getTreeContentQuery(1),
                    variables: {
                        treeId: 'my_tree'
                    }
                },
                result: getTreeContentMockResultNoChildren
            },
            {
                request: {
                    query: getTreeContentQuery(2),
                    variables: {
                        treeId: 'my_tree'
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
                                children: []
                            }
                        ],
                        isLoading: false,
                        recordDetail: {
                            id: '12346',
                            record: {id: '1', whoAmI: {...mockRecordWithTypenames, label: 'first-child'}},
                            permissions: mockTreeNodePermissions,
                            children: []
                        }
                    }
                }
            });
        });

        expect(screen.getAllByTestId('navigation-column')).toHaveLength(1);
        expect(screen.getAllByTestId('details-column')).toHaveLength(1);
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
                                record: {id: '1', whoAmI: {...mockRecordWithTypenames, label: 'first-child'}},
                                permissions: mockTreeNodePermissions,
                                children: []
                            }
                        ],
                        isLoading: false
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
                                record: {id: '1', whoAmI: {...mockRecordWithTypenames, label: 'first-child'}},
                                permissions: mockTreeNodePermissions,
                                children: []
                            }
                        ],
                        isLoading: false
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
