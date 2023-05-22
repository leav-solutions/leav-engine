// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook, waitFor} from '@testing-library/react';
import {getTreeLibraries} from 'graphQL/queries/trees/getTreeLibraries';
import {LibraryBehavior, TreeBehavior} from '_gqlTypes/globalTypes';
import {mockRecord} from '__mocks__/common/record';
import MockedProviderWithFragments from '__mocks__/MockedProviderWithFragments';
import {useTreeLibraryAllowedAsChild} from '.';

describe('useTreeLibraryAllowedAsChild', () => {
    const mockLib2 = {
        library: {
            id: 'library_2',
            behavior: LibraryBehavior.standard,
            system: false,
            label: {fr: 'Library 2'}
        },
        settings: {
            allowMultiplePositions: false,
            allowedAtRoot: false,
            allowedChildren: []
        }
    };

    const mockLib3 = {
        library: {
            id: 'library_3',
            behavior: LibraryBehavior.standard,
            system: false,
            label: {fr: 'Library 3'}
        },
        settings: {
            allowMultiplePositions: false,
            allowedAtRoot: false,
            allowedChildren: []
        }
    };

    const mockLib1 = {
        library: {
            id: 'library_1',
            behavior: LibraryBehavior.standard,
            system: false,
            label: {fr: 'Library 1'}
        },
        settings: {
            allowMultiplePositions: false,
            allowedAtRoot: true,
            allowedChildren: [mockLib2.library.id, mockLib3.library.id]
        }
    };

    const mocks = [
        {
            request: {
                query: getTreeLibraries,
                variables: {
                    treeId: ['my_tree']
                }
            },
            result: {
                data: {
                    trees: {
                        totalCount: 1,
                        list: [
                            {
                                id: 'my_tree',
                                behavior: TreeBehavior.standard,
                                system: false,
                                libraries: [mockLib1, mockLib2, mockLib3]
                            }
                        ]
                    }
                }
            }
        }
    ];

    test('At root, return libraries allowed at root', async () => {
        const {result} = renderHook(() => useTreeLibraryAllowedAsChild('my_tree'), {
            wrapper: ({children}) => (
                <MockedProviderWithFragments mocks={mocks}>{children as JSX.Element}</MockedProviderWithFragments>
            )
        });

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeUndefined();
        expect(result.current.libraries).toEqual([mockLib1]);
    });

    test('Under an element, return libraries allowed as children', async () => {
        const parentNode = {
            id: '123465',
            childrenCount: 0,
            record: {
                id: mockRecord.id,
                whoAmI: {
                    ...mockRecord,
                    library: {
                        ...mockRecord.library,
                        id: mockLib1.library.id
                    }
                },
                active: true
            },
            permissions: null
        };

        const {result} = renderHook(() => useTreeLibraryAllowedAsChild('my_tree', parentNode), {
            wrapper: ({children}) => (
                <MockedProviderWithFragments mocks={mocks}>{children as JSX.Element}</MockedProviderWithFragments>
            )
        });

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeUndefined();
        expect(result.current.libraries).toEqual([mockLib2, mockLib3]);
    });

    test('Returns error if any', async () => {
        const mockError = [
            {
                request: {
                    query: getTreeLibraries,
                    variables: {
                        treeId: 'my_tree'
                    }
                },
                error: new Error()
            }
        ];

        const {result} = renderHook(() => useTreeLibraryAllowedAsChild('my_tree'), {
            wrapper: ({children}) => (
                <MockedProviderWithFragments mocks={mockError}>{children as JSX.Element}</MockedProviderWithFragments>
            )
        });

        expect(result.current.loading).toBe(true);

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(result.current.loading).toBe(false);
        expect(result.current.error).toBeTruthy();
    });
});
