import {useLazyQuery} from '@apollo/client';
import {renderHook, waitFor} from '@testing-library/react';
import {useGetLibraryByIdQuery} from '_ui/_gqlTypes';
import {useGetTreeFilters} from './useGetTreeFilters';

jest.mock('@apollo/client', () => ({
    ...jest.requireActual('@apollo/client'),
    useLazyQuery: jest.fn(),
}));

jest.mock('_ui/_gqlTypes', () => ({
    ...jest.requireActual('_ui/_gqlTypes'),
    useGetLibraryByIdQuery: jest.fn(),
}));

describe('useGetTreeFilters', () => {
    const mockLibraryId = 'test-library-id';
    const mockLoadTreeContent = jest.fn();

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
        jest.clearAllMocks();
        (useLazyQuery as jest.Mock).mockReturnValue([mockLoadTreeContent, {}]);
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

            expect(mockLoadTreeContent).not.toHaveBeenCalled();
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

            expect(mockLoadTreeContent).not.toHaveBeenCalled();
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

            expect(mockLoadTreeContent).not.toHaveBeenCalled();
        });
    });

    describe('Fetching tree filters', () => {
        test('should fetch and transform tree filters correctly', async () => {
            (useGetLibraryByIdQuery as jest.Mock).mockReturnValue({
                data: mockLibraryData,
                loading: false,
            });

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
            (useGetLibraryByIdQuery as jest.Mock).mockReturnValue({
                data: mockLibraryData,
                loading: false,
            });

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
            (useGetLibraryByIdQuery as jest.Mock).mockReturnValue({
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
            });

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
            expect(mockLoadTreeContent).not.toHaveBeenCalled();
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

        test('should handle empty tree content', async () => {
            (useGetLibraryByIdQuery as jest.Mock).mockReturnValue({
                data: mockLibraryData,
                loading: false,
            });

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
            (useGetLibraryByIdQuery as jest.Mock).mockReturnValue({
                data: mockLibraryData,
                loading: false,
            });

            mockLoadTreeContent.mockResolvedValue(mockTreeResponse1);

            const {rerender} = renderHook(({libraryId, skip}) => useGetTreeFilters({libraryId, skip}), {
                initialProps: {libraryId: mockLibraryId, skip: false},
            });

            await waitFor(() => {
                expect(mockLoadTreeContent).toHaveBeenCalledTimes(2);
            });

            jest.clearAllMocks();

            rerender({libraryId: 'new-library-id', skip: false});

            await waitFor(() => {
                expect(mockLoadTreeContent).toHaveBeenCalled();
            });
        });

        test('should re-fetch when skip changes from true to false', async () => {
            (useGetLibraryByIdQuery as jest.Mock).mockReturnValue({
                data: mockLibraryData,
                loading: false,
            });

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
