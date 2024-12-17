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
import dayjs from 'dayjs';

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

const _getQueryFilters = (filters: IExplorerFilter[]): RecordFilterInput[] =>
    filters
        .filter(
            ({value, condition}) =>
                value !== null ||
                [RecordFilterCondition.IS_EMPTY, RecordFilterCondition.IS_NOT_EMPTY].includes(condition)
        )
        .reduce((acc, filter, index) => {
            if (index !== 0) {
                acc.push({
                    operator: RecordFilterOperator.AND
                });
            }
            if (filter.attribute.format === AttributeFormat.date) {
                acc = acc.concat(_getDateRequestFilters(filter));
            } else {
                acc.push({
                    field: filter.field,
                    condition: filter.condition,
                    value: filter.value
                });
            }
            return acc;
        }, [] as RecordFilterInput[]);

const _getDateRequestFilters = ({field, condition, value}: IExplorerFilter): RecordFilterInput[] => {
    if (!value) {
        return [];
    }
    switch (condition) {
        case RecordFilterCondition.BETWEEN:
            const [from, to] = value.split(dateValuesSeparator);
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
    filters
}: {
    libraryId: string;
    attributeIds: string[];
    fulltextSearch: string;
    sorts: Array<{
        attributeId: string;
        order: SortOrder;
    }>;
    pagination: null | {limit: number; offset: number};
    filters: IExplorerFilter[];
}) => {
    const {lang: availableLangs} = useLang();
    const {data, loading, refetch} = useExplorerQuery({
        variables: {
            libraryId,
            attributeIds,
            pagination,
            searchQuery: fulltextSearch,
            multipleSort: sorts.map(({order, attributeId}) => ({
                field: attributeId,
                order
            })),
            filters: _getQueryFilters(filters)
        }
    });

    const memoizedData = useMemo(() => (data !== undefined ? _mapping(data, libraryId, availableLangs) : null), [data]);

    return {
        data: memoizedData,
        loading,
        refetch
    };
};
