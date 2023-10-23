// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Log, waitFor} from '@leav/utils';
import {getConfig} from './config';
import {GraphqlClient} from './helpers/GraphqlClient';

describe('Logs', () => {
    let gqlClient: GraphqlClient;
    const newLibraryId = 'log_integration_test_lib';
    const now = Date.now();

    beforeAll(async () => {
        // Make an action that writes a log
        const config = await getConfig();
        gqlClient = new GraphqlClient(config.coreUrl);
        await gqlClient.authenticate(config.auth.login, config.auth.password);

        // Save library to trigger log write
        await gqlClient.makeCall(`
            mutation {
                saveLibrary(library: {id: "${newLibraryId}", label: {fr: "Test"}}) {
                    id
                }
            }
        `);

        await gqlClient.makeCall(`
            mutation {
                createRecord(library: "${newLibraryId}") {
                    record {id}
                }
            }
        `);

        // Wait for 1 second
        await new Promise(resolve => setTimeout(resolve, 1000));
    });

    test('Write logs and read through API', async () => {
        let logsData: Log[] = [];
        await waitFor(
            async () => {
                // Filter on time to have only relevant logs for this run
                const logsResult = await gqlClient.makeCall(`{
                    logs(filters: {time: {from: ${Math.floor(now / 1000)}}}) {
                        action
                        time
                    }
                }`);

                logsData = logsResult.data.data.logs;

                return logsData.length === 2;
            },
            {timeout: 10000, interval: 500}
        );

        expect(logsData).toHaveLength(2);
        expect(logsData[0].action).toEqual('RECORD_SAVE');
        expect(logsData[1].action).toEqual('LIBRARY_SAVE');
    });

    test('Apply filters', async () => {
        let logsData: Log[] = [];
        await waitFor(
            async () => {
                // Filter on time to have only relevant logs for this run
                const logsResult = await gqlClient.makeCall(`{
                    logs(filters: {time: {from: ${Math.floor(now / 1000) - 1}}, action: LIBRARY_SAVE}) {
                        action
                        time
                    }
                }`);

                logsData = logsResult.data.data.logs;

                return !!logsData.length;
            },
            {timeout: 10000, interval: 500}
        );

        expect(logsData).toHaveLength(1);
        expect(logsData[0].action).toEqual('LIBRARY_SAVE');
    });

    test('Apply pagination', async () => {
        let logsData: Log[] = [];
        await waitFor(
            async () => {
                // Filter on time to have only relevant logs for this run
                const logsResult = await gqlClient.makeCall(`{
                    logs(filters: {time: {from: ${Math.floor(now / 1000)}}}, pagination: {limit: 1, offset: 0}) {
                        action
                        time
                    }
                }`);

                logsData = logsResult.data.data.logs;

                return !!logsData.length;
            },
            {timeout: 10000, interval: 500}
        );

        expect(logsData).toHaveLength(1);
        expect(logsData[0].action).toEqual('RECORD_SAVE');
    });

    test('Apply sort', async () => {
        let logsData: Log[] = [];
        await waitFor(
            async () => {
                // Filter on time to have only relevant logs for this run
                const logsResult = await gqlClient.makeCall(`{
                    logs(filters: {time: {from: ${Math.floor(now / 1000)}}}, sort: {field: time, order: asc}) {
                        action
                        time
                    }
                }`);

                logsData = logsResult.data.data.logs;

                return !!logsData.length;
            },
            {timeout: 10000, interval: 500}
        );

        expect(logsData).toHaveLength(2);
        expect(logsData[0].action).toEqual('LIBRARY_SAVE');
        expect(logsData[1].action).toEqual('RECORD_SAVE');
    });
});
