// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {TaskStatus} from '../_gqlTypes';
import {GenericClient} from './GenericClient';

export interface ITask {
    id: string;
    status: TaskStatus;
}

export class TaskUtil extends GenericClient {
    public async getTask(taskId: string): Promise<ITask> {
        const res = await this.sdk.GetTasks({
            filters: {id: taskId},
        });
        return res.tasks.list[0];
    }

    public async waitForTaskCompletion(taskId: string, timeout = 30000, interval = 50): Promise<ITask> {
        console.info(`wait for completion task id ${taskId}`);
        const start = Date.now();
        while (Date.now() - start < timeout) {
            const task = await this.getTask(taskId);
            if (task.status === TaskStatus.DONE || task.status === TaskStatus.FAILED) {
                return task;
            }
            await new Promise(resolve => setTimeout(resolve, interval));
        }
        throw new Error(`Task ${taskId} did not complete within ${timeout}ms`);
    }
}
