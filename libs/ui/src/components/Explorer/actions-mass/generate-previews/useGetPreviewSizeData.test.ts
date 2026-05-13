import {type MockedResponse} from '@apollo/client/testing';
import {GetLibraryPreviewsSettingsDocument} from '_ui/_gqlTypes';
import {renderHook, waitFor} from '_ui/_tests/testUtils';
import {SELECT_ALL_KEY, useGetPreviewSizesData} from './useGetPreviewSizesData';

const libraryId = 'files';

const mockLibraryPreviewsSettings = {
    libraries: {
        list: [
            {
                id: libraryId,
                label: {fr: 'Fichiers', en: 'Files'},
                behavior: 'standard',
                previewsSettings: [
                    {
                        label: {fr: 'Aperçu système', en: 'System preview'},
                        description: null,
                        system: true,
                        versions: {
                            background: '#ffffff',
                            density: 72,
                            sizes: [
                                {name: 'small', size: 32},
                                {name: 'medium', size: 64},
                                {name: 'big', size: 128},
                            ],
                        },
                    },
                    {
                        label: {fr: 'Autre version', en: 'Other version'},
                        description: null,
                        system: false,
                        versions: {
                            background: '#000000',
                            density: 300,
                            sizes: [{name: 'huge', size: 256}],
                        },
                    },
                ],
            },
        ],
    },
};

describe('useGetPreviewSizesData', () => {
    const mocks: MockedResponse[] = [
        {
            request: {
                query: GetLibraryPreviewsSettingsDocument,
                variables: {id: libraryId},
            },
            result: {
                data: mockLibraryPreviewsSettings,
            },
        },
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should return loading state initially', () => {
        const mocksWithDelay: MockedResponse[] = [
            {
                request: {
                    query: GetLibraryPreviewsSettingsDocument,
                    variables: {id: libraryId},
                },
                result: {
                    data: mockLibraryPreviewsSettings,
                },
                delay: 1_000,
            },
        ];

        const {result} = renderHook(() => useGetPreviewSizesData(libraryId), {
            mocks: mocksWithDelay,
        });

        expect(result.current.loading).toBe(true);
        expect(result.current.previewSizesTreeData).toEqual([]);
        expect(result.current.allPreviewSizes).toEqual([]);
        expect(result.current.error).toBeUndefined();
    });

    test('should return error when query fails', async () => {
        const errorMocks: MockedResponse[] = [
            {
                request: {
                    query: GetLibraryPreviewsSettingsDocument,
                    variables: {id: libraryId},
                },
                error: new Error('Network error'),
            },
        ];

        const {result} = renderHook(() => useGetPreviewSizesData(libraryId), {
            mocks: errorMocks,
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBeDefined();
        expect(result.current.error?.message).toBe('Network error');
        expect(result.current.previewSizesTreeData).toEqual([]);
        expect(result.current.allPreviewSizes).toEqual([]);
    });

    test('should handle empty previews settings', async () => {
        const emptyMocks: MockedResponse[] = [
            {
                request: {
                    query: GetLibraryPreviewsSettingsDocument,
                    variables: {id: libraryId},
                },
                result: {
                    data: {
                        libraries: {
                            list: [
                                {
                                    id: libraryId,
                                    label: {fr: 'Fichiers', en: 'Files'},
                                    behavior: 'standard',
                                    previewsSettings: [],
                                },
                            ],
                        },
                    },
                },
            },
        ];

        const {result} = renderHook(() => useGetPreviewSizesData(libraryId), {
            mocks: emptyMocks,
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.previewSizesTreeData).toHaveLength(1);
        expect(result.current.previewSizesTreeData[0].children).toEqual([]);
        expect(result.current.allPreviewSizes).toEqual([]);
    });

    test('should transform library preview settings into tree data', async () => {
        const {result} = renderHook(() => useGetPreviewSizesData(libraryId), {
            mocks,
        });

        await waitFor(() => {
            expect(result.current.loading).toBe(false);
        });

        expect(result.current.error).toBeUndefined();
        expect(result.current.previewSizesTreeData).toHaveLength(1);

        const rootNode = result.current.previewSizesTreeData[0];
        expect(rootNode.key).toBe(SELECT_ALL_KEY);
        expect(rootNode.title).toBe('files.previews_generation_select_all');
        expect(rootNode.children).toHaveLength(2);

        const systemPreviewNode = rootNode.children![0];
        expect(systemPreviewNode.title).toBe('Aperçu système');
        expect(systemPreviewNode.children).toHaveLength(3);
        expect(systemPreviewNode.children).toEqual([
            {title: 'small (32px)', key: 'small'},
            {title: 'medium (64px)', key: 'medium'},
            {title: 'big (128px)', key: 'big'},
        ]);

        const otherVersionNode = rootNode.children![1];
        expect(otherVersionNode.title).toBe('Autre version');
        expect(otherVersionNode.children).toHaveLength(1);
        expect(otherVersionNode.children).toEqual([{title: 'huge (256px)', key: 'huge'}]);

        expect(result.current.allPreviewSizes).toEqual(['small', 'medium', 'big', 'huge']);
    });
});
