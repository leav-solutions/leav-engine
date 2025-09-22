// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LogAction, useGetRecordHistoryQuery} from '_ui/_gqlTypes';
import {type LogEntry} from '../_types';
import {useCallback, useEffect, useState} from 'react';

export interface IUseFetchRecordHistoryHook {
    loading: boolean;
    inError: boolean;
    logs: LogEntry[];
    total: number;
    hasMore: boolean;
    fetchMore: () => void;
}

export interface IUseFetchRecordHistoryProps {
    record: {id: string; libraryId: string};
    attributeId?: string;
}

export const RECORD_HISTORY_LOGS_PAGE = 50;
export const RECORD_HISTORY_LOGS_FIRST_PAGE = 1;
const eventsToFetch = [LogAction.VALUE_SAVE, LogAction.VALUE_DELETE];

export const useFetchRecordHistory = ({
    record,
    attributeId
}: IUseFetchRecordHistoryProps): IUseFetchRecordHistoryHook => {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [total, setTotal] = useState<number>(0);
    const [hasMore, setHasMore] = useState<boolean>(false);

    const {
        loading,
        error,
        data: history,
        refetch
    } = useGetRecordHistoryQuery({
        fetchPolicy: 'network-only',
        variables: {
            record: {
                id: record.id,
                libraryId: record.libraryId
            },
            attributeId,
            actions: eventsToFetch,
            pagination: {limit: RECORD_HISTORY_LOGS_FIRST_PAGE, offset: 0}
        }
    });

    useEffect(() => {
        // Reset if record or attribute change
        setLogs([]);
        setTotal(0);
        setHasMore(false);
    }, [record.id, record.libraryId, attributeId]);

    const fetchMore = useCallback(() => {
        refetch({
            record: {
                id: record.id,
                libraryId: record.libraryId
            },
            attributeId,
            actions: eventsToFetch,
            pagination: {limit: RECORD_HISTORY_LOGS_PAGE, offset: logs.length}
        });
    }, [logs.length, refetch, record.id, record.libraryId, attributeId]);

    useEffect(() => {
        if (loading || !history) {
            return;
        }
        const newLogs = [...logs, ...history.logs.logs];
        const newTotal = history.logs.total || 0;
        setLogs(newLogs);
        setTotal(newTotal);
        setHasMore(newLogs.length < newTotal);
    }, [history, loading]);

    return {
        loading,
        inError: !!error,
        logs,
        total,
        hasMore,
        fetchMore
    };
};
