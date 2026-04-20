// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {describe} from 'vitest';
import {type ITasksManagerDomain} from '../../../domain/tasksManager/tasksManagerDomain';
import {getCoreContainer, getCoreDep} from '../integrationTestUtils';
import {asValue} from 'awilix';
import {type ITask, TaskPriority, TaskStatus} from '../../../_types/tasksManager';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {systemUserId} from '../../../_constants/users';

describe('tasksManagerDomain', {retry: 2}, () => {
    let taskManagerDomain: ITasksManagerDomain;
    const ctx: IQueryInfos = {userId: systemUserId};
    const fakeWorkerFn = vi.fn();
    beforeAll(async () => {
        taskManagerDomain = getCoreDep<ITasksManagerDomain>('core.domain.tasksManager');
        getCoreContainer().register(
            'core.test.fakeWorker',
            asValue({
                execWorker: fakeWorkerFn,
            }),
        );

        await taskManagerDomain.initWorker();
    });

    beforeEach(async () => {
        fakeWorkerFn.mockReset();
        // Help to stabilise test exec to avoid each other interference
        await new Promise(resolve => setTimeout(resolve, 5));
    });

    it('should correctly execute simple task', async () => {
        const createdTask = await createAndGetTask('Simple Task', {hello: 'world'});

        expect(createdTask.id).toBeDefined();
        expect(createdTask.label.en).toBe('Simple Task');
        // Depending on timing, task can be still in created or pending state
        expect([TaskStatus.CREATED, TaskStatus.PENDING]).toContain(createdTask.status);

        const completedTask = await waitForTaskCompletion(createdTask.id);

        expect(completedTask.status).toBe(TaskStatus.DONE);
        expect(completedTask.progress).toEqual({percent: 100});
        expect(completedTask.workerId).toBeNull();

        expect(fakeWorkerFn).toHaveBeenCalledWith({hello: 'world'}, expect.anything());
    });

    it('should failed when simple task throw', async () => {
        fakeWorkerFn.mockRejectedValue(new Error('Fake worker error'));
        const createdTask = await createAndGetTask('Failed Task', {hello: 'world'});

        expect(createdTask.id).toBeDefined();
        expect(createdTask.label.en).toBe('Failed Task');

        const failedTask = await waitForTaskCompletion(createdTask.id);

        expect(failedTask.status).toBe(TaskStatus.FAILED);
        expect(failedTask.progress).toEqual({
            percent: 0,
            description: {fr: 'Fake worker error', en: 'Fake worker error'},
        });
        expect(failedTask.workerId).toBeNull();

        expect(fakeWorkerFn).toHaveBeenCalledWith({hello: 'world'}, expect.anything());
    });

    it('cancel task should reconnect worker for another task exec', async () => {
        fakeWorkerFn.mockImplementationOnce(
            async () =>
                // Simulate long task
                new Promise(resolve => {
                    setTimeout(resolve, 60_000);
                }),
        );
        const taskToCancel = await createAndGetTask('Long task cancel', {});

        expect(taskToCancel.id).toBeDefined();
        expect(taskToCancel.label.en).toBe('Long task cancel');

        // wait task is running
        await waitForTaskRunning(taskToCancel.id);

        const taskToCancelRunning = await getTask(taskToCancel.id);
        expect(taskToCancelRunning.status).toBe(TaskStatus.RUNNING);

        await taskManagerDomain.cancelTask({id: taskToCancel.id}, ctx);
        const taskToCancelCanceling = await getTask(taskToCancel.id);
        expect(taskToCancelCanceling.status).toBe(TaskStatus.PENDING_CANCEL);

        // create new task to ensure worker is reconnected
        const newTask = await createAndGetTask('Task after cancel', {});
        const newTaskCompleted = await waitForTaskCompletion(newTask.id);
        expect(newTaskCompleted.status).toBe(TaskStatus.DONE);

        // Behavior is not correct because cancel task is officially canceled, but still running in worker
        // To have effective cancel, we should either config.tasksManager.restartWorker (only if config.tasksManager.workerPrefetch is 1)
        // const canceledTask = await getTask(taskToCancel.id);
        // expect(canceledTask.status).toBe(TaskStatus.CANCELED);
    });

    async function createAndGetTask(taskName: string, args: any): Promise<ITask> {
        const taskId = await taskManagerDomain.createTask(
            {
                label: {
                    en: taskName,
                },
                func: {
                    path: 'core.test.fakeWorker',
                    name: 'execWorker',
                    args: {hello: 'world'},
                },
                priority: TaskPriority.MEDIUM,
            },
            ctx,
        );
        return getTask(taskId);
    }

    async function getTask(id: string): Promise<ITask> {
        const tasks = await taskManagerDomain.getTasks({params: {filters: {id}}, ctx});

        if (tasks.list.length === 0) {
            throw new Error(`Task with id ${id} not found`);
        }
        return tasks.list[0];
    }

    async function waitForTaskCompletion(id: string, timeout = 10000, interval = 50): Promise<ITask> {
        const start = Date.now();
        let task: ITask;
        while (Date.now() - start < timeout) {
            task = await getTask(id);
            if (task.status === TaskStatus.DONE || task.status === TaskStatus.FAILED) {
                return task;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }
        throw new Error(`Task ${id} did not complete within ${timeout}ms (status=${task?.status})`);
    }

    async function waitForTaskRunning(id: string, timeout = 10000, interval = 50): Promise<ITask> {
        const start = Date.now();
        let task: ITask;
        while (Date.now() - start < timeout) {
            task = await getTask(id);
            if (task.status === TaskStatus.RUNNING) {
                return task;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }
        throw new Error(`Task ${id} did not started within ${timeout}ms (status=${task?.status})`);
    }
});
