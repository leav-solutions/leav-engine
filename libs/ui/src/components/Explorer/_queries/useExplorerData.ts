// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {IExplorerData, IExplorerFilter} from '../_types';
import {
    AttributeFormat,
    ExplorerQuery,
    RecordFilterCondition,
    RecordFilterInput,
    RecordFilterOperator,
    SortOrder,
    useExplorerQuery
} from '_ui/_gqlTypes';
import {useLang} from '_ui/hooks';
import {useMemo} from 'react';
import {interleaveElement} from '_ui/_utils/interleaveElement';
import dayjs from 'dayjs';
import {nullValueConditions} from '../nullValuesConditions';

export const dateValuesSeparator = '\n';

const _mapping = (data: ExplorerQuery, libraryId: string, availableLangs: string[]): IExplorerData => {
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

const _getDateRequestFilters = ({
    field,
    condition,
    value
}: Pick<IExplorerFilter, 'field' | 'value' | 'condition'>): RecordFilterInput[] => {
    switch (condition) {
        case RecordFilterCondition.BETWEEN:
            const [from, to] = value!.split(dateValuesSeparator);
            return [
                {
                    field,
                    condition,
                    value: JSON.stringify({
                        from,
                        to
                    })
                }
            ];
        case RecordFilterCondition.NOT_EQUAL:
            return [
                {
                    field,
                    condition: RecordFilterCondition.LESS_THAN,
                    value: dayjs.unix(Number(value)).startOf('day').unix().toString()
                },
                {operator: RecordFilterOperator.OR},
                {
                    field,
                    condition: RecordFilterCondition.GREATER_THAN,
                    value: dayjs.unix(Number(value)).endOf('day').unix().toString()
                }
            ];
        case RecordFilterCondition.EQUAL:
            return [
                {
                    field,
                    condition: RecordFilterCondition.BETWEEN,
                    value: JSON.stringify({
                        from: dayjs.unix(Number(value)).startOf('day').unix().toString(),
                        to: dayjs.unix(Number(value)).endOf('day').unix().toString()
                    })
                }
            ];
        default:
            return [
                {
                    field,
                    condition,
                    value
                }
            ];
    }
};

export const useExplorerData = ({
    libraryId,
    attributeIds,
    fulltextSearch,
    sorts,
    pagination,
    filters,
    skip
}: {
    libraryId: string;
    attributeIds: string[];
    fulltextSearch: string;
    sorts: Array<{
        field: string;
        order: SortOrder;
    }>;
    pagination: null | {limit: number; offset: number};
    filters: IExplorerFilter[];
    skip: boolean;
}) => {
    const {lang: availableLangs} = useLang();

    const queryFilters = interleaveElement(
        {operator: RecordFilterOperator.AND},
        filters
            .filter(({value, condition}) => value !== null || nullValueConditions.includes(condition))
            .map(({attribute, field, condition, value}) =>
                attribute.format === AttributeFormat.date
                    ? _getDateRequestFilters({field, condition, value})
                    : [
                          {
                              field,
                              condition,
                              value
                          }
                      ]
            )
    );

    const {data, loading, refetch} = useExplorerQuery({
        skip,
        variables: {
            libraryId,
            attributeIds,
            pagination,
            searchQuery: fulltextSearch,
            multipleSort: sorts.map(({order, field}) => ({
                field,
                order
            })),
            filters: queryFilters
        }
    });

    const memoizedData = useMemo(() => (data !== undefined ? _mapping(data, libraryId, availableLangs) : null), [data]);

    return {
        data: memoizedData,
        loading,
        refetch
    };
};
