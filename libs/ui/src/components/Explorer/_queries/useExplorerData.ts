import {localizedTranslation} from '@leav/utils';
import {useMemo} from 'react';
import {useGetRecordUpdatesSubscription, useLang} from '_ui/hooks';
import {
    type Entrypoint,
    type IEntrypointLink,
    type IExplorerData,
    type DefaultViewSettings,
    type IEntrypointLibrary,
} from '../_types';
import {
    type ExplorerLibraryDataQuery,
    type ExplorerLinkDataQuery,
    type LinkPropertyLinkValueFragment,
    type SortOrder,
    useExplorerLibraryDataLazyQuery,
    useExplorerLibraryDataQuery,
    useExplorerLinkAttributeQuery,
    useExplorerLinkDataQuery,
} from '_ui/_gqlTypes';
import {type UIFilter} from '_ui/components/Filters/_types';
import {prepareFiltersForRequest} from '_ui/components/Filters';
import {AttributeConditionFilter} from '_ui/types';
import {useWatchLibraryRecordUpdates} from '_ui/modules/watch-record-updates';

export const dateValuesSeparator = '\n';

const _mappingLibrary = (
    data: ExplorerLibraryDataQuery,
    libraryId: string,
    availableLangs: string[],
): IExplorerData => {
    const attributes = data.records.list.length
        ? data.records.list[0].properties.reduce((acc, property) => {
              acc[property.attributeId] = {
                  ...property.attributeProperties,
                  label: localizedTranslation(property.attributeProperties.label, availableLangs),
              };

              return acc;
          }, {})
        : {};

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
        attributes,
        records,
    };
};

const _mappingLink = (data: ExplorerLinkDataQuery, libraryId: string, availableLangs: string[]): IExplorerData => {
    const attributes = data.records.list.length
        ? ((data.records.list[0].property[0] as LinkPropertyLinkValueFragment)?.payload?.properties ?? []).reduce(
              (acc, property) => {
                  acc[property.attributeId] = {
                      ...property.attributeProperties,
                      label: localizedTranslation(property.attributeProperties.label, availableLangs),
                  };

                  return acc;
              },
              {},
          )
        : {};

    const records =
        (data.records.list.length &&
            data.records.list[0].property
                .map((linkValue: LinkPropertyLinkValueFragment, index: number) => {
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
                        id_value: linkValue.id_value ?? undefined,
                    };
                })
                .filter(Boolean)) ||
        [];

    return {
        totalCount: records.length,
        attributes,
        records,
    };
};

export const useExplorerData = ({
    entrypoint,
    libraryId,
    attributeIds,
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
    fulltextSearch: string;
    sorts: Array<{
        field: string;
        order: SortOrder;
    }>;
    pagination: null | {limit: number; offset: number};
    filters: UIFilter[];
    filtersOperator: DefaultViewSettings['filtersOperator'];
    skip: boolean;
    // Called alongside the list reload when an unlisted record of the library switches `active`.
    // A returned promise has its rejection swallowed with the reload's one.
    refetchCount?: () => void | Promise<unknown>;
}) => {
    const {lang: availableLangs} = useLang();

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
    } = useExplorerLinkDataQuery({
        fetchPolicy: 'network-only',
        skip: skip || !isLink || !isLinkAttributeAllowed,
        variables: {
            parentLibraryId: (entrypoint as IEntrypointLink).parentLibraryId,
            parentRecordId: (entrypoint as IEntrypointLink).parentRecordId,
            linkAttributeId: (entrypoint as IEntrypointLink).linkAttributeId,
            attributeIds,
        },
    });

    const allowFreeEntry = isLibrary ? (entrypoint as IEntrypointLibrary).allowFreeEntry : undefined;
    const valuesList =
        !isLibrary || (fulltextSearch && allowFreeEntry) ? undefined : (entrypoint as IEntrypointLibrary).valuesList; // Remove values list for free entry values list on search
    const preparedFilters = prepareFiltersForRequest(filters, filtersOperator, valuesList);

    const {
        data: libraryData,
        loading: libraryLoading,
        refetch: libraryRefetch,
    } = useExplorerLibraryDataQuery({
        fetchPolicy: 'network-only',
        skip: skip || !isLibrary,
        variables: {
            libraryId,
            attributeIds,
            pagination,
            searchQuery: fulltextSearch,
            multipleSort: sorts,
            filters: preparedFilters,
        },
    });

    const [fetchLibraryRecord] = useExplorerLibraryDataLazyQuery();

    const isMultivalue = !!attributeData?.attributes?.list?.[0]?.multiple_values;
    const canEditLinkAttributeValues = !!attributeData?.attributes?.list?.[0]?.permissions?.edit_value;

    const memoizedData = useMemo(() => {
        if (isLibrary) {
            return libraryData ? _mappingLibrary(libraryData, libraryId, availableLangs) : null;
        }

        if (isLink) {
            return linkData ? _mappingLink(linkData, libraryId, availableLangs) : null;
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
