import {type ExplorerV2LibraryDataQuery} from '_ui/_gqlTypes';
import {type IExplorerData, type IItemData} from '../_types';

type QueryRecord = ExplorerV2LibraryDataQuery['records']['list'][number];

/**
 * Identity cache of the mapped rows. Apollo hands back the very SAME record object for an entity that
 * did not change (result caching), so an untouched row can keep the very `IItemData` it already had.
 *
 * Without it, every refresh rebuilt all the rows — and a refresh happens after each inline write, since
 * `useExplorerData` refetches the touched record in place. `TableView`'s cells compare identities
 * (`record.whoAmI !== prevRecord.whoAmI`, `record.propertiesById[id] !== …`), so a single value changed
 * on a single row redrew the name cell of every row of the page. It also spares `TableView`'s
 * `arePropsEqual` most of its deep `isEqual`, which short-circuits on identical references.
 *
 * Keyed on the source object, so a record that genuinely changed misses the cache and maps again. The
 * `libraryId` is carried along because it is a mapping input the source object knows nothing about.
 */
const _mappedRecordCache = new WeakMap<QueryRecord, {libraryId: string; item: IItemData}>();

/**
 * Maps an ExplorerV2LibraryData response to the explorer data shape. Shared by `useExplorerData`
 * (single paginated set) and the kanban per-column loading (one response per column page), so both
 * produce strictly identical records. Data only — attribute metadata is loaded upfront by
 * `useExplorerLibraryMetadata`.
 */
export const mapLibraryDataToExplorerData = (data: ExplorerV2LibraryDataQuery, libraryId: string): IExplorerData => {
    const records = data.records.list.map(queryRecord => {
        const cached = _mappedRecordCache.get(queryRecord);
        if (cached?.libraryId === libraryId) {
            return cached.item;
        }

        const {whoAmI, active, permissions, properties, badgeProperties} = queryRecord;
        const item: IItemData = {
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
            propertiesById: Object.fromEntries(properties.map(({attributeId, values}) => [attributeId, values])),
            valuesCountById: Object.fromEntries(
                badgeProperties.map(({attributeId, valuesCount}) => [attributeId, valuesCount]),
            ),
        };

        _mappedRecordCache.set(queryRecord, {libraryId, item});
        return item;
    });

    return {
        totalCount: data.records.totalCount ?? 0,
        records,
    };
};
