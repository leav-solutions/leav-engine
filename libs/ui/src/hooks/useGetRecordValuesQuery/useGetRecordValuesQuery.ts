// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {QueryResult, useQuery} from '@apollo/client';
import {Override} from '@leav/utils';
import {useState} from 'react';
import {RecordFilterCondition, RecordFilterInput, RecordFilterOperator} from '_ui/_gqlTypes';
import {
    getRecordColumnsValues,
    GetRecordColumnsValuesRecord,
    IGetRecordColumnsValues,
    IGetRecordColumnsValuesVariables
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
    recordIds: string[]
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
            filters: _recordIdsToQueryFilters(recordIds)
        },
        skip: !libraryId || !columns.length || !recordIds.length,
        onCompleted: data => {
            const cleanData: IColumnsValuesByRecord = _convertQueryResult(data);
            setQueryData(cleanData);
        }
    });

    const customRefetch = async (refetchRecordIds: string[]) => {
        const customVariables = {
            filters: _recordIdsToQueryFilters(refetchRecordIds ?? [])
        };

        const refetchData = await query.refetch(customVariables);

        const cleanData: IColumnsValuesByRecord = _convertQueryResult(refetchData.data);
        setQueryData({...queryData, ...cleanData});

        return refetchData;
    };

    // @ts-ignore
    return {
        ...query,
        loading: query.loading || typeof queryData === undefined,
        data: queryData,
        refetch: customRefetch
    };
};
