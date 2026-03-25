// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import cronTasksManagerDomain from './cronTasksManagerDomain';
import {type RegisterCronTask} from '../../_types/cronTask';
import {type ITasksManagerDomain} from './tasksManagerDomain';

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

    afterEach(async () => {
        await domain.stopCronTasksManager();
    });

    it('should register and schedule a cron task', async () => {
        const fakeTask = {foo: 'bar'};
        const fakeTaskId = 'task-id';
        const createTask = jest.fn().mockResolvedValue(fakeTask);
        tasksManagerDomain.createTask.mockResolvedValue(fakeTaskId);

        const registerCronTask: RegisterCronTask = {
            schedule: '* * * * * *', // every seconds
            name: 'test-task',
            createTask,
        };
        domain.registerCronTask(registerCronTask);

        await domain.initCronTasksManager();

        await new Promise(resolve => setTimeout(resolve, 1500)); // wait for the cron task to be executed

        expect(createTask).toHaveBeenCalledWith(fakeCtx);
        expect(tasksManagerDomain.createTask).toHaveBeenCalledWith(fakeTask, fakeCtx);
    });

    it('should accumulate multiple cron tasks', async () => {
        const createTask1 = jest.fn().mockResolvedValue({});
        const createTask2 = jest.fn().mockResolvedValue({});
        tasksManagerDomain.createTask.mockResolvedValue('id');
        getSystemQueryContext.mockReturnValue({});
        domain.registerCronTask({schedule: '*/1 * * * * *', name: 'task1', createTask: createTask1}); // every second
        domain.registerCronTask({schedule: '*/3 * * * * *', name: 'task2', createTask: createTask2}); // every 3 seconds

        await domain.initCronTasksManager();

        await new Promise(resolve => setTimeout(resolve, 4000)); // wait for the cron task to be executed

        expect(createTask1).toHaveBeenCalled();
        expect(createTask2).toHaveBeenCalled();
        expect(createTask1.mock.calls.length).toBeGreaterThanOrEqual(createTask2.mock.calls.length); // because task1 is scheduled every second and task2 every 3 seconds
    }, 8000);
});
