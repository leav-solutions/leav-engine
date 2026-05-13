import {type IQueryInfos} from './queryInfos';
import {type ITaskCreatePayload} from './tasksManager';

/**
 * Should match https://github.com/node-cron/node-cron/blob/main/README.md#cron-syntax
 *
 * Note that 'never' is a special value that can be used to indicate that the task should never be scheduled.
 * This can be useful for tasks that are conditionally scheduled based on configuration or other factors.
 */
export type CronString = string | 'never';

export type RegisterCronTask = {
    schedule: CronString;
    name: string;
    createTask: (ctx: IQueryInfos) => Promise<ITaskCreatePayload>;
};
