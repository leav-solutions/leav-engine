// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    e2eAdminUser,
    e2eNonAdminUser,
    gqlCreateRecord,
    gqlSaveLibrary,
    type IE2EUser,
    makeGraphQlCall,
} from '../e2eUtils';
import {waitForTaskCompletion} from '../taskUtils';

describe('TasksAdminPermissions', () => {
    const testLibName = 'tasks_admin_permissions_library_test';

    const cancelTaskMutation = (id: string) => `mutation {
        cancelTask(taskId: "${id}")
    }`;

    const deleteTaskMutation = (id: string, archive: boolean) => `mutation {
        deleteTasks(tasks: [{id: "${id}", archive: ${archive}}])
    }`;

    const accessAllTasksQuery = `query {
        tasks {
            totalCount
            list {
                id
            }
        }
    }`;

    const createTaskViaExport = async (user: IE2EUser) => {
        const res = await makeGraphQlCall(`query { export(library: "${testLibName}") }`, {user});
        return res.data.data.export;
    };

    beforeAll(async () => {
        // Create test library with export profile
        await gqlSaveLibrary(
            testLibName,
            'Test lib for task permissions',
            [],
            `{
                export: {
                    defaultProfile: "default",
                    profiles: [
                        {
                            label: "default",
                            columns: [
                                { columnLabel: "id", attribute: "id" }
                            ]
                        }
                    ]
                }
            }`,
        );

        // Create a record to export
        await gqlCreateRecord(testLibName);
    });

    describe('access all tasks', () => {
        let adminTaskId: string;
        let nonAdminTaskId: string;

        beforeAll(async () => {
            adminTaskId = await createTaskViaExport(e2eAdminUser());
            nonAdminTaskId = await createTaskViaExport(e2eNonAdminUser());
        });

        it('Should be authorized to access all tasks as admin', async () => {
            expect(adminTaskId).toBeTruthy();

            // Admin should see all tasks
            const res = await makeGraphQlCall(accessAllTasksQuery, {user: e2eAdminUser()});

            expect(res.data.data.tasks).toBeDefined();
            expect(res.data.data.tasks.totalCount).toBeGreaterThanOrEqual(2);

            // Verify the admin's task is in the results
            const taskIds = res.data.data.tasks.list.map((task: {id: string}) => task.id);
            expect(taskIds).toContain(adminTaskId);
        });

        it('Should be authorized to access my own tasks as a regular user', async () => {
            expect(nonAdminTaskId).toBeTruthy();

            // Non-admin user queries - should only see their own tasks
            const res = await makeGraphQlCall(accessAllTasksQuery, {user: e2eNonAdminUser()});

            expect(res.data.data.tasks).toBeDefined();
            expect(res.data.data.tasks.totalCount).toBeGreaterThanOrEqual(1);

            // Verify the non-admin's task is in the results
            const taskIds = res.data.data.tasks.list.map((task: {id: string}) => task.id);
            expect(taskIds).toContain(nonAdminTaskId);
        });

        it('Should not be authorized to access other users tasks as a regular user', async () => {
            expect(adminTaskId).toBeTruthy();

            // Non-admin user queries for all tasks, but _getTasks automatically filters by created_by: ctx.userId
            const res = await makeGraphQlCall(accessAllTasksQuery, {user: e2eNonAdminUser()});

            expect(res.data.data.tasks).toBeDefined();

            // Verify the admin's task is not visible (only tasks created by nonAdminUser are returned)
            const taskIds = res.data.data.tasks.list.map((task: {id: string}) => task.id);
            expect(taskIds).not.toContain(adminTaskId);
        });
    });

    describe('cancel task', () => {
        it('Should not be authorized to cancel a task created by another user', async () => {
            const adminUser = e2eAdminUser();
            const adminTaskId = await createTaskViaExport(adminUser);

            // Non-admin user tries to cancel admin's task - should fail with "Task not found"
            // because _getTasks filters it out automatically
            await expect(makeGraphQlCall(cancelTaskMutation(adminTaskId), {user: e2eNonAdminUser()})).rejects.toThrow(
                /Task not found/,
            );
        });

        it('Should be authorized to cancel a task as admin', async () => {
            const adminUser = e2eAdminUser();
            const adminTaskId = await createTaskViaExport(adminUser);

            const res = await makeGraphQlCall(cancelTaskMutation(adminTaskId), {user: adminUser});

            expect(res.data.data.cancelTask).toBe(true);
        });

        it('Should be authorized to cancel my own task as a regular user', async () => {
            const nonAdminUser = e2eNonAdminUser();
            const myTaskId = await createTaskViaExport(nonAdminUser);

            const res = await makeGraphQlCall(cancelTaskMutation(myTaskId), {user: nonAdminUser});

            expect(res.data.data.cancelTask).toBe(true);
        });
    });

    describe('delete task', () => {
        it('Should not be authorized to delete a task created by another user', async () => {
            const adminUser = e2eAdminUser();
            const adminTaskId = await createTaskViaExport(adminUser);

            // Wait for the task to complete
            await waitForTaskCompletion(adminTaskId);

            // Non-admin user tries to delete admin's task - should fail with "Task not found"
            await expect(
                makeGraphQlCall(deleteTaskMutation(adminTaskId, false), {user: e2eNonAdminUser()}),
            ).rejects.toThrow(/Task not found/);
        });

        it('Should be authorized to delete a task as admin', async () => {
            const adminUser = e2eAdminUser();
            const adminTaskId = await createTaskViaExport(adminUser);

            await waitForTaskCompletion(adminTaskId);

            const res = await makeGraphQlCall(deleteTaskMutation(adminTaskId, false), {user: adminUser});

            expect(res.data.data.deleteTasks).toBe(true);
        });

        it('Should not be authorized to permanently delete my own task as a regular user', async () => {
            const nonAdminUser = e2eNonAdminUser();
            const myTaskId = await createTaskViaExport(nonAdminUser);

            // Wait for the task to complete
            await waitForTaskCompletion(myTaskId);

            // Non-admin users can only archive, not permanently delete
            await expect(makeGraphQlCall(deleteTaskMutation(myTaskId, false), {user: nonAdminUser})).rejects.toThrow(
                /Action forbidden/,
            );
        });
    });

    describe('archive task', () => {
        it('Should not be authorized to archive a task created by another user', async () => {
            const adminUser = e2eAdminUser();
            const adminTaskId = await createTaskViaExport(adminUser);

            // Wait for the task to complete
            await waitForTaskCompletion(adminTaskId);

            // Non-admin user tries to archive admin's task - should fail with "Task not found"
            await expect(
                makeGraphQlCall(deleteTaskMutation(adminTaskId, true), {user: e2eNonAdminUser()}),
            ).rejects.toThrow(/Task not found/);
        });

        it('Should be authorized to archive a task as admin', async () => {
            const adminUser = e2eAdminUser();
            const adminTaskId = await createTaskViaExport(adminUser);

            // Wait for the task to complete
            await waitForTaskCompletion(adminTaskId);

            // Now archive the completed task
            const res = await makeGraphQlCall(deleteTaskMutation(adminTaskId, true), {user: adminUser});

            expect(res.data.data.deleteTasks).toBe(true);
        });

        it('Should be authorized to archive my own task as a regular user', async () => {
            const nonAdminUser = e2eNonAdminUser();
            const myTaskId = await createTaskViaExport(nonAdminUser);

            // Wait for the task to complete (export tasks finish quickly in E2E tests)
            await waitForTaskCompletion(myTaskId);

            // Now archive the completed task
            const res = await makeGraphQlCall(deleteTaskMutation(myTaskId, true), {
                user: nonAdminUser,
            });

            expect(res.data.data.deleteTasks).toBe(true);
        });
    });
});
