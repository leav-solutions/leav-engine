// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {
    Entrypoint,
    IEntrypointLink,
    IExplorerData,
    ExplorerFilter,
    isExplorerFilterStandard,
    IExplorerFilterStandard,
    isExplorerFilterThrough
} from '../_types';
import {
    AttributeFormat,
    ExplorerLibraryDataQuery,
    ExplorerLinkDataQuery,
    LinkPropertyLinkValueFragment,
    RecordFilterCondition,
    RecordFilterInput,
    RecordFilterOperator,
    SortOrder,
    useExplorerLibraryDataQuery,
    useExplorerLinkDataQuery
} from '_ui/_gqlTypes';
import {useLang} from '_ui/hooks';
import {useMemo} from 'react';
import {interleaveElement} from '_ui/_utils/interleaveElement';
import dayjs from 'dayjs';
import {nullValueConditions} from '../conditionsHelper';
import {AttributeConditionFilter} from '_ui/types';

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

    const records = data.records.list.map(({whoAmI, properties}) => ({
        libraryId,
        key: whoAmI.id, // For <KitTable /> only
        itemId: whoAmI.id, // For <KitTable /> only
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
        .map((linkValue: LinkPropertyLinkValueFragment) => {
            if (!linkValue.payload) {
                return null;
            }

            return {
                libraryId,
                key: linkValue.payload.whoAmI.id, // For <KitTable /> only
                itemId: linkValue.payload.whoAmI.id, // For <KitTable /> only
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

const _getDateRequestFilters = (filter: IExplorerFilterStandard): RecordFilterInput[] => {
    switch (filter.condition) {
        case RecordFilterCondition.BETWEEN:
            const [from, to] = filter.value!.split(dateValuesSeparator);
            return [
                {
                    field: filter.field,
                    condition: filter.condition,
                    value: JSON.stringify({
                        from,
                        to
                    })
                }
            ];
        case RecordFilterCondition.NOT_EQUAL:
            return [
                {
                    field: filter.field,
                    condition: RecordFilterCondition.LESS_THAN,
                    value: dayjs.unix(Number(filter.value)).startOf('day').unix().toString()
                },
                {operator: RecordFilterOperator.OR},
                {
                    field: filter.field,
                    condition: RecordFilterCondition.GREATER_THAN,
                    value: dayjs.unix(Number(filter.value)).endOf('day').unix().toString()
                },
                {operator: RecordFilterOperator.OR},
                {
                    field: filter.field,
                    condition: RecordFilterCondition.IS_EMPTY,
                    value: null
                }
            ];
        case RecordFilterCondition.EQUAL:
            return [
                {
                    field: filter.field,
                    condition: RecordFilterCondition.BETWEEN,
                    value: JSON.stringify({
                        from: dayjs.unix(Number(filter.value)).startOf('day').unix().toString(),
                        to: dayjs.unix(Number(filter.value)).endOf('day').unix().toString()
                    })
                }
            ];
        default:
            return [
                {
                    field: filter.field,
                    condition: filter.condition,
                    value: filter.value
                }
            ];
    }
};

const _getBooleanRequestFilters = (filter: IExplorerFilterStandard): RecordFilterInput[] => {
    if (filter.value === 'false') {
        return [
            {
                field: filter.field,
                condition: AttributeConditionFilter.NOT_EQUAL,
                value: 'true'
            }
        ];
    }

    return [{field: filter.field, condition: filter.condition, value: filter.value}];
};

export const useExplorerData = ({
    entrypoint,
    libraryId,
    attributeIds,
    fulltextSearch,
    sorts,
    pagination,
    filters,
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
    skip: boolean;
}) => {
    const {lang: availableLangs} = useLang();

    const queryFilters = interleaveElement(
        {operator: RecordFilterOperator.AND},
        filters
            .filter(filter => {
                if (isExplorerFilterThrough(filter)) {
                    return (
                        filter.subField &&
                        filter.subCondition &&
                        (filter.value !== null || nullValueConditions.includes(filter.subCondition))
                    );
                }

                return filter.value !== null || (filter.condition && nullValueConditions.includes(filter.condition));
            })
            .map(filter => {
                const condition =
                    filter.condition === AttributeConditionFilter.THROUGH ? filter.subCondition : filter.condition;
                const field =
                    filter.condition === AttributeConditionFilter.THROUGH
                        ? `${filter.field}.${filter.subField}`
                        : filter.field;
                const filterConcat: ExplorerFilter = {...filter, condition, field};

                if (isExplorerFilterStandard(filterConcat)) {
                    switch (filterConcat.attribute.format) {
                        case AttributeFormat.date:
                            return _getDateRequestFilters(filterConcat);
                        case AttributeFormat.boolean:
                            return _getBooleanRequestFilters(filterConcat);
                        default:
                            break;
                    }
                }
                return [
                    {
                        field: filterConcat.field,
                        condition: filterConcat.condition,
                        value: filterConcat.value
                    }
                ] as RecordFilterInput[];
            })
    );

    const isLibrary = entrypoint.type === 'library';
    const isLink = entrypoint.type === 'link';

    const {
        data: linkData,
        loading: linkLoading,
        refetch: linkRefetch
    } = useExplorerLinkDataQuery({
        fetchPolicy: 'network-only',
        skip: skip || !isLink,
        variables: {
            parentLibraryId: (entrypoint as IEntrypointLink).parentLibraryId,
            parentRecordId: (entrypoint as IEntrypointLink).parentRecordId,
            linkAttributeId: (entrypoint as IEntrypointLink).linkAttributeId,
            attributeIds
        }
    });

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
            filters: queryFilters
        }
    });

    const memoizedData = useMemo(() => {
        if (isLibrary) {
            return libraryData ? _mappingLibrary(libraryData, libraryId, availableLangs) : null;
        }

        if (isLink) {
            return linkData ? _mappingLink(linkData, libraryId, availableLangs) : null;
        }

        return null;
    }, [libraryData, linkData]);

    return {
        data: memoizedData,
        loading: isLibrary ? libraryLoading : linkLoading,
        refetch: isLibrary ? libraryRefetch : linkRefetch
    };
};
