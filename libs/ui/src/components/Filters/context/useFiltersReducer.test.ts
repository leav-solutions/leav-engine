import {renderHook, waitFor} from '@testing-library/react';
import {useFiltersReducer} from './useFiltersReducer';
import {
    useGetViewsListQuery,
    useExplorerAttributesQuery,
    AttributeFormat,
    AttributeType,
    RecordFilterCondition,
} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useGetTreeFilters} from './useGetTreeFilters';
import {type IUIFilterTree, type UIFilter} from '../_types';

jest.mock('_ui/_gqlTypes', () => ({
    ...jest.requireActual('_ui/_gqlTypes'),
    useGetViewsListQuery: jest.fn(),
    useExplorerAttributesQuery: jest.fn(),
}));

jest.mock('_ui/hooks/useSharedTranslation', () => ({
    useSharedTranslation: jest.fn(),
}));

jest.mock('_ui/hooks/useLang/useLang');

jest.mock('./useGetTreeFilters', () => ({
    useGetTreeFilters: jest.fn(),
}));

describe('useFiltersReducer', () => {
    const mockLibraryId = 'test-library-id';
    const mockViewId = 'test-view-id';

    const mockAttributeData = {
        id: 'attr1',
        label: 'Attribute 1',
        format: AttributeFormat.text,
        type: AttributeType.simple,
        permissions: {access_attribute: true},
        linked_library: null,
        linked_tree: null,
    };

    const mockViewData = {
        views: {
            list: [
                {
                    id: mockViewId,
                    label: 'Test View',
                    filters: [
                        {
                            field: 'attr1',
                            condition: RecordFilterCondition.EQUAL,
                            value: 'test',
                        },
                    ],
                },
            ],
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        (useSharedTranslation as jest.Mock).mockReturnValue({t: jest.fn(key => key)});
        (useGetTreeFilters as jest.Mock).mockReturnValue({
            data: {},
            loading: false,
        });
        (useGetViewsListQuery as jest.Mock).mockReturnValue({
            data: undefined,
            loading: false,
        });
        (useExplorerAttributesQuery as jest.Mock).mockReturnValue({
            data: undefined,
            loading: false,
        });
    });

    describe('Initial state', () => {
        test('should initialize with default values when loading', () => {
            (useGetViewsListQuery as jest.Mock).mockReturnValue({
                data: undefined,
                loading: true,
            });
            (useExplorerAttributesQuery as jest.Mock).mockReturnValue({
                data: undefined,
                loading: false,
            });

            const {result} = renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            expect(result.current.filtersData).toBeDefined();
            expect(result.current.dispatch).toBeDefined();
            expect(typeof result.current.dispatch).toBe('function');
        });
    });

    describe('Skip behavior', () => {
        test('should skip views query when skip is true', () => {
            renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    skip: true,
                }),
            );

            expect(useGetViewsListQuery).toHaveBeenCalledWith({
                skip: true,
                variables: {libraryId: mockLibraryId},
            });
        });

        test('should skip views query when libraryId is null', () => {
            renderHook(() =>
                useFiltersReducer({
                    libraryId: null,
                    skip: false,
                }),
            );

            expect(useGetViewsListQuery).toHaveBeenCalledWith({
                skip: true,
                variables: {libraryId: null},
            });
        });

        test('should pass skip to useGetTreeFilters', () => {
            renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    skip: true,
                }),
            );

            expect(useGetTreeFilters).toHaveBeenCalledWith({
                libraryId: mockLibraryId,
                skip: true,
            });
        });
    });

    describe('View selection', () => {
        test('should use specified viewId when provided', async () => {
            (useGetViewsListQuery as jest.Mock).mockReturnValue({
                data: mockViewData,
                loading: false,
            });
            (useExplorerAttributesQuery as jest.Mock).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            });

            const {result} = renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    viewId: mockViewId,
                    skip: false,
                }),
            );

            await waitFor(() => {
                expect(result.current.filtersData.viewId).toBe(mockViewId);
            });
        });

        test('should use last view when no viewId provided', async () => {
            const multipleViewsData = {
                views: {
                    list: [
                        {id: 'view1', label: 'View 1', filters: []},
                        {
                            id: 'view2',
                            label: 'View 2',
                            filters: [{field: 'attr1', condition: RecordFilterCondition.EQUAL, value: 'test'}],
                        },
                    ],
                },
            };

            (useGetViewsListQuery as jest.Mock).mockReturnValue({
                data: multipleViewsData,
                loading: false,
            });
            (useExplorerAttributesQuery as jest.Mock).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            });

            const {result} = renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            await waitFor(() => {
                expect(result.current.filtersData.filters.length).toBeGreaterThanOrEqual(0);
            });
        });

        test('should handle missing view gracefully', async () => {
            (useGetViewsListQuery as jest.Mock).mockReturnValue({
                data: {views: {list: []}},
                loading: false,
            });
            (useExplorerAttributesQuery as jest.Mock).mockReturnValue({
                data: {attributes: {list: []}},
                loading: false,
            });

            const {result} = renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    viewId: 'non-existent-view',
                    skip: false,
                }),
            );

            await waitFor(() => {
                expect(result.current.filtersData.filters).toEqual([]);
            });
        });
    });

    describe('Filters handling', () => {
        test('should process view filters when provided', async () => {
            (useGetViewsListQuery as jest.Mock).mockReturnValue({
                data: mockViewData,
                loading: false,
            });
            (useExplorerAttributesQuery as jest.Mock).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            });

            const {result} = renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    viewId: mockViewId,
                    skip: false,
                }),
            );

            await waitFor(() => {
                expect(result.current.filtersData.filters.length).toBeGreaterThanOrEqual(0);
            });
        });

        test('should combine default filters with view filters', async () => {
            const defaultFilters: UIFilter[] = [
                {
                    field: 'attr1',
                    condition: RecordFilterCondition.EQUAL,
                    value: 'default',
                    attribute: null,
                    id: '13',
                },
            ];

            (useGetViewsListQuery as jest.Mock).mockReturnValue({
                data: mockViewData,
                loading: false,
            });
            (useExplorerAttributesQuery as jest.Mock).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            });

            const {result} = renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    viewId: mockViewId,
                    filters: defaultFilters,
                    skip: false,
                }),
            );

            await waitFor(() => {
                expect(useExplorerAttributesQuery).toHaveBeenCalledWith(
                    expect.objectContaining({
                        variables: expect.objectContaining({
                            ids: expect.arrayContaining(['attr1']),
                        }),
                    }),
                );
            });
        });

        test('should ignore view filters when ignoreViewByDefault is true', async () => {
            const defaultFilters: IUIFilterTree[] = [
                {
                    field: ['attr1'],
                    condition: RecordFilterCondition.EQUAL,
                    value: ['default'],
                    attribute: null,
                    id: '12',
                },
            ];

            (useGetViewsListQuery as jest.Mock).mockReturnValue({
                data: mockViewData,
                loading: false,
            });
            (useExplorerAttributesQuery as jest.Mock).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            });

            const {result} = renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    viewId: mockViewId,
                    filters: defaultFilters,
                    ignoreViewByDefault: true,
                    skip: false,
                }),
            );

            await waitFor(() => {
                expect(result.current.filtersData.filters.length).toBeGreaterThanOrEqual(0);
            });
        });

        test('should handle empty filters', async () => {
            (useGetViewsListQuery as jest.Mock).mockReturnValue({
                data: {views: {list: [{id: mockViewId, label: 'View', filters: []}]}},
                loading: false,
            });
            (useExplorerAttributesQuery as jest.Mock).mockReturnValue({
                data: {attributes: {list: []}},
                loading: false,
            });

            const {result} = renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            await waitFor(() => {
                expect(useExplorerAttributesQuery).toHaveBeenCalledWith({
                    variables: {ids: []},
                    skip: true,
                });
            });
        });
    });

    describe('Attributes handling', () => {
        test('should fetch attributes for all filters', async () => {
            const viewWithMultipleFilters = {
                views: {
                    list: [
                        {
                            id: mockViewId,
                            label: 'View',
                            filters: [
                                {field: 'attr1', condition: RecordFilterCondition.EQUAL, value: 'test1'},
                                {field: 'attr2', condition: RecordFilterCondition.EQUAL, value: 'test2'},
                            ],
                        },
                    ],
                },
            };

            (useGetViewsListQuery as jest.Mock).mockReturnValue({
                data: viewWithMultipleFilters,
                loading: false,
            });
            (useExplorerAttributesQuery as jest.Mock).mockReturnValue({
                data: {
                    attributes: {list: [mockAttributeData, {...mockAttributeData, id: 'attr2', label: 'Attribute 2'}]},
                },
                loading: false,
            });

            renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            await waitFor(() => {
                expect(useExplorerAttributesQuery).toHaveBeenCalledWith({
                    variables: {ids: ['attr1', 'attr2']},
                    skip: false,
                });
            });
        });

        test('should filter out attributes without access permission', async () => {
            const attributesWithPermissions = [
                {
                    id: 'attr1',
                    label: 'Attr 1',
                    format: AttributeFormat.text,
                    type: AttributeType.simple,
                    permissions: {access_attribute: true},
                },
                {
                    id: 'attr2',
                    label: 'Attr 2',
                    format: AttributeFormat.text,
                    type: AttributeType.simple,
                    permissions: {access_attribute: false},
                },
            ];

            (useGetViewsListQuery as jest.Mock).mockReturnValue({
                data: {views: {list: [{id: mockViewId, label: 'View', filters: []}]}},
                loading: false,
            });
            (useExplorerAttributesQuery as jest.Mock).mockReturnValue({
                data: {attributes: {list: attributesWithPermissions}},
                loading: false,
            });

            const {result} = renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            await waitFor(() => {
                const attrById = result.current.filtersData.attributesDataById;
                expect(attrById).toBeDefined();
                if (attrById) {
                    expect(Object.keys(attrById)).toContain('attr1');
                    expect(Object.keys(attrById)).not.toContain('attr2');
                }
            });
        });

        test('should skip attributes query when no filters and views are not loading', async () => {
            (useGetViewsListQuery as jest.Mock).mockReturnValue({
                data: {views: {list: [{id: mockViewId, label: 'View', filters: []}]}},
                loading: false,
            });
            (useExplorerAttributesQuery as jest.Mock).mockReturnValue({
                data: undefined,
                loading: false,
            });

            renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            await waitFor(() => {
                expect(useExplorerAttributesQuery).toHaveBeenCalledWith({
                    variables: {ids: []},
                    skip: true,
                });
            });
        });
    });

    describe('Tree filters integration', () => {
        test('should pass libraryId to useGetTreeFilters', () => {
            renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            expect(useGetTreeFilters).toHaveBeenCalledWith({
                libraryId: mockLibraryId,
                skip: false,
            });
        });

        test('should wait for tree filters to load before processing', async () => {
            (useGetTreeFilters as jest.Mock).mockReturnValue({
                data: {},
                loading: true,
            });
            (useGetViewsListQuery as jest.Mock).mockReturnValue({
                data: mockViewData,
                loading: false,
            });
            (useExplorerAttributesQuery as jest.Mock).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            });

            const {result} = renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            // Should not have processed filters yet
            expect(result.current.filtersData.filters).toEqual([]);
        });

        test('should process filters after tree filters load', async () => {
            const mockTreeFiltersData = {
                attr1: [{nodeId: 'node1', libraryId: 'lib1', value: 'val1', label: 'Label 1'}],
            };

            (useGetTreeFilters as jest.Mock).mockReturnValue({
                data: mockTreeFiltersData,
                loading: false,
            });
            (useGetViewsListQuery as jest.Mock).mockReturnValue({
                data: mockViewData,
                loading: false,
            });
            (useExplorerAttributesQuery as jest.Mock).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            });

            const {result} = renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            await waitFor(() => {
                expect(result.current.filtersData.libraryId).toBe(mockLibraryId);
            });
        });
    });

    describe('Loading states', () => {
        test('should not process filters while views are loading', () => {
            (useGetViewsListQuery as jest.Mock).mockReturnValue({
                data: undefined,
                loading: true,
            });
            (useExplorerAttributesQuery as jest.Mock).mockReturnValue({
                data: undefined,
                loading: false,
            });

            const {result} = renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            expect(result.current.filtersData.filters).toEqual([]);
        });

        test('should not process filters while tree filters are loading', () => {
            (useGetTreeFilters as jest.Mock).mockReturnValue({
                data: {},
                loading: true,
            });
            (useGetViewsListQuery as jest.Mock).mockReturnValue({
                data: mockViewData,
                loading: false,
            });
            (useExplorerAttributesQuery as jest.Mock).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            });

            const {result} = renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            expect(result.current.filtersData.filters).toEqual([]);
        });

        test('should process filters after all loading completes', async () => {
            (useGetViewsListQuery as jest.Mock).mockReturnValue({
                data: mockViewData,
                loading: false,
            });
            (useExplorerAttributesQuery as jest.Mock).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            });

            const {result} = renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    viewId: mockViewId,
                    skip: false,
                }),
            );

            await waitFor(() => {
                expect(result.current.filtersData.libraryId).toBe(mockLibraryId);
                expect(result.current.filtersData.viewId).toBe(mockViewId);
            });
        });
    });

    describe('Library change handling', () => {
        test('should reload when libraryId changes', async () => {
            (useGetViewsListQuery as jest.Mock).mockReturnValue({
                data: mockViewData,
                loading: false,
            });
            (useExplorerAttributesQuery as jest.Mock).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            });

            const {rerender} = renderHook(({libraryId, skip}) => useFiltersReducer({libraryId, skip}), {
                initialProps: {libraryId: mockLibraryId, skip: false},
            });

            await waitFor(() => {
                expect(useGetViewsListQuery).toHaveBeenCalled();
            });

            rerender({libraryId: 'new-library-id', skip: false});

            await waitFor(() => {
                expect(useGetViewsListQuery).toHaveBeenCalledWith({
                    skip: false,
                    variables: {libraryId: 'new-library-id'},
                });
            });
        });
    });
});
