// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ApplicationContext from 'context/ApplicationContext';
import {IApplicationContext} from 'context/ApplicationContext/_types';
import {getTreeListQuery} from 'graphQL/queries/trees/getTreeListQuery';
import {renderHook, waitFor} from '_tests/testUtils';
import {mockApplicationDetails} from '__mocks__/common/applications';
import {mockTree} from '__mocks__/common/tree';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import {useApplicationTrees} from './useApplicationTrees';

describe('useApplicationTrees', () => {
    const mockTreeBase = {
        ...mockTree,
        permissions: {
            access_tree: true,
            edit_children: true
        }
    };

    test('If app is configured on "all trees", retrieve all trees', async () => {
        const mockApplicationContext: IApplicationContext = {
            currentApp: {
                ...mockApplicationDetails,
                settings: {
                    trees: 'all'
                }
            },
            globalSettings: null
        };

        const mocks = [
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
                                    ...mockTreeBase,
                                    id: 'treeA'
                                },
                                {
                                    ...mockTreeBase,
                                    id: 'treeB'
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const {result} = renderHook(() => useApplicationTrees(), {
            wrapper: ({children}) => (
                <MockedProviderWithFragments mocks={mocks}>
                    <ApplicationContext.Provider value={mockApplicationContext}>
                        {children as JSX.Element}
                    </ApplicationContext.Provider>
                </MockedProviderWithFragments>
            )
        });

        expect(result.current).toMatchObject({error: null, loading: true, trees: []});

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current).toMatchObject({
            error: null,
            loading: false,
            trees: [
                {
                    ...mockTreeBase,
                    id: 'treeA'
                },
                {
                    ...mockTreeBase,
                    id: 'treeB'
                }
            ]
        });
    });

    test('If app is configured on "selected trees", retrieve selected trees', async () => {
        const mockApplicationContext = {
            currentApp: {
                ...mockApplicationDetails,
                settings: {
                    trees: ['treeA']
                }
            },
            globalSettings: null
        };

        const mocks = [
            {
                request: {
                    query: getTreeListQuery,
                    variables: {
                        filters: {id: ['treeA']}
                    }
                },
                result: {
                    data: {
                        trees: {
                            list: [
                                {
                                    ...mockTreeBase,
                                    id: 'treeA'
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const {result} = renderHook(() => useApplicationTrees(), {
            wrapper: ({children}) => (
                <MockedProviderWithFragments mocks={mocks}>
                    <ApplicationContext.Provider value={mockApplicationContext}>
                        {children as JSX.Element}
                    </ApplicationContext.Provider>
                </MockedProviderWithFragments>
            )
        });

        expect(result.current).toMatchObject({error: null, loading: true, trees: []});

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current).toMatchObject({
            error: null,
            loading: false,
            trees: [
                {
                    ...mockTreeBase,
                    id: 'treeA'
                }
            ]
        });
    });

    test('If app is configured on "selected trees" but nothing selected, return empty array', async () => {
        const mockApplicationContext = {
            currentApp: {
                ...mockApplicationDetails,
                settings: {
                    trees: []
                }
            },
            globalSettings: null
        };

        const {result} = renderHook(() => useApplicationTrees(), {
            wrapper: ({children}) => (
                <MockedProviderWithFragments>
                    <ApplicationContext.Provider value={mockApplicationContext}>
                        {children as JSX.Element}
                    </ApplicationContext.Provider>
                </MockedProviderWithFragments>
            )
        });

        expect(result.current).toMatchObject({
            error: null,
            loading: false,
            trees: []
        });
    });

    test('If app is configured on "no trees", return empty array', async () => {
        const mockApplicationContext: IApplicationContext = {
            currentApp: {
                ...mockApplicationDetails,
                settings: {
                    trees: 'none'
                }
            },
            globalSettings: null
        };

        const {result} = renderHook(() => useApplicationTrees(), {
            wrapper: ({children}) => (
                <MockedProviderWithFragments>
                    <ApplicationContext.Provider value={mockApplicationContext}>
                        {children as JSX.Element}
                    </ApplicationContext.Provider>
                </MockedProviderWithFragments>
            )
        });

        expect(result.current).toMatchObject({
            error: null,
            loading: false,
            trees: []
        });
    });

    test('Return trees on defined order', async () => {
        const mockApplicationContext = {
            currentApp: {
                ...mockApplicationDetails,
                settings: {
                    trees: ['treeA', 'treeB', 'treeC'],
                    treesOrder: ['treeC', 'treeA', 'treeB']
                }
            },
            globalSettings: null
        };

        const mocks = [
            {
                request: {
                    query: getTreeListQuery,
                    variables: {
                        filters: {id: ['treeA', 'treeB', 'treeC']}
                    }
                },
                result: {
                    data: {
                        trees: {
                            list: [
                                {
                                    ...mockTreeBase,
                                    id: 'treeA'
                                },
                                {
                                    ...mockTreeBase,
                                    id: 'treeB'
                                },
                                {
                                    ...mockTreeBase,
                                    id: 'treeC'
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const {result} = renderHook(() => useApplicationTrees(), {
            wrapper: ({children}) => (
                <MockedProviderWithFragments mocks={mocks}>
                    <ApplicationContext.Provider value={mockApplicationContext}>
                        {children as JSX.Element}
                    </ApplicationContext.Provider>
                </MockedProviderWithFragments>
            )
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current).toMatchObject({
            error: null,
            loading: false,
            trees: [
                {
                    ...mockTreeBase,
                    id: 'treeC'
                },
                {
                    ...mockTreeBase,
                    id: 'treeA'
                },
                {
                    ...mockTreeBase,
                    id: 'treeB'
                }
            ]
        });
    });

    test('If some trees have not been ordered, put them at the end of the list', async () => {
        const mockApplicationContext = {
            currentApp: {
                ...mockApplicationDetails,
                settings: {
                    trees: ['treeA', 'treeB', 'treeC'],
                    treesOrder: ['treeB', 'treeC']
                }
            },
            globalSettings: null
        };

        const mocks = [
            {
                request: {
                    query: getTreeListQuery,
                    variables: {
                        filters: {id: ['treeA', 'treeB', 'treeC']}
                    }
                },
                result: {
                    data: {
                        trees: {
                            list: [
                                {
                                    ...mockTreeBase,
                                    id: 'treeA'
                                },
                                {
                                    ...mockTreeBase,
                                    id: 'treeB'
                                },
                                {
                                    ...mockTreeBase,
                                    id: 'treeC'
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const {result} = renderHook(() => useApplicationTrees(), {
            wrapper: ({children}) => (
                <MockedProviderWithFragments mocks={mocks}>
                    <ApplicationContext.Provider value={mockApplicationContext}>
                        {children as JSX.Element}
                    </ApplicationContext.Provider>
                </MockedProviderWithFragments>
            )
        });

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current).toMatchObject({
            error: null,
            loading: false,
            trees: [
                {
                    ...mockTreeBase,
                    id: 'treeB'
                },
                {
                    ...mockTreeBase,
                    id: 'treeC'
                },
                {
                    ...mockTreeBase,
                    id: 'treeA'
                }
            ]
        });
    });
});
