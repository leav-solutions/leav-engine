// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {localizedTranslation} from '@leav/utils';
import {IExplorerData, IExplorerFilter} from '../_types';
import {
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
        attributeId: string;
        order: SortOrder;
    }>;
    pagination: null | {limit: number; offset: number};
    filters: IExplorerFilter[];
    skip: boolean;
}) => {
    const {lang: availableLangs} = useLang();

    let queryFilters: RecordFilterInput[] = filters
        .filter(
            ({value, condition}) =>
                value !== null ||
                [RecordFilterCondition.IS_EMPTY, RecordFilterCondition.IS_NOT_EMPTY].includes(condition)
        )
        .map(({field, condition, value}) => ({
            field,
            condition,
            value
        }));
    queryFilters = interleaveElement({operator: RecordFilterOperator.AND}, queryFilters);

    const {data, loading, refetch} = useExplorerQuery({
        skip,
        variables: {
            libraryId,
            attributeIds,
            pagination,
            searchQuery: fulltextSearch,
            multipleSort: sorts.map(({order, attributeId}) => ({
                field: attributeId,
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
