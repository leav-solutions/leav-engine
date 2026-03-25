// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {type GetSystemQueryContext} from '../../utils/helpers/getSystemQueryContext';
import cron from 'node-cron';
import {type ITasksManagerDomain} from './tasksManagerDomain';
import {type RegisterCronTask} from '_types/cronTask';

export interface ICronTasksManagerDomain {
    initCronTasksManager(): Promise<void>;
    stopCronTasksManager(): Promise<void>;
    registerCronTask(registerCronTask: RegisterCronTask): void;
}

export interface ITasksManagerDomainDeps {
    'core.domain.tasksManager': ITasksManagerDomain;
    'core.utils.getSystemQueryContext': GetSystemQueryContext;
}

export default function ({
    'core.domain.tasksManager': tasksManagerDomain,
    'core.utils.getSystemQueryContext': getSystemQueryContext,
}: ITasksManagerDomainDeps): ICronTasksManagerDomain {
    const cronTasksToRegisters: RegisterCronTask[] = [];
    function registerCronTasks(registerCronTask: RegisterCronTask): void {
        const {schedule, name, createTask} = registerCronTask;
        logger.verbose(`Register cron task ${name} with schedule ${schedule}`);
        cron.schedule(schedule, async () => {
            try {
                const ctx = getSystemQueryContext(`cron-task::${name}`);

                const taskToCreate = await createTask(ctx);
                const taskId = await tasksManagerDomain.createTask(taskToCreate, ctx);
                logger.debug(`Submit cron task ${taskId} ${name} with schedule ${schedule}`);
            } catch (e) {
                logger.error(`Error while submitting cron task ${name} with schedule ${schedule} : ${e.stack}`);
            }
        });
    }
    return {
        initCronTasksManager: async (): Promise<void> => {
            // Latter, could register cron task for internal services by parsing depsManager.cradle

            // But for now, only from plugins
            for (const registerCronTask of cronTasksToRegisters) {
                registerCronTasks(registerCronTask);
            }
        },
        stopCronTasksManager: async (): Promise<void> => {
            cron.getTasks().forEach(task => task.stop());
        },
        // for plugins, to be call before initCronTasksManager
        registerCronTask(registerCronTask: RegisterCronTask) {
            cronTasksToRegisters.push(registerCronTask);
        },
    };
}
