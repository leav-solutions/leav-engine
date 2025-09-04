// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {QueryResult} from '@apollo/client';
import {renderHook} from '@testing-library/react';
import * as gqlTypes from '_ui/_gqlTypes';
import {RECORD_HISTORY_LOGS_FIRST_PAGE, RECORD_HISTORY_LOGS_PAGE, useFetchRecordHistory} from './useFetchRecordHistory';

describe('useFetchRecordHistory', () => {
    const useGetRecordHistoryQuerySpy = jest.spyOn(gqlTypes, 'useGetRecordHistoryQuery');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const buildFakeLogs = ({limit, offset}: {limit: number; offset: number}) => {
        const logs = [];
        for (let i = 0; i < limit; i++) {
            logs.push({id: `log-${offset + i + 1}`});
        }
        return logs;
    };

    it('Should fetch record history for a record with pagination', async () => {
        const totalLogs = Math.round(RECORD_HISTORY_LOGS_FIRST_PAGE + RECORD_HISTORY_LOGS_PAGE * 1.5); // to have 3 pages
        let remainingToFetch = totalLogs; // for refetch mock to return the right number of logs

        // compute next return value of useGetRecordHistoryQuery call
        const useGetRecordHistoryQueryReturnValueFct = (
            variables: Pick<gqlTypes.GetRecordHistoryQueryVariables, 'pagination'>
        ) => {
            const nbLogsToReturn = Math.min(variables.pagination.limit, remainingToFetch);
            remainingToFetch -= nbLogsToReturn;
            const logsToReturn = buildFakeLogs({offset: variables.pagination.offset, limit: nbLogsToReturn});

            return {
                loading: false,
                data: {
                    logs: {
                        logs: logsToReturn,
                        total: totalLogs
                    }
                },
                refetch: refetchMock
            } as unknown as QueryResult<any, any>;
        };

        // for next calls/pages
        const refetchMock = jest.fn().mockImplementation((variables: gqlTypes.GetRecordHistoryQueryVariables) => {
            useGetRecordHistoryQuerySpy.mockReturnValue(
                useGetRecordHistoryQueryReturnValueFct({
                    pagination: variables.pagination
                })
            );
            rerender();
        });

        // for first call/page
        useGetRecordHistoryQuerySpy.mockReturnValue(
            useGetRecordHistoryQueryReturnValueFct({
                pagination: {limit: RECORD_HISTORY_LOGS_FIRST_PAGE, offset: 0}
            })
        );

        const {result, rerender} = renderHook(() =>
            useFetchRecordHistory({
                record: {id: 'record-1', libraryId: 'lib-1'}
            })
        );

        expect(gqlTypes.useGetRecordHistoryQuery).toHaveBeenCalledWith({
            fetchPolicy: 'network-only',
            variables: {
                record: {
                    id: 'record-1',
                    libraryId: 'lib-1'
                },
                attributeId: undefined,
                actions: [gqlTypes.LogAction.VALUE_SAVE, gqlTypes.LogAction.VALUE_DELETE],
                pagination: {limit: RECORD_HISTORY_LOGS_FIRST_PAGE, offset: 0}
            }
        });
        expect(result.current.loading).toBe(false);
        expect(result.current.inError).toBe(false);
        expect(result.current.total).toBe(totalLogs);
        expect(result.current.hasMore).toBe(true);
        expect(result.current.logs).toEqual(buildFakeLogs({offset: 0, limit: RECORD_HISTORY_LOGS_FIRST_PAGE}));

        result.current.fetchMore();

        expect(refetchMock).toHaveBeenCalledWith({
            record: {
                id: 'record-1',
                libraryId: 'lib-1'
            },
            attributeId: undefined,
            actions: [gqlTypes.LogAction.VALUE_SAVE, gqlTypes.LogAction.VALUE_DELETE],
            pagination: {limit: RECORD_HISTORY_LOGS_PAGE, offset: RECORD_HISTORY_LOGS_FIRST_PAGE}
        });
        expect(result.current.loading).toBe(false);
        expect(result.current.inError).toBe(false);
        expect(result.current.total).toBe(totalLogs);
        expect(result.current.hasMore).toBe(true);
        expect(result.current.logs).toEqual(
            buildFakeLogs({offset: 0, limit: RECORD_HISTORY_LOGS_PAGE + RECORD_HISTORY_LOGS_FIRST_PAGE})
        );

        result.current.fetchMore();

        expect(result.current.loading).toBe(false);
        expect(result.current.inError).toBe(false);
        expect(result.current.total).toBe(totalLogs);
        expect(result.current.hasMore).toBe(false);
        expect(result.current.logs).toEqual(buildFakeLogs({offset: 0, limit: totalLogs}));
    });

    it('Should fetch record history for a record attribute, and reset when change props', async () => {
        const fetchedLogs = [{id: 'log-attribute-1'}, {id: 'log-attribute-2'}];
        useGetRecordHistoryQuerySpy.mockReturnValue({
            loading: false,
            data: {logs: {logs: fetchedLogs, total: 42}}
        } as QueryResult<any, any>);

        const {result, rerender} = renderHook(props => useFetchRecordHistory(props), {
            initialProps: {
                record: {id: 'record-1', libraryId: 'lib-1'},
                attributeId: 'attribute-1'
            }
        });

        expect(gqlTypes.useGetRecordHistoryQuery).toHaveBeenCalledWith({
            fetchPolicy: 'network-only',
            variables: {
                record: {
                    id: 'record-1',
                    libraryId: 'lib-1'
                },
                attributeId: 'attribute-1',
                actions: [gqlTypes.LogAction.VALUE_SAVE, gqlTypes.LogAction.VALUE_DELETE],
                pagination: {limit: RECORD_HISTORY_LOGS_FIRST_PAGE, offset: 0}
            }
        });
        expect(result.current.loading).toBe(false);
        expect(result.current.inError).toBe(false);
        expect(result.current.total).toBe(42);
        expect(result.current.logs).toEqual(fetchedLogs);

        useGetRecordHistoryQuerySpy.mockReturnValue({
            loading: true
        } as QueryResult<any, any>);
        rerender({
            record: {id: 'record-2', libraryId: 'lib-1'},
            attributeId: 'attribute-2'
        });

        expect(result.current.loading).toBe(true);
        expect(result.current.total).toBe(0);
        expect(result.current.logs).toEqual([]);
    });

    it('Should set loading if fetching is in progress', async () => {
        useGetRecordHistoryQuerySpy.mockReturnValue({
            loading: true
        } as QueryResult<any, any>);

        const {result} = renderHook(() =>
            useFetchRecordHistory({
                record: {id: 'record-1', libraryId: 'lib-1'}
            })
        );

        expect(result.current.loading).toBe(true);
        expect(result.current.inError).toBe(false);
        expect(result.current.logs).toEqual([]);
    });

    it('Should set inError if fetching return an error', async () => {
        useGetRecordHistoryQuerySpy.mockReturnValue({
            loading: false,
            error: {message: 'Some error'}
        } as QueryResult<any, any>);

        const {result} = renderHook(() =>
            useFetchRecordHistory({
                record: {id: 'record-1', libraryId: 'lib-1'}
            })
        );

        expect(result.current.loading).toBe(false);
        expect(result.current.inError).toBe(true);
        expect(result.current.logs).toEqual([]);
    });
});
