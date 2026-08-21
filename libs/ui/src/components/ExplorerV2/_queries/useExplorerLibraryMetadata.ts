import {localizedTranslation} from '@leav/utils';
import {type ApolloError} from '@apollo/client';
import {useMemo} from 'react';
import {useLang} from '_ui/hooks';
import {type LibraryBehavior, useExplorerV2LibraryMetadataQuery} from '_ui/_gqlTypes';
import {type SystemTranslation} from '_ui/types/scalars';
import {type AttributeProperties, type AttributesPropertiesById, type LibraryColorConfigById} from '../_types';

const emptyMap: AttributesPropertiesById = {};
const emptyColorConfigMap: LibraryColorConfigById = {};

/**
 * Loads the library's metadata and the metadata of ALL its attributes ONCE, upfront: the records
 * queries carry only data (see `mapLibraryDataToExplorerData`). Called only from `Explorer.tsx`,
 * consumers receive the map via props.
 */
export const useExplorerLibraryMetadata = ({
    libraryId,
}: {
    libraryId: string;
}): {
    attributesProperties: AttributesPropertiesById;
    libraryColorConfigById: LibraryColorConfigById;
    label: SystemTranslation | null;
    behavior: LibraryBehavior | null;
    hasCreateRecordPermission: boolean;
    loading: boolean;
    error?: ApolloError;
} => {
    const {lang: availableLangs} = useLang();

    // No `fetchPolicy: 'network-only'`: configuration metadata, stable for the explorer's lifetime,
    // shared across cache between two explorers of the same library (unlike the records queries).
    const {data, loading, error} = useExplorerV2LibraryMetadataQuery({
        skip: !libraryId,
        variables: {libraryId},
    });

    const library = data?.libraries?.list[0];

    const attributesProperties = useMemo(() => {
        const attributes = library?.attributes;
        if (!attributes?.length) {
            return emptyMap;
        }

        return attributes.reduce<AttributesPropertiesById>((acc, attribute) => {
            const localizedAttribute: AttributeProperties = {
                ...attribute,
                label: localizedTranslation(attribute.label, availableLangs),
            };
            acc[attribute.id] = localizedAttribute;

            return acc;
        }, {});
    }, [library, availableLangs]);

    const libraryColorConfigById = useMemo(() => {
        if (!library) {
            return emptyColorConfigMap;
        }

        const map: LibraryColorConfigById = {[library.id]: !!library.recordIdentityConf?.color};

        for (const attribute of library.attributes ?? []) {
            if ('linked_library' in attribute && attribute.linked_library) {
                map[attribute.linked_library.id] = !!attribute.linked_library.recordIdentityConf?.color;
            }

            if ('linked_tree' in attribute) {
                for (const {library: linkedLibrary} of attribute.linked_tree?.libraries ?? []) {
                    map[linkedLibrary.id] = !!linkedLibrary.recordIdentityConf?.color;
                }
            }
        }

        return map;
    }, [library]);

    return {
        attributesProperties,
        libraryColorConfigById,
        label: library?.label ?? null,
        behavior: library?.behavior ?? null,
        hasCreateRecordPermission: library?.permissions?.create_record ?? false,
        // No flash on a refetch or a language change, and false when the query is skipped.
        loading: loading && !data,
        error,
    };
};
