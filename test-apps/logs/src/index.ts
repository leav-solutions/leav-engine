import {waitFor} from '@leav/utils';
import {getConfig} from './config';
import {getAuthenticatedSdk} from './helpers/graphqlClient';
import {LogAction, LogSortableField, SortOrder, type GetLogsQuery, type Sdk} from './_gqlTypes';

type LogEntry = NonNullable<GetLogsQuery['logsResult']>['list'][number];

describe('Logs', () => {
    let sdk: Sdk;
    const newLibraryId = 'log_integration_test_lib';
    const now = Date.now();

    beforeAll(async () => {
        // Make an action that writes a log
        const config = await getConfig();
        sdk = await getAuthenticatedSdk(config.coreUrl, config.auth.login, config.auth.password);

        // Save library to trigger log write
        await sdk.SaveLibrary({library: {id: newLibraryId, label: {fr: 'Test', en: 'Test'}}});

        await sdk.CreateRecord({library: newLibraryId});

        // Wait for 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
    });

    test('Write logs and read through API', async () => {
        let logsData: LogEntry[] = [];
        await waitFor(
            async () => {
                // Filter on time to have only relevant logs for this run
                const result = await sdk.GetLogs({filters: {time: {from: Math.floor(now / 1000)}}});

                logsData = result.logsResult!.list;

                return logsData.length === 3;
            },
            {timeout: 10000, interval: 500},
        );

        expect(logsData).toHaveLength(3);
        expect(logsData[0].action).toEqual('VALUE_SAVE');
        expect(logsData[1].action).toEqual('RECORD_INIT');
        expect(logsData[2].action).toEqual('LIBRARY_SAVE');
    });

    test('Apply filters', async () => {
        let logsData: LogEntry[] = [];
        await waitFor(
            async () => {
                // Filter on time to have only relevant logs for this run
                const result = await sdk.GetLogs({
                    filters: {time: {from: Math.floor(now / 1000) - 1}, actions: [LogAction.LIBRARY_SAVE]},
                });

                logsData = result.logsResult!.list;

                return !!logsData.length;
            },
            {timeout: 10000, interval: 500},
        );

        expect(logsData).toHaveLength(1);
        expect(logsData[0].action).toEqual('LIBRARY_SAVE');
    });

    test('Apply pagination', async () => {
        let logsData: LogEntry[] = [];
        await waitFor(
            async () => {
                // Filter on time to have only relevant logs for this run
                const result = await sdk.GetLogs({
                    filters: {time: {from: Math.floor(now / 1000)}},
                    pagination: {limit: 1, offset: 0},
                });

                logsData = result.logsResult!.list;

                return !!logsData.length;
            },
            {timeout: 10000, interval: 500},
        );

        expect(logsData).toHaveLength(1);
        expect(logsData[0].action).toEqual('VALUE_SAVE');
    });

    test('Apply sort', async () => {
        let logsData: LogEntry[] = [];
        await waitFor(
            async () => {
                // Filter on time to have only relevant logs for this run
                const result = await sdk.GetLogs({
                    filters: {time: {from: Math.floor(now / 1000)}},
                    sort: {field: LogSortableField.time, order: SortOrder.asc},
                });

                logsData = result.logsResult!.list;

                return !!logsData.length;
            },
            {timeout: 10000, interval: 500},
        );

        expect(logsData).toHaveLength(3);
        expect(logsData[0].action).toEqual('LIBRARY_SAVE');
        expect(logsData[1].action).toEqual('RECORD_INIT');
        expect(logsData[2].action).toEqual('VALUE_SAVE');
    });
});
