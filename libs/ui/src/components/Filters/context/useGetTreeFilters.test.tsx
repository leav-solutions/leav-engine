import {useLazyQuery} from '@apollo/client';
import {renderHook, waitFor} from '@testing-library/react';
import {useGetLibraryByIdQuery} from '_ui/_gqlTypes';
import {useGetTreeFilters} from './useGetTreeFilters';

vi.mock('@apollo/client', async () => ({
    ...(await vi.importActual('@apollo/client')),
    useLazyQuery: vi.fn(),
}));

vi.mock('_ui/_gqlTypes', async () => ({
    ...(await vi.importActual('_ui/_gqlTypes')),
    useGetLibraryByIdQuery: vi.fn(),
}));

describe('useGetTreeFilters', () => {
    const mockLibraryId = 'test-library-id';
    const mockLoadTreeContent = vi.fn();

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
            treeContent: [
                {
                    id: 'node1',
                    childrenCount: 0,
                    accessRecordByDefaultPermission: true,
                    record: {
                        id: 'record1',
                        whoAmI: {
                            id: 'record1',
                            library: {id: 'lib1'},
                            label: 'Record 1',
                        },
                    },
                    children: [],
                },
                {
                    id: 'node2',
                    childrenCount: 0,
                    accessRecordByDefaultPermission: false,
                    record: {
                        id: 'record2',
                        whoAmI: {
                            id: 'record2',
                            library: {id: 'lib1'},
                            label: 'Record 2',
                        },
                    },
                    children: [],
                },
            ],
        },
    };

    const mockTreeResponse2 = {
        data: {
            treeContent: [
                {
                    id: 'node3',
                    childrenCount: 0,
                    accessRecordByDefaultPermission: true,
                    record: {
                        id: 'record3',
                        whoAmI: {
                            id: 'record3',
                            library: {id: 'lib2'},
                            label: 'Record 3',
                        },
                    },
                    children: [],
                },
            ],
        },
    };

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useLazyQuery).mockReturnValue([
            mockLoadTreeContent,
            {} as unknown as ReturnType<typeof useLazyQuery>[1],
        ]);
    });

    describe('Initial state', () => {
        test('should return empty filters and loading true initially', () => {
            vi.mocked(useGetLibraryByIdQuery).mockReturnValue({
                data: undefined,
                loading: true,
            } as unknown as ReturnType<typeof useGetLibraryByIdQuery>);

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
            vi.mocked(useGetLibraryByIdQuery).mockReturnValue({
                data: mockLibraryData,
                loading: false,
            } as unknown as ReturnType<typeof useGetLibraryByIdQuery>);

            renderHook(() =>
                useGetTreeFilters({
                    libraryId: mockLibraryId,
                    skip: true,
                }),
            );

            expect(mockLoadTreeContent).not.toHaveBeenCalled();
        });

        test('should not fetch data when libraryId is empty', () => {
            vi.mocked(useGetLibraryByIdQuery).mockReturnValue({
                data: undefined,
                loading: false,
            } as unknown as ReturnType<typeof useGetLibraryByIdQuery>);

            renderHook(() =>
                useGetTreeFilters({
                    libraryId: '',
                    skip: false,
                }),
            );

            expect(mockLoadTreeContent).not.toHaveBeenCalled();
        });

        test('should not fetch data when library is still loading', () => {
            vi.mocked(useGetLibraryByIdQuery).mockReturnValue({
                data: undefined,
                loading: true,
            } as unknown as ReturnType<typeof useGetLibraryByIdQuery>);

            renderHook(() =>
                useGetTreeFilters({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            expect(mockLoadTreeContent).not.toHaveBeenCalled();
        });
    });

    describe('Fetching tree filters', () => {
        test('should fetch and transform tree filters correctly', async () => {
            vi.mocked(useGetLibraryByIdQuery).mockReturnValue({
                data: mockLibraryData,
                loading: false,
            } as unknown as ReturnType<typeof useGetLibraryByIdQuery>);

            mockLoadTreeContent.mockResolvedValueOnce(mockTreeResponse1).mockResolvedValueOnce(mockTreeResponse2);

            const {result} = renderHook(() =>
                useGetTreeFilters({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(mockLoadTreeContent).toHaveBeenCalledTimes(2);
            expect(mockLoadTreeContent).toHaveBeenCalledWith({
                variables: {
                    treeId: 'tree1',
                    accessRecordByDefaultPermission: {
                        attributeId: 'attribute1',
                        libraryId: mockLibraryId,
                    },
                },
            });
            expect(mockLoadTreeContent).toHaveBeenCalledWith({
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
            vi.mocked(useGetLibraryByIdQuery).mockReturnValue({
                data: mockLibraryData,
                loading: false,
            } as unknown as ReturnType<typeof useGetLibraryByIdQuery>);

            mockLoadTreeContent
                .mockResolvedValueOnce(mockTreeResponse1)
                .mockResolvedValueOnce({data: {treeContent: []}});

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

        test('should traverse nested children and flatten accessible nodes', async () => {
            vi.mocked(useGetLibraryByIdQuery).mockReturnValue({
                data: {
                    libraries: {
                        list: [
                            {
                                id: mockLibraryId,
                                permissions_conf: {
                                    permissionTreeAttributes: [{id: 'attribute1'}],
                                },
                                attributes: [{id: 'attribute1', linked_tree: {id: 'tree1'}}],
                            },
                        ],
                    },
                },
                loading: false,
            } as unknown as ReturnType<typeof useGetLibraryByIdQuery>);

            mockLoadTreeContent.mockResolvedValueOnce({
                data: {
                    treeContent: [
                        {
                            id: 'node1',
                            accessRecordByDefaultPermission: true,
                            record: {id: 'record1', whoAmI: {id: 'record1', library: {id: 'lib1'}, label: 'Root'}},
                            children: [
                                {
                                    id: 'node2',
                                    accessRecordByDefaultPermission: false,
                                    record: {
                                        id: 'record2',
                                        whoAmI: {id: 'record2', library: {id: 'lib1'}, label: 'Child no access'},
                                    },
                                    children: [],
                                },
                                {
                                    id: 'node3',
                                    accessRecordByDefaultPermission: true,
                                    record: {
                                        id: 'record3',
                                        whoAmI: {id: 'record3', library: {id: 'lib1'}, label: 'Child with access'},
                                    },
                                    children: [],
                                },
                            ],
                        },
                    ],
                },
            });

            const {result} = renderHook(() => useGetTreeFilters({libraryId: mockLibraryId, skip: false}));

            await waitFor(() => {
                expect(result.current.loading).toBe(false);
            });

            expect(result.current.data.attribute1).toEqual([
                {nodeId: 'node1', libraryId: 'lib1', value: 'record1', label: 'Root'},
                {nodeId: 'node3', libraryId: 'lib1', value: 'record3', label: 'Child with access'},
            ]);
        });

        test('should handle empty tree attributes', async () => {
            vi.mocked(useGetLibraryByIdQuery).mockReturnValue({
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
            } as unknown as ReturnType<typeof useGetLibraryByIdQuery>);

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
            expect(mockLoadTreeContent).not.toHaveBeenCalled();
        });

        test('should handle missing permissions_conf', async () => {
            vi.mocked(useGetLibraryByIdQuery).mockReturnValue({
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
            } as unknown as ReturnType<typeof useGetLibraryByIdQuery>);

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

        test('should handle empty tree content', async () => {
            vi.mocked(useGetLibraryByIdQuery).mockReturnValue({
                data: mockLibraryData,
                loading: false,
            } as unknown as ReturnType<typeof useGetLibraryByIdQuery>);

            mockLoadTreeContent
                .mockResolvedValueOnce({data: {treeContent: []}})
                .mockResolvedValueOnce({data: {treeContent: []}});

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
    });

    describe('Re-fetching on dependency change', () => {
        test('should re-fetch when libraryId changes', async () => {
            vi.mocked(useGetLibraryByIdQuery).mockReturnValue({
                data: mockLibraryData,
                loading: false,
            } as unknown as ReturnType<typeof useGetLibraryByIdQuery>);

            mockLoadTreeContent.mockResolvedValue(mockTreeResponse1);

            const {rerender} = renderHook(({libraryId, skip}) => useGetTreeFilters({libraryId, skip}), {
                initialProps: {libraryId: mockLibraryId, skip: false},
            });

            await waitFor(() => {
                expect(mockLoadTreeContent).toHaveBeenCalledTimes(2);
            });

            vi.clearAllMocks();

            rerender({libraryId: 'new-library-id', skip: false});

            await waitFor(() => {
                expect(mockLoadTreeContent).toHaveBeenCalled();
            });
        });

        test('should re-fetch when skip changes from true to false', async () => {
            vi.mocked(useGetLibraryByIdQuery).mockReturnValue({
                data: mockLibraryData,
                loading: false,
            } as unknown as ReturnType<typeof useGetLibraryByIdQuery>);

            mockLoadTreeContent.mockResolvedValue(mockTreeResponse1);

            const {rerender} = renderHook(({libraryId, skip}) => useGetTreeFilters({libraryId, skip}), {
                initialProps: {libraryId: mockLibraryId, skip: true},
            });

            expect(mockLoadTreeContent).not.toHaveBeenCalled();

            rerender({libraryId: mockLibraryId, skip: false});

            await waitFor(() => {
                expect(mockLoadTreeContent).toHaveBeenCalled();
            });
        });
    });
});
