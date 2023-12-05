// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import ApplicationContext from 'context/ApplicationContext';
import {IApplicationContext} from 'context/ApplicationContext/_types';
import {getLibrariesListQuery} from 'graphQL/queries/libraries/getLibrariesListQuery';
import {renderHook, waitFor} from '_tests/testUtils';
import {mockApplicationDetails} from '__mocks__/common/applications';
import {mockLibrary, mockLibraryPermissions} from '__mocks__/common/library';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import {useApplicationLibraries} from './useApplicationLibraries';

describe('useApplicationLibraries', () => {
    const mockLibBase = {
        ...mockLibrary,
        permissions: mockLibraryPermissions,
        previewsSettings: [
            {
                description: null,
                system: true,
                label: {fr: 'PreviewSettings1', en: 'PreviewSettings1'},
                versions: {
                    background: 'background',
                    density: 1,
                    sizes: [
                        {
                            name: 'PreviewSettings1ChildName',
                            size: 'PreviewSettings1ChildSize'
                        }
                    ]
                }
            }
        ]
    };

    test('If app is configured on "all libs", retrieve all libs', async () => {
        const mockApplicationContext: IApplicationContext = {
            currentApp: {
                ...mockApplicationDetails,
                settings: {
                    libraries: 'all'
                }
            },
            globalSettings: null
        };

        const mocks = [
            {
                request: {
                    query: getLibrariesListQuery,
                    variables: {
                        filters: {id: []}
                    }
                },
                result: {
                    data: {
                        libraries: {
                            list: [
                                {
                                    ...mockLibBase,
                                    id: 'libA'
                                },
                                {
                                    ...mockLibBase,
                                    id: 'libB'
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const {result} = renderHook(() => useApplicationLibraries(), {
            wrapper: ({children}) => (
                <MockedProviderWithFragments mocks={mocks}>
                    <ApplicationContext.Provider value={mockApplicationContext}>
                        {children as JSX.Element}
                    </ApplicationContext.Provider>
                </MockedProviderWithFragments>
            )
        });

        expect(result.current).toMatchObject({error: null, loading: true, libraries: []});

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current).toMatchObject({
            error: null,
            loading: false,
            libraries: [
                {
                    ...mockLibBase,
                    id: 'libA'
                },
                {
                    ...mockLibBase,
                    id: 'libB'
                }
            ]
        });
    });

    test('If app is configured on "selected libs", retrieve selected libs', async () => {
        const mockApplicationContext = {
            currentApp: {
                ...mockApplicationDetails,
                settings: {
                    libraries: ['libA']
                }
            },
            globalSettings: null
        };

        const mocks = [
            {
                request: {
                    query: getLibrariesListQuery,
                    variables: {
                        filters: {id: ['libA']}
                    }
                },
                result: {
                    data: {
                        libraries: {
                            list: [
                                {
                                    ...mockLibBase,
                                    id: 'libA'
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const {result} = renderHook(() => useApplicationLibraries(), {
            wrapper: ({children}) => (
                <MockedProviderWithFragments mocks={mocks}>
                    <ApplicationContext.Provider value={mockApplicationContext}>
                        {children as JSX.Element}
                    </ApplicationContext.Provider>
                </MockedProviderWithFragments>
            )
        });

        expect(result.current).toMatchObject({error: null, loading: true, libraries: []});

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current).toMatchObject({
            error: null,
            loading: false,
            libraries: [
                {
                    ...mockLibBase,
                    id: 'libA'
                }
            ]
        });
    });

    test('If app is configured on "selected libs" but nothing selected, return empty array', async () => {
        const mockApplicationContext = {
            currentApp: {
                ...mockApplicationDetails,
                settings: {
                    libraries: []
                }
            },
            globalSettings: null
        };

        const {result} = renderHook(() => useApplicationLibraries(), {
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
            libraries: []
        });
    });

    test('If app is configured on "no libs", return empty array', async () => {
        const mockApplicationContext: IApplicationContext = {
            currentApp: {
                ...mockApplicationDetails,
                settings: {
                    libraries: 'none'
                }
            },
            globalSettings: null
        };

        const {result} = renderHook(() => useApplicationLibraries(), {
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
            libraries: []
        });
    });

    test('Return libs on defined order', async () => {
        const mockApplicationContext = {
            currentApp: {
                ...mockApplicationDetails,
                settings: {
                    libraries: ['libA', 'libB', 'libC'],
                    librariesOrder: ['libC', 'libA', 'libB']
                }
            },
            globalSettings: null
        };

        const mocks = [
            {
                request: {
                    query: getLibrariesListQuery,
                    variables: {
                        filters: {id: ['libA', 'libB', 'libC']}
                    }
                },
                result: {
                    data: {
                        libraries: {
                            list: [
                                {
                                    ...mockLibBase,
                                    id: 'libA'
                                },
                                {
                                    ...mockLibBase,
                                    id: 'libB'
                                },
                                {
                                    ...mockLibBase,
                                    id: 'libC'
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const {result} = renderHook(() => useApplicationLibraries(), {
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
            libraries: [
                {
                    ...mockLibBase,
                    id: 'libC'
                },
                {
                    ...mockLibBase,
                    id: 'libA'
                },
                {
                    ...mockLibBase,
                    id: 'libB'
                }
            ]
        });
    });

    test('If some libs have not been ordered, put them at the end of the list', async () => {
        const mockApplicationContext = {
            currentApp: {
                ...mockApplicationDetails,
                settings: {
                    libraries: ['libA', 'libB', 'libC'],
                    librariesOrder: ['libB', 'libC']
                }
            },
            globalSettings: null
        };

        const mocks = [
            {
                request: {
                    query: getLibrariesListQuery,
                    variables: {
                        filters: {id: ['libA', 'libB', 'libC']}
                    }
                },
                result: {
                    data: {
                        libraries: {
                            list: [
                                {
                                    ...mockLibBase,
                                    id: 'libA'
                                },
                                {
                                    ...mockLibBase,
                                    id: 'libB'
                                },
                                {
                                    ...mockLibBase,
                                    id: 'libC'
                                }
                            ]
                        }
                    }
                }
            }
        ];

        const {result} = renderHook(() => useApplicationLibraries(), {
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
            libraries: [
                {
                    ...mockLibBase,
                    id: 'libB'
                },
                {
                    ...mockLibBase,
                    id: 'libC'
                },
                {
                    ...mockLibBase,
                    id: 'libA'
                }
            ]
        });
    });
});
