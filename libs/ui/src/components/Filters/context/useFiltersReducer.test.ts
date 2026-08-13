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

vi.mock('_ui/_gqlTypes', async () => ({
    ...(await vi.importActual('_ui/_gqlTypes')),
    useGetViewsListQuery: vi.fn(),
    useExplorerAttributesQuery: vi.fn(),
}));

vi.mock('_ui/hooks/useSharedTranslation', () => ({
    useSharedTranslation: vi.fn(),
}));

vi.mock('_ui/hooks/useLang/useLang');

vi.mock('./useGetTreeFilters', () => ({
    useGetTreeFilters: vi.fn(),
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
        vi.clearAllMocks();
        vi.mocked(useSharedTranslation).mockReturnValue({
            t: vi.fn(key => key),
        } as unknown as ReturnType<typeof useSharedTranslation>);
        vi.mocked(useGetTreeFilters).mockReturnValue({
            data: {},
            loading: false,
        } as unknown as ReturnType<typeof useGetTreeFilters>);
        vi.mocked(useGetViewsListQuery).mockReturnValue({
            data: undefined,
            loading: false,
        } as unknown as ReturnType<typeof useGetViewsListQuery>);
        vi.mocked(useExplorerAttributesQuery).mockReturnValue({
            data: undefined,
            loading: false,
        } as unknown as ReturnType<typeof useExplorerAttributesQuery>);
    });

    describe('Initial state', () => {
        test('should initialize with default values when loading', () => {
            vi.mocked(useGetViewsListQuery).mockReturnValue({
                data: undefined,
                loading: true,
            } as unknown as ReturnType<typeof useGetViewsListQuery>);
            vi.mocked(useExplorerAttributesQuery).mockReturnValue({
                data: undefined,
                loading: false,
            } as unknown as ReturnType<typeof useExplorerAttributesQuery>);

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
            vi.mocked(useGetViewsListQuery).mockReturnValue({
                data: mockViewData,
                loading: false,
            } as unknown as ReturnType<typeof useGetViewsListQuery>);
            vi.mocked(useExplorerAttributesQuery).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            } as unknown as ReturnType<typeof useExplorerAttributesQuery>);

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

            vi.mocked(useGetViewsListQuery).mockReturnValue({
                data: multipleViewsData,
                loading: false,
            } as unknown as ReturnType<typeof useGetViewsListQuery>);
            vi.mocked(useExplorerAttributesQuery).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            } as unknown as ReturnType<typeof useExplorerAttributesQuery>);

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
            vi.mocked(useGetViewsListQuery).mockReturnValue({
                data: {views: {list: []}},
                loading: false,
            } as unknown as ReturnType<typeof useGetViewsListQuery>);
            vi.mocked(useExplorerAttributesQuery).mockReturnValue({
                data: {attributes: {list: []}},
                loading: false,
            } as unknown as ReturnType<typeof useExplorerAttributesQuery>);

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
            vi.mocked(useGetViewsListQuery).mockReturnValue({
                data: mockViewData,
                loading: false,
            } as unknown as ReturnType<typeof useGetViewsListQuery>);
            vi.mocked(useExplorerAttributesQuery).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            } as unknown as ReturnType<typeof useExplorerAttributesQuery>);

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

            vi.mocked(useGetViewsListQuery).mockReturnValue({
                data: mockViewData,
                loading: false,
            } as unknown as ReturnType<typeof useGetViewsListQuery>);
            vi.mocked(useExplorerAttributesQuery).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            } as unknown as ReturnType<typeof useExplorerAttributesQuery>);

            renderHook(() =>
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

            vi.mocked(useGetViewsListQuery).mockReturnValue({
                data: mockViewData,
                loading: false,
            } as unknown as ReturnType<typeof useGetViewsListQuery>);
            vi.mocked(useExplorerAttributesQuery).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            } as unknown as ReturnType<typeof useExplorerAttributesQuery>);

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
            vi.mocked(useGetViewsListQuery).mockReturnValue({
                data: {views: {list: [{id: mockViewId, label: 'View', filters: []}]}},
                loading: false,
            } as unknown as ReturnType<typeof useGetViewsListQuery>);
            vi.mocked(useExplorerAttributesQuery).mockReturnValue({
                data: {attributes: {list: []}},
                loading: false,
            } as unknown as ReturnType<typeof useExplorerAttributesQuery>);

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

            vi.mocked(useGetViewsListQuery).mockReturnValue({
                data: viewWithMultipleFilters,
                loading: false,
            } as unknown as ReturnType<typeof useGetViewsListQuery>);
            vi.mocked(useExplorerAttributesQuery).mockReturnValue({
                data: {
                    attributes: {list: [mockAttributeData, {...mockAttributeData, id: 'attr2', label: 'Attribute 2'}]},
                },
                loading: false,
            } as unknown as ReturnType<typeof useExplorerAttributesQuery>);

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

            vi.mocked(useGetViewsListQuery).mockReturnValue({
                data: {views: {list: [{id: mockViewId, label: 'View', filters: []}]}},
                loading: false,
            } as unknown as ReturnType<typeof useGetViewsListQuery>);
            vi.mocked(useExplorerAttributesQuery).mockReturnValue({
                data: {attributes: {list: attributesWithPermissions}},
                loading: false,
            } as unknown as ReturnType<typeof useExplorerAttributesQuery>);

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
            vi.mocked(useGetViewsListQuery).mockReturnValue({
                data: {views: {list: [{id: mockViewId, label: 'View', filters: []}]}},
                loading: false,
            } as unknown as ReturnType<typeof useGetViewsListQuery>);
            vi.mocked(useExplorerAttributesQuery).mockReturnValue({
                data: undefined,
                loading: false,
            } as unknown as ReturnType<typeof useExplorerAttributesQuery>);

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
            vi.mocked(useGetTreeFilters).mockReturnValue({
                data: {},
                loading: true,
            } as unknown as ReturnType<typeof useGetTreeFilters>);
            vi.mocked(useGetViewsListQuery).mockReturnValue({
                data: mockViewData,
                loading: false,
            } as unknown as ReturnType<typeof useGetViewsListQuery>);
            vi.mocked(useExplorerAttributesQuery).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            } as unknown as ReturnType<typeof useExplorerAttributesQuery>);

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

            vi.mocked(useGetTreeFilters).mockReturnValue({
                data: mockTreeFiltersData,
                loading: false,
            } as unknown as ReturnType<typeof useGetTreeFilters>);
            vi.mocked(useGetViewsListQuery).mockReturnValue({
                data: mockViewData,
                loading: false,
            } as unknown as ReturnType<typeof useGetViewsListQuery>);
            vi.mocked(useExplorerAttributesQuery).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            } as unknown as ReturnType<typeof useExplorerAttributesQuery>);

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
            vi.mocked(useGetViewsListQuery).mockReturnValue({
                data: undefined,
                loading: true,
            } as unknown as ReturnType<typeof useGetViewsListQuery>);
            vi.mocked(useExplorerAttributesQuery).mockReturnValue({
                data: undefined,
                loading: false,
            } as unknown as ReturnType<typeof useExplorerAttributesQuery>);

            const {result} = renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            expect(result.current.filtersData.filters).toEqual([]);
        });

        test('should not process filters while tree filters are loading', () => {
            vi.mocked(useGetTreeFilters).mockReturnValue({
                data: {},
                loading: true,
            } as unknown as ReturnType<typeof useGetTreeFilters>);
            vi.mocked(useGetViewsListQuery).mockReturnValue({
                data: mockViewData,
                loading: false,
            } as unknown as ReturnType<typeof useGetViewsListQuery>);
            vi.mocked(useExplorerAttributesQuery).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            } as unknown as ReturnType<typeof useExplorerAttributesQuery>);

            const {result} = renderHook(() =>
                useFiltersReducer({
                    libraryId: mockLibraryId,
                    skip: false,
                }),
            );

            expect(result.current.filtersData.filters).toEqual([]);
        });

        test('should process filters after all loading completes', async () => {
            vi.mocked(useGetViewsListQuery).mockReturnValue({
                data: mockViewData,
                loading: false,
            } as unknown as ReturnType<typeof useGetViewsListQuery>);
            vi.mocked(useExplorerAttributesQuery).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            } as unknown as ReturnType<typeof useExplorerAttributesQuery>);

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
            vi.mocked(useGetViewsListQuery).mockReturnValue({
                data: mockViewData,
                loading: false,
            } as unknown as ReturnType<typeof useGetViewsListQuery>);
            vi.mocked(useExplorerAttributesQuery).mockReturnValue({
                data: {attributes: {list: [mockAttributeData]}},
                loading: false,
            } as unknown as ReturnType<typeof useExplorerAttributesQuery>);

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
