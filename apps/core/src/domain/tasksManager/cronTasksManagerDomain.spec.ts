// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import cronTasksManagerDomain from './cronTasksManagerDomain';
import {type RegisterCronTask} from '../../_types/cronTask';
import {type ITasksManagerDomain} from './tasksManagerDomain';

vi.mock('node-cron', () => ({
    default: {
        schedule: vi.fn().mockImplementation((schedule: string, task: () => void) => {
            task();
        }),
    },
}));

describe('cronTasksManagerDomain', () => {
    const tasksManagerDomain: Mockify<ITasksManagerDomain> = {createTask: vi.fn()};
    const getSystemQueryContext = vi.fn();

    const domain = cronTasksManagerDomain({
        'core.domain.tasksManager': tasksManagerDomain as ITasksManagerDomain,
        'core.utils.getSystemQueryContext': getSystemQueryContext,
    });
    const fakeCtx = {ctx: true};

    beforeEach(() => {
        vi.clearAllMocks();
        getSystemQueryContext.mockReturnValue(fakeCtx);
    });

    it('should register and schedule a cron task', async () => {
        const fakeTask = {foo: 'bar'};
        const fakeTaskId = 'task-id';
        const createTask = vi.fn().mockResolvedValue(fakeTask);
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
        const createTask = vi.fn();

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
