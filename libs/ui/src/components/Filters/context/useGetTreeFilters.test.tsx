// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {renderHook, waitFor} from '@testing-library/react';
import {useGetTreeFilters} from './useGetTreeFilters';
import {useGetLibraryByIdQuery, useTreeFilterByDefaultValuesLazyQuery} from '_ui/_gqlTypes';

jest.mock('_ui/_gqlTypes', () => ({
    useGetLibraryByIdQuery: jest.fn(),
    useTreeFilterByDefaultValuesLazyQuery: jest.fn(),
}));

describe('useGetTreeFilters', () => {
    const mockLibraryId = 'test-library-id';
    const mockTreeFilterByDefaultValues = jest.fn();

    const mockLibraryData = {
        libraries: {
            list: [
                {
                    id: mockLibraryId,
                    permissions_conf: {
                        permissionTreeAttributes: [{id: 'attribute1'}, {id: 'attribute2'}],
                    },
                    attributes: [
                        {
                            id: 'attribute1',
                            linked_tree: {id: 'tree1'},
                        },
                        {
                            id: 'attribute2',
                            linked_tree: {id: 'tree2'},
                        },
                    ],
                },
            ],
        },
    };

    const mockTreeResponse1 = {
        data: {
            treeNodeChildren: {
                list: [
                    {
                        id: 'node1',
                        accessRecordByDefaultPermission: true,
                        record: {
                            id: 'record1',
                            whoAmI: {
                                library: {id: 'lib1'},
                                label: 'Record 1',
                            },
                        },
                    },
                    {
                        id: 'node2',
                        accessRecordByDefaultPermission: false,
                        record: {
                            id: 'record2',
                            whoAmI: {
                                library: {id: 'lib1'},
                                label: 'Record 2',
                            },
                        },
                    },
                ],
            },
        },
    };

    const mockTreeResponse2 = {
        data: {
            treeNodeChildren: {
                list: [
                    {
                        id: 'node3',
                        accessRecordByDefaultPermission: true,
                        record: {
                            id: 'record3',
                            whoAmI: {
                                library: {id: 'lib2'},
                                label: 'Record 3',
                            },
                        },
                    },
                ],
            },
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useTreeFilterByDefaultValuesLazyQuery as jest.Mock).mockReturnValue([mockTreeFilterByDefaultValues, {}]);
    });

    describe('Initial state', () => {
        test('should return empty filters and loading true initially', () => {
            (useGetLibraryByIdQuery as jest.Mock).mockReturnValue({
                data: undefined,
                loading: true,
            });

            const {result} = renderHook(() =>
                useGetTreeFilters({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            expect(result.current.data).toEqual({});
            expect(result.current.loading).toBe(true);
        });
    });

    describe('Skip behavior', () => {
        test('should not fetch data when skip is true', () => {
            (useGetLibraryByIdQuery as jest.Mock).mockReturnValue({
                data: mockLibraryData,
                loading: false,
            });

            renderHook(() =>
                useGetTreeFilters({
                    libraryId: mockLibraryId,
                    skip: true,
                }),
            );

            expect(mockTreeFilterByDefaultValues).not.toHaveBeenCalled();
        });

        test('should not fetch data when libraryId is empty', () => {
            (useGetLibraryByIdQuery as jest.Mock).mockReturnValue({
                data: undefined,
                loading: false,
            });

            renderHook(() =>
                useGetTreeFilters({
                    libraryId: '',
                    skip: false,
                }),
            );

            expect(mockTreeFilterByDefaultValues).not.toHaveBeenCalled();
        });

        test('should not fetch data when library is still loading', () => {
            (useGetLibraryByIdQuery as jest.Mock).mockReturnValue({
                data: undefined,
                loading: true,
            });

            renderHook(() =>
                useGetTreeFilters({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            expect(mockTreeFilterByDefaultValues).not.toHaveBeenCalled();
        });
    });

    describe('Fetching tree filters', () => {
        test('should fetch and transform tree filters correctly', async () => {
            (useGetLibraryByIdQuery as jest.Mock).mockReturnValue({
                data: mockLibraryData,
                loading: false,
            });

            mockTreeFilterByDefaultValues
                .mockResolvedValueOnce(mockTreeResponse1)
                .mockResolvedValueOnce(mockTreeResponse2);

            const {result} = renderHook(() =>
                useGetTreeFilters({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(mockTreeFilterByDefaultValues).toHaveBeenCalledTimes(2);
            expect(mockTreeFilterByDefaultValues).toHaveBeenCalledWith({
                variables: {
                    treeId: 'tree1',
                    accessRecordByDefaultPermission: {
                        attributeId: 'attribute1',
                        libraryId: mockLibraryId,
                    },
                },
            });
            expect(mockTreeFilterByDefaultValues).toHaveBeenCalledWith({
                variables: {
                    treeId: 'tree2',
                    accessRecordByDefaultPermission: {
                        attributeId: 'attribute2',
                        libraryId: mockLibraryId,
                    },
                },
            });

            expect(result.current.data).toEqual({
                attribute1: [
                    {
                        nodeId: 'node1',
                        libraryId: 'lib1',
                        value: 'record1',
                        label: 'Record 1',
                    },
                ],
                attribute2: [
                    {
                        nodeId: 'node3',
                        libraryId: 'lib2',
                        value: 'record3',
                        label: 'Record 3',
                    },
                ],
            });
        });

        test('should filter out records without accessRecordByDefaultPermission', async () => {
            (useGetLibraryByIdQuery as jest.Mock).mockReturnValue({
                data: mockLibraryData,
                loading: false,
            });

            mockTreeFilterByDefaultValues
                .mockResolvedValueOnce(mockTreeResponse1)
                .mockResolvedValueOnce({data: {treeNodeChildren: {list: []}}});

            const {result} = renderHook(() =>
                useGetTreeFilters({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.data.attribute1).toHaveLength(1);
            expect(result.current.data.attribute1[0].nodeId).toBe('node1');
        });

        test('should handle empty tree attributes', async () => {
            (useGetLibraryByIdQuery as jest.Mock).mockReturnValue({
                data: {
                    libraries: {
                        list: [
                            {
                                id: mockLibraryId,
                                permissions_conf: {
                                    permissionTreeAttributes: [],
                                },
                                attributes: [],
                            },
                        ],
                    },
                },
                loading: false,
            });

            const {result} = renderHook(() =>
                useGetTreeFilters({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.data).toEqual({});
            expect(mockTreeFilterByDefaultValues).not.toHaveBeenCalled();
        });

        test('should handle missing permissions_conf', async () => {
            (useGetLibraryByIdQuery as jest.Mock).mockReturnValue({
                data: {
                    libraries: {
                        list: [
                            {
                                id: mockLibraryId,
                                permissions_conf: null,
                                attributes: [],
                            },
                        ],
                    },
                },
                loading: false,
            });

            const {result} = renderHook(() =>
                useGetTreeFilters({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.data).toEqual({});
        });

        test('should handle empty tree node list', async () => {
            (useGetLibraryByIdQuery as jest.Mock).mockReturnValue({
                data: mockLibraryData,
                loading: false,
            });

            mockTreeFilterByDefaultValues
                .mockResolvedValueOnce({data: {treeNodeChildren: {list: null}}})
                .mockResolvedValueOnce({data: {treeNodeChildren: {list: []}}});

            const {result} = renderHook(() =>
                useGetTreeFilters({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.data).toEqual({
                attribute1: [],
                attribute2: [],
            });
        });
    });

    describe('Re-fetching on dependency change', () => {
        test('should re-fetch when libraryId changes', async () => {
            (useGetLibraryByIdQuery as jest.Mock).mockReturnValue({
                data: mockLibraryData,
                loading: false,
            });

            mockTreeFilterByDefaultValues.mockResolvedValue(mockTreeResponse1);

            const {rerender} = renderHook(({libraryId, skip}) => useGetTreeFilters({libraryId, skip}), {
                initialProps: {libraryId: mockLibraryId, skip: false},
            });

            await waitFor(() => {
                expect(mockTreeFilterByDefaultValues).toHaveBeenCalledTimes(2);
            });

            jest.clearAllMocks();

            rerender({libraryId: 'new-library-id', skip: false});

            await waitFor(() => {
                expect(mockTreeFilterByDefaultValues).toHaveBeenCalled();
            });
        });

        test('should re-fetch when skip changes from true to false', async () => {
            (useGetLibraryByIdQuery as jest.Mock).mockReturnValue({
                data: mockLibraryData,
                loading: false,
            });

            mockTreeFilterByDefaultValues.mockResolvedValue(mockTreeResponse1);

            const {rerender} = renderHook(({libraryId, skip}) => useGetTreeFilters({libraryId, skip}), {
                initialProps: {libraryId: mockLibraryId, skip: true},
            });

            expect(mockTreeFilterByDefaultValues).not.toHaveBeenCalled();

            rerender({libraryId: mockLibraryId, skip: false});

            await waitFor(() => {
                expect(mockTreeFilterByDefaultValues).toHaveBeenCalled();
            });
        });
    });
});
