import {type MockedResponse} from '@apollo/client/testing';
import {waitFor} from '@testing-library/react';
import {renderHook} from '_ui/_tests/testUtils';
import {AttributeType, ExplorerV2LibraryMetadataDocument, LibraryBehavior} from '_ui/_gqlTypes';
import {useExplorerLibraryMetadata} from './useExplorerLibraryMetadata';

const libraryId = 'campaigns';

const metadataMock = (overrides: Record<string, unknown> = {}): MockedResponse => ({
    request: {
        query: ExplorerV2LibraryMetadataDocument,
        variables: {libraryId},
    },
    result: {
        data: {
            libraries: {
                __typename: 'LibrariesList',
                list: [
                    {
                        __typename: 'Library',
                        id: libraryId,
                        label: {fr: 'Campagnes', en: 'Campaigns'},
                        behavior: LibraryBehavior.standard,
                        permissions: {__typename: 'LibraryPermissions', create_record: true},
                        attributes: [
                            {
                                __typename: 'StandardAttribute',
                                id: 'label',
                                label: {fr: 'Libellé', en: 'Label'},
                                type: AttributeType.simple,
                                format: null,
                                multiple_values: false,
                                multi_link_display_option: null,
                                multi_tree_display_option: null,
                            },
                        ],
                        ...overrides,
                    },
                ],
            },
        },
    },
});

describe('useExplorerLibraryMetadata', () => {
    describe('when libraryId is empty', () => {
        it('should skip the query and return an empty map, no library details, not loading', () => {
            const {result} = renderHook(() => useExplorerLibraryMetadata({libraryId: ''}));

            expect(result.current).toEqual({
                attributesProperties: {},
                label: null,
                behavior: null,
                hasCreateRecordPermission: false,
                loading: false,
            });
        });
    });

    describe('when the query resolves', () => {
        it('should map attributes by id with the label localized, and surface the library details', async () => {
            const {result} = renderHook(() => useExplorerLibraryMetadata({libraryId}), {
                mocks: [metadataMock()],
            });

            expect(result.current.loading).toBe(true);

            await waitFor(() => expect(result.current.loading).toBe(false));

            expect(result.current.behavior).toBe(LibraryBehavior.standard);
            expect(result.current.label).toEqual({fr: 'Campagnes', en: 'Campaigns'});
            expect(result.current.hasCreateRecordPermission).toBe(true);
            expect(result.current.attributesProperties).toEqual({
                label: expect.objectContaining({id: 'label', label: 'Libellé'}),
            });
        });
    });

    describe('map reference stability while skipped (empty libraryId)', () => {
        it('should keep returning the same empty-map instance across renders and across hook instances', () => {
            const {result, rerender} = renderHook(() => useExplorerLibraryMetadata({libraryId: ''}));
            const firstMap = result.current.attributesProperties;

            rerender();
            expect(result.current.attributesProperties).toBe(firstMap);

            // Consumers (e.g. `useMassEditableAttributes`'s useMemo) rely on this being the SAME module-
            // level constant, not merely two structurally-equal empty objects, to skip recomputation while
            // `Explorer.tsx` has not resolved a libraryId yet.
            const {result: otherInstance} = renderHook(() => useExplorerLibraryMetadata({libraryId: ''}));
            expect(otherInstance.current.attributesProperties).toBe(firstMap);
        });
    });

    describe('when the library has no attributes', () => {
        it('should return an empty map without throwing', async () => {
            const {result} = renderHook(() => useExplorerLibraryMetadata({libraryId}), {
                mocks: [metadataMock({attributes: []})],
            });

            await waitFor(() => expect(result.current.loading).toBe(false));

            expect(result.current.attributesProperties).toEqual({});
        });
    });
});
