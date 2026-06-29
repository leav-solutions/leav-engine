import {type ApolloQueryResult, type QueryResult, useQuery} from '@apollo/client';
import {type Override} from '@leav/utils';
import {useEffect, useState} from 'react';
import {RecordFilterCondition, type RecordFilterInput, RecordFilterOperator} from '_ui/_gqlTypes';
import {
    getRecordColumnsValues,
    type GetRecordColumnsValuesRecord,
    type IGetRecordColumnsValues,
    type IGetRecordColumnsValuesVariables,
} from '../../_queries/records/getRecordColumnsValues';

export interface IColumnsValuesByRecord {
    [recordId: string]: GetRecordColumnsValuesRecord;
}

export type IUseGetRecordColumnsValuesQueryHook = Override<
    QueryResult<IGetRecordColumnsValues>,
    {data: IColumnsValuesByRecord}
>;

const _recordIdsToQueryFilters = (recordIds: string[]): RecordFilterInput[] =>
    recordIds.reduce((allFilters: RecordFilterInput[], recordId: string, i: number) => {
        if (i) {
            allFilters.push({operator: RecordFilterOperator.OR});
        }

        allFilters.push({field: 'id', condition: RecordFilterCondition.EQUAL, value: recordId});

        return allFilters;
    }, []);

export const useGetRecordValuesQuery = (
    libraryId: string,
    columns: string[],
    recordIds: string[],
    skip?: boolean,
): IUseGetRecordColumnsValuesQueryHook => {
    const [queryData, setQueryData] = useState<IColumnsValuesByRecord>();

    const _convertQueryResult = (queryResult: IGetRecordColumnsValues): IColumnsValuesByRecord =>
        (queryResult.records.list ?? []).reduce((valuesByRecord, recordValues) => {
            valuesByRecord[recordValues._id] = recordValues;
            return valuesByRecord;
        }, {});

    const query = useQuery<IGetRecordColumnsValues, IGetRecordColumnsValuesVariables>(getRecordColumnsValues(columns), {
        variables: {
            library: libraryId,
            // Turn records ids into filters with OR operators
            filters: _recordIdsToQueryFilters(recordIds),
        },
        skip: skip || !libraryId || !columns.length || !recordIds.length,
    });

    useEffect(() => {
        if (!query.data) {
            return;
        }

        const cleanData: IColumnsValuesByRecord = _convertQueryResult(query.data);
        setQueryData(cleanData);
    }, [query.data]);

    const customRefetch = async (refetchRecordIds: string[]) => {
        const customVariables = {
            filters: _recordIdsToQueryFilters(refetchRecordIds ?? []),
        };

        const refetchData = await query.refetch(customVariables);

        const cleanData: IColumnsValuesByRecord = _convertQueryResult(refetchData.data);
        setQueryData(prev => ({...(prev ?? {}), ...cleanData}));

        return refetchData;
    };

    // @ts-expect-error returned shape does not match the query result type
    return {
        ...query,
        loading: query.loading || typeof queryData === undefined,
        data: queryData,
        refetch: customRefetch as (
            variables?: Partial<IGetRecordColumnsValuesVariables>,
        ) => Promise<ApolloQueryResult<IGetRecordColumnsValues>>,
    };
};
