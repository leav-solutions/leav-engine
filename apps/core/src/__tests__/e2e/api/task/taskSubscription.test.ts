// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type Client as GraphqlWsClient} from 'graphql-ws';
import {
    adminUserSdk,
    e2eAdminUser,
    e2eNonAdminUser,
    gqlCreateRecord,
    type IE2EUser,
    makeGraphQlCall,
    makeWebSocketGraphQlCall,
    waitGraphqlWebSocketMessage,
} from '../e2eUtils';

describe('Task Subscription Permissions', () => {
    const testLibName = 'task_subscription_permissions_test';
    let adminClient: GraphqlWsClient;
    let nonAdminClient: GraphqlWsClient;

    beforeAll(async () => {
        // Create test library with export profile
        await adminUserSdk.SaveLibrary({
            library: {
                id: testLibName,
                label: {en: 'Test lib for task subscription permissions'},
                settings: {
                    export: {
                        defaultProfile: 'default',
                        profiles: [
                            {
                                label: 'default',
                                columns: [{columnLabel: 'id', attribute: 'id'}],
                            },
                        ],
                    },
                },
            },
        });

        // Create a record to export
        await gqlCreateRecord(testLibName);

        // Initialize WebSocket clients
        adminClient = await makeWebSocketGraphQlCall({user: e2eAdminUser()});
        nonAdminClient = await makeWebSocketGraphQlCall({user: e2eNonAdminUser()});
    });

    afterAll(() => {
        adminClient?.dispose();
        nonAdminClient?.dispose();
    });

    const createTaskViaExport = async (user: IE2EUser): Promise<string> => {
        const res = await makeGraphQlCall(`query { export(library: "${testLibName}") }`, {user});
        return res.data.data.export;
    };

    const taskSubscriptionQuery = `
        subscription {
            task {
                id
                created_by {
                    id
                }
            }
        }
    `;

    test('Admin user receives task updates for tasks created by any user', async () => {
        // Non-admin user creates a task
        const taskId = await createTaskViaExport(e2eNonAdminUser());

        // Admin subscribes to all task updates
        const subscriptionPromise = waitGraphqlWebSocketMessage<{task: {id: string; created_by: {id: string}}}>(
            adminClient,
            taskSubscriptionQuery,
            {},
            data => data?.task !== undefined && data.task.id === taskId,
            {timeoutMs: 10000},
        );

        // Admin should receive the task update
        const result = await subscriptionPromise;
        expect(result.task).toBeDefined();
        expect(result.task.id).toBe(taskId);
    }, 15000);

    test('Non-admin user receives task updates for their own tasks', async () => {
        // Non-admin user creates a task
        const taskId = await createTaskViaExport(e2eNonAdminUser());

        // Same non-admin subscribes to task updates
        const subscriptionPromise = waitGraphqlWebSocketMessage<{task: {id: string; created_by: {id: string}}}>(
            nonAdminClient,
            taskSubscriptionQuery,
            {},
            data => data?.task !== undefined && data.task.id === taskId,
            {timeoutMs: 10000},
        );

        // Non-admin should receive the task update
        const result = await subscriptionPromise;
        expect(result.task).toBeDefined();
        expect(result.task.id).toBe(taskId);
    }, 15000);

    test('Non-admin user does NOT receive task updates for tasks created by other users', async () => {
        // Admin creates a task
        const taskId = await createTaskViaExport(e2eAdminUser());

        // Non-admin subscribes to task updates
        const subscriptionPromise = waitGraphqlWebSocketMessage<{task: {id: string; created_by: {id: string}}}>(
            nonAdminClient,
            taskSubscriptionQuery,
            {},
            data =>
                // Only accept messages for tasks NOT created by the admin
                data?.task !== undefined && data.task.id === taskId,
            {timeoutMs: 3000},
        );

        // Non-admin should NOT receive the admin's task update (should timeout)
        await expect(subscriptionPromise).rejects.toThrow('Wait message timeout');
    }, 15000);
});
