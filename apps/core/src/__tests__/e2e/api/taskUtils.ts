// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ITask, TaskStatus} from '../../../_types/tasksManager';
import {makeGraphQlCall} from './e2eUtils';

export async function getTask(taskId: string): Promise<ITask> {
    const resTaskQuery = await makeGraphQlCall(
        `query { tasks(filters: {id: "${taskId}"}) { list { id status link { name url } } } }`,
    );

    expect(resTaskQuery.data.errors).toBeUndefined();
    expect(resTaskQuery.status).toBe(200);
    expect(resTaskQuery.data.data.tasks.list.length).toBe(1);
    return resTaskQuery.data.data.tasks.list[0];
}

export async function waitForTaskCompletion(id: string, timeout = 5000, interval = 50): Promise<ITask> {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        const task = await getTask(id);
        if (task.status === TaskStatus.DONE || task.status === TaskStatus.FAILED) {
            return task;
        }
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    throw new Error(`Task ${id} did not complete within ${timeout}ms`);
}
