import {useMemo} from 'react';
import {useGetRecordUpdatesSubscription} from '_ui/hooks';
import {type Entrypoint, type IEntrypointLink, type IExplorerData, type SerializedView} from '../_types';
import {
    type ExplorerV2LinkDataQuery,
    type ExplorerV2LinkPropertyLinkValueFragment,
    type SortOrder,
    useExplorerLinkAttributeQuery,
    useExplorerV2LibraryDataLazyQuery,
    useExplorerV2LibraryDataQuery,
    useExplorerV2LinkDataQuery,
} from '_ui/_gqlTypes';
import {type UIFilter} from '_ui/components/Filters/_types';
import {prepareFiltersForRequest} from '_ui/components/Filters';
import {AttributeConditionFilter} from '_ui/types';
import {useWatchLibraryRecordUpdates} from '_ui/modules/watch-record-updates';
import {mapLibraryDataToExplorerData} from './mapLibraryDataToExplorerData';
import {getLibraryRequestValuesList} from './getLibraryRequestValuesList';

export const dateValuesSeparator = '\n';

const _mappingLink = (data: ExplorerV2LinkDataQuery, libraryId: string): IExplorerData => {
    const records =
        (data.records.list.length &&
            data.records.list[0].property
                .map((linkValue: ExplorerV2LinkPropertyLinkValueFragment, index: number) => {
                    if (!linkValue.payload) {
                        return null;
                    }

                    return {
                        libraryId,
                        // same link id can be duplicated, so we add the index to the key
                        key: linkValue.payload.whoAmI.id + index, // For <KitTable /> only
                        itemId: linkValue.payload.whoAmI.id, // For <KitTable /> only
                        canActivate: true,
                        canDelete: true,
                        active: true,
                        whoAmI: {
                            label: null,
                            subLabel: null,
                            color: null,
                            preview: null,
                            ...linkValue.payload.whoAmI,
                        },
                        propertiesById: linkValue.payload.properties.reduce(
                            (acc, {attributeId, values}) => ({...acc, [attributeId]: values}),
                            {},
                        ),
                        valuesCountById: linkValue.payload.badgeProperties.reduce(
                            (acc, {attributeId, valuesCount}) => ({...acc, [attributeId]: valuesCount}),
                            {},
                        ),
                        id_value: linkValue.id_value ?? undefined,
                    };
                })
                .filter(Boolean)) ||
        [];

    return {
        totalCount: records.length,
        records,
    };
};

export const useExplorerData = ({
    entrypoint,
    libraryId,
    attributeIds,
    badgeAttributeIds,
    fulltextSearch,
    sorts,
    pagination,
    filters,
    filtersOperator,
    skip,
    refetchCount,
}: {
    entrypoint: Entrypoint;
    libraryId: string;
    attributeIds: string[];
    /** Columns fetched as a count only (`badge_qty` multivalued) — see `splitBadgeColumns`. */
    badgeAttributeIds: string[];
    fulltextSearch: string;
    sorts: Array<{
        field: string;
        order: SortOrder;
    }>;
    pagination: null | {limit: number; offset: number};
    filters: UIFilter[];
    filtersOperator: SerializedView['filtersOperator'];
    skip: boolean;
    // Called alongside the list reload when an unlisted record of the library switches `active`.
    // A returned promise has its rejection swallowed with the reload's one.
    refetchCount?: () => void | Promise<unknown>;
}) => {
    const isLibrary = entrypoint.type === 'library';
    const isLink = entrypoint.type === 'link';

    const {data: attributeData} = useExplorerLinkAttributeQuery({
        skip: isLibrary,
        variables: {
            id: (entrypoint as IEntrypointLink).linkAttributeId,
        },
    });

    const isLinkAttributeAllowed = attributeData?.attributes?.list?.[0]?.permissions?.access_attribute;
    const {
        data: linkData,
        loading: linkLoading,
        refetch: linkRefetch,
    } = useExplorerV2LinkDataQuery({
        fetchPolicy: 'network-only',
        skip: skip || !isLink || !isLinkAttributeAllowed,
        variables: {
            parentLibraryId: (entrypoint as IEntrypointLink).parentLibraryId,
            parentRecordId: (entrypoint as IEntrypointLink).parentRecordId,
            linkAttributeId: (entrypoint as IEntrypointLink).linkAttributeId,
            attributeIds,
            badgeAttributeIds,
        },
    });

    const valuesList = getLibraryRequestValuesList(entrypoint, fulltextSearch);
    const preparedFilters = prepareFiltersForRequest(filters, filtersOperator, valuesList);

    const {
        data: libraryData,
        loading: libraryLoading,
        refetch: libraryRefetch,
    } = useExplorerV2LibraryDataQuery({
        fetchPolicy: 'network-only',
        skip: skip || !isLibrary,
        variables: {
            libraryId,
            attributeIds,
            badgeAttributeIds,
            pagination,
            searchQuery: fulltextSearch,
            multipleSort: sorts,
            filters: preparedFilters,
        },
    });

    const [fetchLibraryRecord] = useExplorerV2LibraryDataLazyQuery();

    const isMultivalue = !!attributeData?.attributes?.list?.[0]?.multiple_values;
    const canEditLinkAttributeValues = !!attributeData?.attributes?.list?.[0]?.permissions?.edit_value;

    const memoizedData = useMemo(() => {
        if (isLibrary) {
            return libraryData ? mapLibraryDataToExplorerData(libraryData, libraryId) : null;
        }

        if (isLink) {
            return linkData ? _mappingLink(linkData, libraryId) : null;
        }

        return null;
    }, [libraryData, linkData]);

    const ids = memoizedData?.records.map(record => record.itemId);

    // A link entrypoint keeps the value-carrying subscription, scoped to its linked records
    // only (permission-safe: they are displayed, hence readable): each event patches the
    // linked records' values straight into the Apollo cache (see the hook's onData).
    useGetRecordUpdatesSubscription(
        {libraries: [libraryId], records: ids},
        skip || !isLink || !libraryId || !ids || ids.length === 0,
    );

    // A library entrypoint watches the WHOLE library, not just the listed records: a record
    // created outside the explorer (e.g. from a creation form in a popup above it) is unknown
    // to the list, but its activation — the last step of a creation — flags the list content
    // as dirty. The subscription is the light one (no business data) and the flushes are
    // debounced: see the module for the classification and storm-collapsing rules.
    useWatchLibraryRecordUpdates({
        libraryId,
        skip: skip || !isLibrary,
        visibleRecordIds: ids,
        onVisibleRecordsTouched: recordIds =>
            recordIds.length === 1
                ? // A single listed record changed: refresh it in place.
                  fetchLibraryRecord({
                      variables: {
                          libraryId,
                          attributeIds,
                          // Must match the list query's split, or this writes a cache entry the list never reads.
                          badgeAttributeIds,
                          filters: [
                              {
                                  field: 'id',
                                  condition: AttributeConditionFilter.EQUAL,
                                  value: recordIds[0],
                              },
                          ],
                      },
                      fetchPolicy: 'network-only',
                  })
                : // Several listed records changed at once: one list reload beats N unit fetches.
                  libraryRefetch(),
        onListContentMaybeChanged: () => Promise.all([libraryRefetch(), refetchCount?.()]),
    });

    return {
        data: memoizedData,
        isMultivalue,
        canEditLinkAttributeValues,
        loading: isLibrary ? libraryLoading : linkLoading,
        refetch: isLibrary ? libraryRefetch : linkRefetch,
    };
};
