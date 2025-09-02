// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {QueryResult} from '@apollo/client';
import {renderHook} from '@testing-library/react';
import * as gqlTypes from '_ui/_gqlTypes';
import {useFetchRecordHistory} from './useFetchRecordHistory';

describe('useFetchRecordHistory', () => {
    const useGetRecordHistoryQuerySpy = jest.spyOn(gqlTypes, 'useGetRecordHistoryQuery');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('Should fetch record history for a record', async () => {
        const fetchedLogs = [{id: 'log-1'}, {id: 'log-2'}];
        useGetRecordHistoryQuerySpy.mockReturnValue({
            loading: false,
            data: {logs: fetchedLogs}
        } as QueryResult<any, any>);

        const {result} = renderHook(() =>
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
                pagination: {limit: 50, offset: 0}
            }
        });
        expect(result.current.loading).toBe(false);
        expect(result.current.inError).toBe(false);
        expect(result.current.logs).toEqual(fetchedLogs);
    });

    it('Should fetch record history for a record attribute', async () => {
        const fetchedLogs = [{id: 'log-attribute-1'}, {id: 'log-attribute-2'}];
        useGetRecordHistoryQuerySpy.mockReturnValue({
            loading: false,
            data: {logs: fetchedLogs}
        } as QueryResult<any, any>);

        const {result} = renderHook(() =>
            useFetchRecordHistory({
                record: {id: 'record-1', libraryId: 'lib-1'},
                attributeId: 'attribute-1'
            })
        );

        expect(gqlTypes.useGetRecordHistoryQuery).toHaveBeenCalledWith({
            fetchPolicy: 'network-only',
            variables: {
                record: {
                    id: 'record-1',
                    libraryId: 'lib-1'
                },
                attributeId: 'attribute-1',
                actions: [gqlTypes.LogAction.VALUE_SAVE, gqlTypes.LogAction.VALUE_DELETE],
                pagination: {limit: 50, offset: 0}
            }
        });
        expect(result.current.loading).toBe(false);
        expect(result.current.inError).toBe(false);
        expect(result.current.logs).toEqual(fetchedLogs);
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
