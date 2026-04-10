// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type LogFilterInput, LogSortableField, SortOrder, useGetHistoryDataQuery} from '../../../../_gqlTypes';
import {mapLogsToHistoryData} from './mapLogsToHistoryData';
import useLang from '../../../../hooks/useLang';
import {DEFAULT_CURRENT_PAGE} from '../../../utils/usePagination';

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
    resetPage: () => void;
};

export const useGetHistoryData = ({currentPage, pageSize, filters, resetPage}: HistoryPaginationParams) => {
    const {lang} = useLang();
    const {data, loading, error, refetch} = useGetHistoryDataQuery({
        fetchPolicy: 'no-cache',
        // Without this option, Apollo only sets `loading = true` on the initial fetch (and not on subsequent refetch calls).
        notifyOnNetworkStatusChange: true,
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

    const refresh = () => {
        if (currentPage === DEFAULT_CURRENT_PAGE) {
            refetch({
                filters,
                sort: {
                    field: LogSortableField.time,
                    order: SortOrder.desc,
                },
                pagination: {
                    limit: pageSize,
                    offset: 0,
                },
            });
            return;
        }

        resetPage();
    };

    if (loading || error || !data) {
        return {
            data: [],
            total: 0,
            loading,
            error,
            refresh,
        };
    }

    return {
        data: mapLogsToHistoryData(data?.logs, lang) ?? [],
        total: data.logs?.total ?? 0,
        loading,
        error,
        refresh,
    };
};
