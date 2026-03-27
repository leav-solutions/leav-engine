// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import cronTasksManagerDomain from './cronTasksManagerDomain';
import {type RegisterCronTask} from '../../_types/cronTask';
import {type ITasksManagerDomain} from './tasksManagerDomain';

jest.mock('node-cron', () => ({
    schedule: jest.fn().mockImplementation((schedule: string, task: () => void) => {
        task();
    }),
}));

describe('cronTasksManagerDomain', () => {
    const tasksManagerDomain: Mockify<ITasksManagerDomain> = {createTask: jest.fn()};
    const getSystemQueryContext = jest.fn();

    const domain = cronTasksManagerDomain({
        'core.domain.tasksManager': tasksManagerDomain as ITasksManagerDomain,
        'core.utils.getSystemQueryContext': getSystemQueryContext,
    });
    const fakeCtx = {ctx: true};

    beforeEach(() => {
        jest.clearAllMocks();
        getSystemQueryContext.mockReturnValue(fakeCtx);
    });

    it('should register and schedule a cron task', async () => {
        const fakeTask = {foo: 'bar'};
        const fakeTaskId = 'task-id';
        const createTask = jest.fn().mockResolvedValue(fakeTask);
        tasksManagerDomain.createTask.mockResolvedValue(fakeTaskId);

        const registerCronTask: RegisterCronTask = {
            schedule: 'dont-care',
            name: 'test-task',
            createTask,
        };
        domain.registerCronTask(registerCronTask);

        await domain.initCronTasksManager();

        expect(createTask).toHaveBeenCalledWith(fakeCtx);
        expect(tasksManagerDomain.createTask).toHaveBeenCalledWith(fakeTask, fakeCtx);
    });

    it('should not register and schedule a cron task with schedule "never"', async () => {
        const createTask = jest.fn();

        const registerCronTask: RegisterCronTask = {
            schedule: 'never',
            name: 'test-task',
            createTask,
        };
        domain.registerCronTask(registerCronTask);

        await domain.initCronTasksManager();
        expect(createTask).toHaveBeenCalledTimes(0);
    });
});
