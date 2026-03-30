// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type LogFilterInput, LogSortableField, SortOrder, useGetHistoryDataQuery} from '../../../../_gqlTypes';
import {mapLogsToHistoryData} from './mapLogsToHistoryData';
import useLang from '../../../../hooks/useLang';

export type HistoryData = {
    key: string;
    date: string;
    user: string;
    action: string;
    object: string;
    entity: string;
    details: string;
    before: string;
    after: string;
    queryId: string;
    rawJson: string;
};

export type HistoryPaginationParams = {
    currentPage: number;
    pageSize: number;
    filters?: LogFilterInput;
};

export const useGetHistoryData = ({currentPage, pageSize, filters}: HistoryPaginationParams) => {
    const {lang} = useLang();
    const {data, loading, error} = useGetHistoryDataQuery({
        fetchPolicy: 'no-cache',
        variables: {
            filters,
            sort: {
                field: LogSortableField.time,
                order: SortOrder.desc,
            },
            pagination: {
                limit: pageSize,
                offset: (currentPage - 1) * pageSize,
            },
        },
    });

    if (loading || error || !data) {
        return {
            data: [],
            total: 0,
            loading,
            error,
        };
    }

    return {
        data: mapLogsToHistoryData(data?.logs, lang) ?? [],
        total: data.logs?.total ?? 0,
        loading,
        error,
    };
};
