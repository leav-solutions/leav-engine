import {type ExplorerV2LibraryDataQuery} from '_ui/_gqlTypes';
import {type IExplorerData} from '../_types';

/**
 * Maps an ExplorerV2LibraryData response to the explorer data shape. Shared by `useExplorerData`
 * (single paginated set) and the kanban per-column loading (one response per column page), so both
 * produce strictly identical records. Data only — attribute metadata is loaded upfront by
 * `useExplorerLibraryMetadata`.
 */
export const mapLibraryDataToExplorerData = (data: ExplorerV2LibraryDataQuery, libraryId: string): IExplorerData => {
    const records = data.records.list.map(({whoAmI, active, permissions, properties}) => ({
        libraryId,
        key: whoAmI.id, // For <KitTable /> only
        itemId: whoAmI.id, // For <KitTable /> only
        active,
        canActivate: permissions.create_record,
        canDelete: permissions.delete_record,
        whoAmI: {
            label: null,
            subLabel: null,
            color: null,
            preview: null,
            ...whoAmI,
        },
        propertiesById: properties.reduce((acc, {attributeId, values}) => ({...acc, [attributeId]: values}), {}),
    }));

    return {
        totalCount: data.records.totalCount ?? 0,
        records,
    };
};
