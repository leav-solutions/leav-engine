import {type AmqpMessageHandler} from '@leav/message-broker';
import {type ILogger} from '@leav/logger';
import {type IEventsManagerDomain} from '../eventsManager/eventsManagerDomain';
import {type ITaskRepo} from '../../infra/task/taskRepo';
import {type ITasksManagerRabbitMQ} from '../../infra/tasksManager/tasksManagerRabbitMQ';
import {type IUtils, type ToAny} from '../../utils/utils';
import {type IServer, type IConfig} from '../../_types/config';
import {TaskCallbackStatus, TaskStatus} from '../../_types/tasksManager';
import {mockCtx, mockSystemQueryContext} from '../../__tests__/mocks/shared';
import {mockTask} from '../../__tests__/mocks/task';
import tasksManager, {type ITasksManagerDomainDeps} from './tasksManagerDomain';
import {type IAdminPermissionDomain} from '../permission/adminPermissionDomain';

let capturedExecHandler: AmqpMessageHandler | undefined;
let capturedCancelHandler: AmqpMessageHandler | undefined;

const mockTasksManagerRabbitMQ: Mockify<ITasksManagerRabbitMQ> = {
    assertExecOrdersTopology: global.__mockPromise(),
    publishExecOrder: global.__mockPromise(),
    publishCancelOrder: global.__mockPromise(),
    consumeExecOrders: vi.fn().mockImplementation(handler => {
        capturedExecHandler = handler;
        return Promise.resolve();
    }),
    pauseExecOrders: global.__mockPromise(),
    resumeExecOrders: global.__mockPromise(),
    ackExecOrder: vi.fn(),
    consumeCancelOrders: vi.fn().mockImplementation(handler => {
        capturedCancelHandler = handler;
        return Promise.resolve();
    }),
    close: global.__mockPromise(),
};

const fakeMsg = (content: string): any => ({content: Buffer.from(content), fields: {}, properties: {}});

const mockAdminPermissionDomain = {
    getAdminPermission: global.__mockPromise(true),
};

const mockLogger: Mockify<ILogger> = {
    debug: vi.fn(),
    error: vi.fn(),
};

const depsBase: ToAny<ITasksManagerDomainDeps> = {
    config: {},
    'core.infra.tasksManager.rabbitMQ': mockTasksManagerRabbitMQ,
    'core.infra.task': vi.fn(),
    'core.depsManager': vi.fn(),
    'core.domain.eventsManager': vi.fn(),
    'core.domain.permission.admin': vi.fn(),
    'core.utils.logger': vi.fn(),
    'core.utils': vi.fn(),
    'core.utils.getSystemQueryContext': vi.fn(() => mockSystemQueryContext),
};

describe('Tasks Manager', () => {
    afterEach(() => {
        vi.clearAllMocks();
        capturedExecHandler = undefined;
        capturedCancelHandler = undefined;
    });

    const conf = {
        tasksManager: {
            checkingInterval: 3000,
            workerPrefetch: 1,
            restartWorker: false,
            queues: {
                execOrders: 'tasks_exec_orders.test',
                cancelOrders: 'tasks_cancel_orders.test',
            },
            routingKeys: {
                execOrders: 'tasks.exec.orders.test',
                cancelOrders: 'tasks.cancel.orders.test',
            },
        },
        defaultUserId: '1',
        amqp: {
            exchange: 'test_exchange',
            connOpt: {
                protocol: 'amqp',
                hostname: 'localhost',
                username: 'user',
                password: 'user',
                port: 1234,
            },
            type: 'direct',
        },
        server: {basePath: '/server-base'} as IServer,
    } satisfies Mockify<IConfig>;

    const mockEventsManager: Mockify<IEventsManagerDomain> = {
        sendDatabaseEvent: global.__mockPromise(),
        sendPubSubEvent: global.__mockPromise(),
    };

    test('Create task', async () => {
        const mockTaskRepo: Mockify<ITaskRepo> = {
            createTask: global.__mockPromise({}),
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.task': mockTaskRepo as ITaskRepo,
            'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
        });

        await tm.createTask(mockTask, mockCtx);

        expect(mockTaskRepo.createTask).toHaveBeenCalledTimes(1);
        expect(mockEventsManager.sendPubSubEvent).toHaveBeenCalledTimes(1);
    });

    test('Delete task', async () => {
        const mockTaskRepo: Mockify<ITaskRepo> = {
            getTasks: global.__mockPromise({totalCount: 1, list: [mockTask]}),
            deleteTask: global.__mockPromise(),
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.task': mockTaskRepo as ITaskRepo,
            'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
            'core.domain.permission.admin':
                mockAdminPermissionDomain as IAdminPermissionDomain as IAdminPermissionDomain,
        });

        await tm.deleteTasks([mockTask], mockCtx);

        expect(mockTaskRepo.deleteTask).toHaveBeenCalledTimes(1);
    });

    test('Archive task', async () => {
        const mockTaskRepo: Mockify<ITaskRepo> = {
            getTasks: global.__mockPromise({totalCount: 1, list: [mockTask]}),
            updateTask: global.__mockPromise(),
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.task': mockTaskRepo as ITaskRepo,
            'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
            'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
        });

        await tm.deleteTasks([{...mockTask, archive: true}], mockCtx);

        expect(mockTaskRepo.updateTask).toHaveBeenCalledTimes(1);
        expect(mockEventsManager.sendPubSubEvent).toHaveBeenCalledTimes(1);
    });

    test('Cancel task', async () => {
        const mockTaskRepo: Mockify<ITaskRepo> = {
            getTasks: global.__mockPromise({totalCount: 1, list: [mockTask]}),
            updateTask: global.__mockPromise(),
        };

        const mockUtils: Mockify<IUtils> = {
            getUnixTime: vi.fn(() => Math.floor(Date.now() / 1000)),
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.task': mockTaskRepo as ITaskRepo,
            'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
            'core.utils': mockUtils as IUtils,
            'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
        });

        await tm.cancelTask(mockTask, mockCtx);

        expect(mockTaskRepo.updateTask).toHaveBeenCalledTimes(1);
        expect(mockEventsManager.sendPubSubEvent).toHaveBeenCalledTimes(1);
    });

    test('Get tasks', async () => {
        const mockTaskRepo: Mockify<ITaskRepo> = {
            getTasks: global.__mockPromise({totalCount: 1, list: [mockTask]}),
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.task': mockTaskRepo as ITaskRepo,
            'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
        });

        await tm.getTasks({params: {}, ctx: mockCtx});

        expect(mockTaskRepo.getTasks).toHaveBeenCalledTimes(1);
    });

    test('Get tasks should add server base url to eventual link url', async () => {
        const mockTaskRepo: Mockify<ITaskRepo> = {
            getTasks: global.__mockPromise({
                totalCount: 1,
                list: [
                    {
                        ...mockTask,
                        link: {name: 'name', url: '/some/path'},
                    },
                ],
            }),
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.task': mockTaskRepo as ITaskRepo,
            'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
        });

        const tasks = await tm.getTasks({params: {}, ctx: mockCtx});

        expect(tasks.list[0].link.url).toBe('/server-base/some/path');
    });

    test('Init Master / Task to execute', async () => {
        vi.setConfig({testTimeout: conf.tasksManager.checkingInterval + 500});

        const mockTaskRepo: Mockify<ITaskRepo> = {
            getTasks: global.__mockPromise({totalCount: 1, list: [mockTask]}),
            getTasksToExecute: global.__mockPromise({totalCount: 1, list: [mockTask]}),
            getTasksToCancel: global.__mockPromise({totalCount: 0, list: []}),
            getTasksWithPendingCallbacks: global.__mockPromise({totalCount: 0, list: []}),
            updateTask: global.__mockPromise(),
        };

        const mockUtils: Mockify<IUtils> = {
            getUnixTime: vi.fn(() => Math.floor(Date.now() / 1000)),
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.task': mockTaskRepo,
            'core.domain.eventsManager': mockEventsManager,
            'core.utils': mockUtils,
            'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
        } as ToAny<ITasksManagerDomainDeps>);

        const timerId = await tm.initMaster();

        await new Promise(r => setTimeout(r, conf.tasksManager.checkingInterval + 1));

        expect(mockTasksManagerRabbitMQ.assertExecOrdersTopology).toHaveBeenCalledTimes(1);

        expect(mockTaskRepo.updateTask).toBeCalledWith(
            {id: mockTask.id, status: TaskStatus.PENDING},
            {
                userId: conf.defaultUserId,
                queryId: 'TasksManagerDomain',
            },
        );

        expect(mockEventsManager.sendPubSubEvent).toBeCalled();
        expect(mockTasksManagerRabbitMQ.publishExecOrder).toBeCalled();

        clearInterval(Number(timerId));
    });

    test('Init Master / Task to cancel', async () => {
        vi.setConfig({testTimeout: conf.tasksManager.checkingInterval + 500});

        const mockTaskRepo: Mockify<ITaskRepo> = {
            getTasksToExecute: global.__mockPromise({totalCount: 0, list: []}),
            getTasksToCancel: global.__mockPromise({totalCount: 1, list: [mockTask]}),
            getTasksWithPendingCallbacks: global.__mockPromise({totalCount: 0, list: []}),
        };

        const mockUtils: Mockify<IUtils> = {
            getUnixTime: vi.fn(() => Math.floor(Date.now() / 1000)),
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf,
            'core.infra.task': mockTaskRepo,
            'core.domain.eventsManager': mockEventsManager,
            'core.utils': mockUtils,
        } as ToAny<ITasksManagerDomainDeps>);

        const timerId = await tm.initMaster();

        await new Promise(r => setTimeout(r, conf.tasksManager.checkingInterval + 1));

        expect(mockTasksManagerRabbitMQ.assertExecOrdersTopology).toHaveBeenCalledTimes(1);
        expect(mockTasksManagerRabbitMQ.publishCancelOrder).toBeCalled();

        clearInterval(Number(timerId));
    });

    test('Init Master / Pending callback', async () => {
        vi.setConfig({testTimeout: conf.tasksManager.checkingInterval + 500});

        const mockTaskRepo: Mockify<ITaskRepo> = {
            getTasks: global.__mockPromise({totalCount: 1, list: [mockTask]}),
            getTasksToExecute: global.__mockPromise({totalCount: 0, list: []}),
            getTasksToCancel: global.__mockPromise({totalCount: 0, list: []}),
            getTasksWithPendingCallbacks: global.__mockPromise({
                totalCount: 1,
                list: [mockTask],
            }),
            updateTask: global.__mockPromise(),
        };

        const mockUtils: Mockify<IUtils> = {
            getUnixTime: vi.fn(() => Math.floor(Date.now() / 1000)),
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf,
            'core.infra.task': mockTaskRepo,
            'core.domain.eventsManager': mockEventsManager,
            'core.utils': mockUtils,
            'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
        } as ToAny<ITasksManagerDomainDeps>);

        const timerId = await tm.initMaster();

        await new Promise(r => setTimeout(r, conf.tasksManager.checkingInterval + 1));

        expect(mockTasksManagerRabbitMQ.assertExecOrdersTopology).toHaveBeenCalledTimes(1);

        expect(mockTaskRepo.updateTask).toBeCalledWith(
            {id: mockTask.id, callbacks: [{...mockTask.callbacks?.[0], status: TaskCallbackStatus.RUNNING}]},
            {
                userId: conf.defaultUserId,
                queryId: 'TasksManagerDomain',
            },
        );

        clearInterval(Number(timerId));
    });

    test('Init Worker', async () => {
        const tm = tasksManager({
            ...depsBase,
            config: conf as IConfig,
        } as ToAny<ITasksManagerDomainDeps>);

        await tm.initWorker();

        expect(mockTasksManagerRabbitMQ.consumeExecOrders).toHaveBeenCalledTimes(1);
        expect(mockTasksManagerRabbitMQ.consumeCancelOrders).toHaveBeenCalledTimes(1);
    });

    describe('exec order handler', () => {
        test('pauses consumption, acks immediately, executes the task, then resumes', async () => {
            const mockTaskRepo: Mockify<ITaskRepo> = {
                getTasks: global.__mockPromise({totalCount: 1, list: [mockTask]}),
                updateTask: global.__mockPromise(mockTask),
            };

            const mockDepsManager = {
                resolve: vi.fn(() => ({name: vi.fn().mockResolvedValue(undefined)})),
            };

            const mockUtils: Mockify<IUtils> = {
                getUnixTime: vi.fn(() => Math.floor(Date.now() / 1000)),
            };

            const tm = tasksManager({
                ...depsBase,
                config: conf as IConfig,
                'core.infra.task': mockTaskRepo,
                'core.domain.eventsManager': mockEventsManager,
                'core.depsManager': mockDepsManager,
                'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
                'core.utils.logger': mockLogger as ILogger,
                'core.utils': mockUtils as IUtils,
            } as ToAny<ITasksManagerDomainDeps>);

            await tm.initWorker();

            const msg = fakeMsg(JSON.stringify({time: Date.now(), userId: '1', payload: mockTask}));
            await capturedExecHandler!(msg);

            expect(mockTasksManagerRabbitMQ.pauseExecOrders).toHaveBeenCalledTimes(1);
            expect(mockTasksManagerRabbitMQ.ackExecOrder).toHaveBeenCalledWith(msg);
            // _listenExecOrders() resumes listening once the task is done (restartWorker: false)
            expect(mockTasksManagerRabbitMQ.resumeExecOrders).toHaveBeenCalledTimes(1);
        });
    });

    describe('cancel order handler', () => {
        test('ignores a cancel order for a task owned by another worker', async () => {
            const mockTaskRepo: Mockify<ITaskRepo> = {
                updateTask: global.__mockPromise(),
            };

            const tm = tasksManager({
                ...depsBase,
                config: conf as IConfig,
                'core.infra.task': mockTaskRepo,
                'core.domain.eventsManager': mockEventsManager,
            } as ToAny<ITasksManagerDomainDeps>);

            await tm.initWorker();

            const msg = fakeMsg(
                JSON.stringify({
                    time: Date.now(),
                    userId: '1',
                    payload: {...mockTask, workerId: process.pid + 1},
                }),
            );
            await capturedCancelHandler!(msg);

            expect(mockTaskRepo.updateTask).not.toHaveBeenCalled();
        });

        test('marks its own running task canceled and resumes listening', async () => {
            const mockTaskRepo: Mockify<ITaskRepo> = {
                getTasks: global.__mockPromise({totalCount: 1, list: [mockTask]}),
                updateTask: global.__mockPromise(mockTask),
            };

            const mockUtils: Mockify<IUtils> = {
                getUnixTime: vi.fn(() => Math.floor(Date.now() / 1000)),
            };

            const tm = tasksManager({
                ...depsBase,
                config: conf as IConfig,
                'core.infra.task': mockTaskRepo,
                'core.domain.eventsManager': mockEventsManager,
                'core.utils': mockUtils,
                'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
                'core.utils.logger': mockLogger as ILogger,
            } as ToAny<ITasksManagerDomainDeps>);

            await tm.initWorker();

            const msg = fakeMsg(
                JSON.stringify({
                    time: Date.now(),
                    userId: '1',
                    payload: {...mockTask, workerId: process.pid},
                }),
            );
            await capturedCancelHandler!(msg);

            expect(mockTaskRepo.updateTask).toHaveBeenCalledWith(
                expect.objectContaining({status: TaskStatus.CANCELED}),
                expect.anything(),
            );
        });
    });

    test('Update progress', async () => {
        const mockTaskRepo: Mockify<ITaskRepo> = {
            getTasks: global.__mockPromise({totalCount: 1, list: [mockTask]}),
            updateTask: global.__mockPromise(),
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.task': mockTaskRepo as ITaskRepo,
            'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
            'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
        });

        await tm.updateProgress(
            mockTask.id,
            {percent: 55, description: {fr: 'description', en: 'description'}},
            mockCtx,
        );

        expect(mockTaskRepo.getTasks).toHaveBeenCalledTimes(1);
        expect(mockTaskRepo.updateTask).toBeCalledWith(
            {id: mockTask.id, progress: {percent: 55, description: {fr: 'description', en: 'description'}}},
            mockCtx,
        );
        expect(mockEventsManager.sendPubSubEvent).toHaveBeenCalledTimes(1);

        await tm.updateProgress(
            mockTask.id,
            {percent: 100, description: {fr: 'description', en: 'description'}},
            mockCtx,
        );

        expect(mockTaskRepo.updateTask).toBeCalledWith(
            {id: mockTask.id, progress: {percent: 99, description: {fr: 'description', en: 'description'}}},
            mockCtx,
        );
    });

    test('Set link', async () => {
        const mockTaskRepo: Mockify<ITaskRepo> = {
            getTasks: global.__mockPromise({totalCount: 1, list: [mockTask]}),
            updateTask: global.__mockPromise(),
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.task': mockTaskRepo as ITaskRepo,
            'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
            'core.domain.permission.admin': mockAdminPermissionDomain as IAdminPermissionDomain,
        });

        await tm.setLink(mockTask.id, {name: 'name', url: 'url'}, mockCtx);

        expect(mockTaskRepo.getTasks).toHaveBeenCalledTimes(1);
        expect(mockTaskRepo.updateTask).toBeCalledWith({id: mockTask.id, link: {name: 'name', url: 'url'}}, mockCtx);
        expect(mockEventsManager.sendPubSubEvent).toHaveBeenCalledTimes(1);
    });
});
