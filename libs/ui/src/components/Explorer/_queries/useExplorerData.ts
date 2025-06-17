// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {useMemo} from 'react';
import {useGetRecordUpdatesSubscription, useLang} from '_ui/hooks';
import {Entrypoint, IEntrypointLink, IExplorerData, ExplorerFilter, DefaultViewSettings} from '../_types';
import {
    ExplorerLibraryDataQuery,
    ExplorerLinkDataQuery,
    LinkPropertyLinkValueFragment,
    SortOrder,
    useExplorerLibraryDataQuery,
    useExplorerLinkAttributeQuery,
    useExplorerLinkDataQuery
} from '_ui/_gqlTypes';
import {prepareFiltersForRequest} from './prepareFiltersForRequest';

export const dateValuesSeparator = '\n';

const _mappingLibrary = (
    data: ExplorerLibraryDataQuery,
    libraryId: string,
    availableLangs: string[]
): IExplorerData => {
    const attributes = data.records.list.length
        ? data.records.list[0].properties.reduce((acc, property) => {
              acc[property.attributeId] = {
                  ...property.attributeProperties,
                  label: localizedTranslation(property.attributeProperties.label, availableLangs)
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
            ...whoAmI
        },
        propertiesById: properties.reduce((acc, {attributeId, values}) => ({...acc, [attributeId]: values}), {})
    }));

    return {
        totalCount: data.records.totalCount ?? 0,
        attributes,
        records
    };
};

const _mappingLink = (data: ExplorerLinkDataQuery, libraryId: string, availableLangs: string[]): IExplorerData => {
    const attributes = data.records.list.length
        ? ((data.records.list[0].property[0] as LinkPropertyLinkValueFragment)?.payload?.properties ?? []).reduce(
              (acc, property) => {
                  acc[property.attributeId] = {
                      ...property.attributeProperties,
                      label: localizedTranslation(property.attributeProperties.label, availableLangs)
                  };

                  return acc;
              },
              {}
          )
        : {};

    const records = data.records.list[0].property
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
                    ...linkValue.payload.whoAmI
                },
                propertiesById: linkValue.payload.properties.reduce(
                    (acc, {attributeId, values}) => ({...acc, [attributeId]: values}),
                    {}
                ),
                id_value: linkValue.id_value ?? undefined
            };
        })
        .filter(Boolean);

    return {
        totalCount: records.length,
        attributes,
        records
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
    skip
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
    filters: ExplorerFilter[];
    filtersOperator: DefaultViewSettings['filtersOperator'];
    skip: boolean;
}) => {
    const {lang: availableLangs} = useLang();

    const isLibrary = entrypoint.type === 'library';
    const isLink = entrypoint.type === 'link';

    const {data: attributeData} = useExplorerLinkAttributeQuery({
        skip: entrypoint.type !== 'link',
        variables: {
            id: (entrypoint as IEntrypointLink).linkAttributeId
        }
    });
    console.log('attributeData :>> ', attributeData);

    const isLinkAttributeAllowed = attributeData?.attributes?.list?.[0]?.permissions?.access_attribute;
    const {
        data: linkData,
        loading: linkLoading,
        refetch: linkRefetch
    } = useExplorerLinkDataQuery({
        fetchPolicy: 'network-only',
        skip: skip || !isLink || !isLinkAttributeAllowed,
        variables: {
            parentLibraryId: (entrypoint as IEntrypointLink).parentLibraryId,
            parentRecordId: (entrypoint as IEntrypointLink).parentRecordId,
            linkAttributeId: (entrypoint as IEntrypointLink).linkAttributeId,
            attributeIds
        }
    });

    console.log('linkData :>> ', linkData);
    const {
        data: libraryData,
        loading: libraryLoading,
        refetch: libraryRefetch
    } = useExplorerLibraryDataQuery({
        fetchPolicy: 'network-only',
        skip: skip || !isLibrary,
        variables: {
            libraryId,
            attributeIds,
            pagination,
            searchQuery: fulltextSearch,
            multipleSort: sorts,
            filters: prepareFiltersForRequest(filters, filtersOperator)
        }
    });

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
    useGetRecordUpdatesSubscription({libraries: [libraryId], records: ids}, !libraryId);

    return {
        data: memoizedData,
        isMultivalue,
        canEditLinkAttributeValues,
        loading: isLibrary ? libraryLoading : linkLoading,
        refetch: isLibrary ? libraryRefetch : linkRefetch
    };
};
