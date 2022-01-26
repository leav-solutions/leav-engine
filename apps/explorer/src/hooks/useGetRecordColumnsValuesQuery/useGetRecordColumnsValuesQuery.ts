// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {QueryResult, useQuery} from '@apollo/client';
import {Override} from '@leav/utils';
import {
    getRecordColumnsValues,
    GetRecordColumnsValuesRecord,
    IGetRecordColumnsValues,
    IGetRecordColumnsValuesVariables
} from 'graphQL/queries/records/getRecordColumnsValues';
import {useState} from 'react';
import {RecordFilterCondition, RecordFilterOperator} from '_gqlTypes/globalTypes';
import {IQueryFilter} from '_types/types';

export interface IColumnsValuesByRecord {
    [recordId: string]: GetRecordColumnsValuesRecord;
}

export type IUseGetRecordColumnsValuesQueryHook = Override<
    QueryResult<IGetRecordColumnsValues>,
    {data: IColumnsValuesByRecord}
>;

const _recordIdsToQueryFilters = (recordIds: string[]): IQueryFilter[] =>
    recordIds.reduce((allFilters: IQueryFilter[], recordId: string, i: number) => {
        if (i) {
            allFilters.push({operator: RecordFilterOperator.OR});
        }

        allFilters.push({field: 'id', condition: RecordFilterCondition.EQUAL, value: recordId});

        return allFilters;
    }, []);

export const useGetRecordColumnsValuesQuery = (
    libraryGqlQueryType: string,
    columns: string[],
    recordIds: string[]
): IUseGetRecordColumnsValuesQueryHook => {
    const [queryData, setQueryData] = useState<IColumnsValuesByRecord>();

    const _convertQueryResult = (queryResult: IGetRecordColumnsValues): IColumnsValuesByRecord =>
        (queryResult[libraryGqlQueryType]?.list ?? []).reduce((valuesByRecord, recordValues) => {
            valuesByRecord[recordValues._id] = recordValues;
            return valuesByRecord;
        }, {});

    const query = useQuery<IGetRecordColumnsValues, IGetRecordColumnsValuesVariables>(
        getRecordColumnsValues(libraryGqlQueryType, columns),
        {
            variables: {
                // Turn records ids into filters with OR operators
                filters: _recordIdsToQueryFilters(recordIds)
            },
            skip: !libraryGqlQueryType || !columns.length || !recordIds.length,
            onCompleted: data => {
                const cleanData: IColumnsValuesByRecord = _convertQueryResult(data);
                setQueryData(cleanData);
            }
        }
    );

    const customRefetch = async (refetchRecordIds: string[]) => {
        const customVariables = {
            filters: _recordIdsToQueryFilters(refetchRecordIds ?? [])
        };

        const refetchData = await query.refetch(customVariables);

        const cleanData: IColumnsValuesByRecord = _convertQueryResult(refetchData.data);
        setQueryData({...queryData, ...cleanData});

        return refetchData;
    };

    return {
        ...query,
        loading: query.loading || typeof queryData === undefined,
        data: queryData,
        refetch: customRefetch
    };
};
