// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {LogAction, useGetRecordHistoryQuery} from '_ui/_gqlTypes';
import {LogEntry} from '../_types';

export interface IUseFetchRecordHistoryHook {
    loading: boolean;
    inError: boolean;
    logs: LogEntry[];
}

export interface IUseFetchRecordHistoryProps {
    record: {id: string; libraryId: string};
    attributeId?: string;
}

const RECORD_HISTORY_LOGS_LIMIT = 50;

export const useFetchRecordHistory = ({
    record,
    attributeId
}: IUseFetchRecordHistoryProps): IUseFetchRecordHistoryHook => {
    const {loading, error, data: history} = useGetRecordHistoryQuery({
        fetchPolicy: 'network-only',
        variables: {
            record: {
                id: record.id,
                libraryId: record.libraryId
            },
            attributeId,
            actions: [LogAction.VALUE_SAVE, LogAction.VALUE_DELETE],
            pagination: {limit: RECORD_HISTORY_LOGS_LIMIT, offset: 0}
        }
    });
    return {
        loading,
        inError: !!error,
        logs: history?.logs || []
    };
};
