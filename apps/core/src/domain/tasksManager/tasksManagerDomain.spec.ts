// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import * as amqp from 'amqplib';
import {IEventsManagerDomain} from '../../domain/eventsManager/eventsManagerDomain';
import {ITaskRepo} from '../../infra/task/taskRepo';
import {IUtils, ToAny} from '../../utils/utils';
import {IConfig} from '../../_types/config';
import {TaskCallbackStatus, TaskStatus} from '../../_types/tasksManager';
import {mockCtx} from '../../__tests__/mocks/shared';
import {mockTask} from '../../__tests__/mocks/task';
import tasksManager, {ITasksManagerDomainDeps} from './tasksManagerDomain';
import {Mockify} from '@leav/utils';

const mockAmqpChannel: Mockify<amqp.ConfirmChannel> = {
    assertExchange: jest.fn(),
    checkExchange: jest.fn(),
    assertQueue: jest.fn(),
    bindQueue: jest.fn(),
    consume: jest.fn(),
    publish: jest.fn(),
    waitForConfirms: jest.fn(),
    prefetch: jest.fn()
};

const mockAmqpConnection: Mockify<amqp.Connection> = {
    close: jest.fn(),
    createConfirmChannel: jest.fn().mockReturnValue(mockAmqpChannel)
};

const depsBase: ToAny<ITasksManagerDomainDeps> = {
    config: {},
    'core.infra.amqpService': jest.fn(),
    'core.infra.task': jest.fn(),
    'core.depsManager': jest.fn(),
    'core.domain.eventsManager': jest.fn(),
    'core.utils.logger': jest.fn(),
    'core.utils': jest.fn()
};

describe('Tasks Manager', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const conf = {
        tasksManager: {
            checkingInterval: 3000,
            workerPrefetch: 1,
            restartWorker: false,
            queues: {
                execOrders: 'tasks_exec_orders.test',
                cancelOrders: 'tasks_cancel_orders.test'
            },
            routingKeys: {
                execOrders: 'tasks.exec.orders.test',
                cancelOrders: 'tasks.cancel.orders.test'
            }
        },
        defaultUserId: '1',
        amqp: {
            exchange: 'test_exchange',
            connOpt: {
                protocol: 'amqp',
                hostname: 'localhost',
                username: 'user',
                password: 'user',
                port: 1234
            },
            type: 'direct'
        }
    } satisfies Mockify<IConfig>;

    const mockEventsManager: Mockify<IEventsManagerDomain> = {
        sendDatabaseEvent: global.__mockPromise(),
        sendPubSubEvent: global.__mockPromise()
    };

    test('Create task', async () => {
        const mockTaskRepo: Mockify<ITaskRepo> = {
            createTask: global.__mockPromise({})
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.task': mockTaskRepo as ITaskRepo,
            'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain
        });

        await tm.createTask(mockTask, mockCtx);

        expect(mockTaskRepo.createTask).toHaveBeenCalledTimes(1);
        expect(mockEventsManager.sendPubSubEvent).toHaveBeenCalledTimes(1);
    });

    test('Delete task', async () => {
        const mockTaskRepo: Mockify<ITaskRepo> = {
            getTasks: global.__mockPromise({totalCount: 1, list: [mockTask]}),
            deleteTask: global.__mockPromise()
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.task': mockTaskRepo as ITaskRepo,
            'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain
        });

        await tm.deleteTasks([mockTask], mockCtx);

        expect(mockTaskRepo.deleteTask).toHaveBeenCalledTimes(1);
    });

    test('Archive task', async () => {
        const mockTaskRepo: Mockify<ITaskRepo> = {
            getTasks: global.__mockPromise({totalCount: 1, list: [mockTask]}),
            updateTask: global.__mockPromise()
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.task': mockTaskRepo as ITaskRepo,
            'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain
        });

        await tm.deleteTasks([{...mockTask, archive: true}], mockCtx);

        expect(mockTaskRepo.updateTask).toHaveBeenCalledTimes(1);
        expect(mockEventsManager.sendPubSubEvent).toHaveBeenCalledTimes(1);
    });

    test('Cancel task', async () => {
        const mockTaskRepo: Mockify<ITaskRepo> = {
            getTasks: global.__mockPromise({totalCount: 1, list: [mockTask]}),
            updateTask: global.__mockPromise()
        };

        const mockUtils: Mockify<IUtils> = {
            getUnixTime: jest.fn(() => Math.floor(Date.now() / 1000))
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.task': mockTaskRepo as ITaskRepo,
            'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain,
            'core.utils': mockUtils as IUtils
        });

        await tm.cancelTask(mockTask, mockCtx);

        expect(mockTaskRepo.updateTask).toHaveBeenCalledTimes(1);
        expect(mockEventsManager.sendPubSubEvent).toHaveBeenCalledTimes(1);
    });

    test('Get tasks', async () => {
        const mockTaskRepo: Mockify<ITaskRepo> = {
            getTasks: global.__mockPromise({totalCount: 1, list: [mockTask]})
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.task': mockTaskRepo as ITaskRepo
        });

        await tm.getTasks({params: {}, ctx: mockCtx});

        expect(mockTaskRepo.getTasks).toHaveBeenCalledTimes(1);
    });

    test('Init Master / Task to execute', async () => {
        jest.setTimeout(conf.tasksManager.checkingInterval + 500);

        const mockAmqpService = {
            consume: jest.fn(),
            consumer: {
                connection: mockAmqpConnection as amqp.Connection,
                channel: mockAmqpChannel as amqp.ConfirmChannel
            },
            publish: jest.fn()
        } satisfies Mockify<IAmqpService>;

        const mockTaskRepo: Mockify<ITaskRepo> = {
            getTasks: global.__mockPromise({totalCount: 1, list: [mockTask]}),
            getTasksToExecute: global.__mockPromise({totalCount: 1, list: [mockTask]}),
            getTasksToCancel: global.__mockPromise({totalCount: 0, list: []}),
            getTasksWithPendingCallbacks: global.__mockPromise({totalCount: 0, list: []}),
            updateTask: global.__mockPromise()
        };

        const mockUtils: Mockify<IUtils> = {
            getUnixTime: jest.fn(() => Math.floor(Date.now() / 1000))
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.amqpService': mockAmqpService,
            'core.infra.task': mockTaskRepo,
            'core.domain.eventsManager': mockEventsManager,
            'core.utils': mockUtils
        } as ToAny<ITasksManagerDomainDeps>);

        const timerId = await tm.initMaster();

        await new Promise(r => setTimeout(r, conf.tasksManager.checkingInterval + 1));

        expect(mockAmqpService.consumer.channel.assertQueue).toHaveBeenCalledTimes(1);
        expect(mockAmqpService.consumer.channel.bindQueue).toHaveBeenCalledTimes(1);

        expect(mockTaskRepo.updateTask).toBeCalledWith(
            {id: mockTask.id, status: TaskStatus.PENDING},
            {
                userId: conf.defaultUserId,
                queryId: 'TasksManagerDomain'
            }
        );

        expect(mockEventsManager.sendPubSubEvent).toBeCalled();
        expect(mockAmqpService.publish).toBeCalled();

        clearInterval(Number(timerId));
    });

    test('Init Master / Task to cancel', async () => {
        jest.setTimeout(conf.tasksManager.checkingInterval + 500);

        const mockAmqpService = {
            consume: jest.fn(),
            consumer: {
                connection: mockAmqpConnection as amqp.Connection,
                channel: mockAmqpChannel as amqp.ConfirmChannel
            },
            publish: jest.fn()
        } satisfies Mockify<IAmqpService>;

        const mockTaskRepo: Mockify<ITaskRepo> = {
            getTasksToExecute: global.__mockPromise({totalCount: 0, list: []}),
            getTasksToCancel: global.__mockPromise({totalCount: 1, list: [mockTask]}),
            getTasksWithPendingCallbacks: global.__mockPromise({totalCount: 0, list: []})
        };

        const mockUtils: Mockify<IUtils> = {
            getUnixTime: jest.fn(() => Math.floor(Date.now() / 1000))
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf,
            'core.infra.amqpService': mockAmqpService,
            'core.infra.task': mockTaskRepo,
            'core.domain.eventsManager': mockEventsManager,
            'core.utils': mockUtils
        } as ToAny<ITasksManagerDomainDeps>);

        const timerId = await tm.initMaster();

        await new Promise(r => setTimeout(r, conf.tasksManager.checkingInterval + 1));

        expect(mockAmqpService.consumer.channel.assertQueue).toHaveBeenCalledTimes(1);
        expect(mockAmqpService.consumer.channel.bindQueue).toHaveBeenCalledTimes(1);

        expect(mockAmqpService.publish).toBeCalled();

        clearInterval(Number(timerId));
    });

    test('Init Master / Pending callback', async () => {
        jest.setTimeout(conf.tasksManager.checkingInterval + 500);

        const mockAmqpService = {
            consume: jest.fn(),
            consumer: {
                connection: mockAmqpConnection as amqp.Connection,
                channel: mockAmqpChannel as amqp.ConfirmChannel
            },
            publish: jest.fn()
        } satisfies Mockify<IAmqpService>;

        const mockTaskRepo: Mockify<ITaskRepo> = {
            getTasks: global.__mockPromise({totalCount: 1, list: [mockTask]}),
            getTasksToExecute: global.__mockPromise({totalCount: 0, list: []}),
            getTasksToCancel: global.__mockPromise({totalCount: 0, list: []}),
            getTasksWithPendingCallbacks: global.__mockPromise({
                totalCount: 1,
                list: [mockTask]
            }),
            updateTask: global.__mockPromise()
        };

        const mockUtils: Mockify<IUtils> = {
            getUnixTime: jest.fn(() => Math.floor(Date.now() / 1000))
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf,
            'core.infra.amqpService': mockAmqpService,
            'core.infra.task': mockTaskRepo,
            'core.domain.eventsManager': mockEventsManager,
            'core.utils': mockUtils
        } as ToAny<ITasksManagerDomainDeps>);

        const timerId = await tm.initMaster();

        await new Promise(r => setTimeout(r, conf.tasksManager.checkingInterval + 1));

        expect(mockAmqpService.consumer.channel.assertQueue).toHaveBeenCalledTimes(1);
        expect(mockAmqpService.consumer.channel.bindQueue).toHaveBeenCalledTimes(1);

        expect(mockTaskRepo.updateTask).toBeCalledWith(
            {id: mockTask.id, callbacks: [{...mockTask.callbacks?.[0], status: TaskCallbackStatus.RUNNING}]},
            {
                userId: conf.defaultUserId,
                queryId: 'TasksManagerDomain'
            }
        );

        clearInterval(Number(timerId));
    });

    test('Init Worker', async () => {
        const mockAmqpService = {
            consume: jest.fn(),
            consumer: {
                connection: mockAmqpConnection as amqp.Connection,
                channel: mockAmqpChannel as amqp.ConfirmChannel
            },
            publish: jest.fn()
        } satisfies Mockify<IAmqpService>;

        const tm = tasksManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.amqpService': mockAmqpService
        } as ToAny<ITasksManagerDomainDeps>);

        await tm.initWorker();

        expect(mockAmqpService.consume).toHaveBeenCalledTimes(2);
        expect(mockAmqpService.consumer.channel.assertQueue).toHaveBeenCalledTimes(2);
        expect(mockAmqpService.consumer.channel.assertQueue).toHaveBeenNthCalledWith(
            1,
            conf.tasksManager.queues.execOrders
        );
        expect(mockAmqpService.consumer.channel.assertQueue).toHaveBeenNthCalledWith(
            2,
            expect.stringMatching(conf.tasksManager.queues.cancelOrders),
            {autoDelete: true, durable: false, exclusive: true}
        );
        expect(mockAmqpService.consumer.channel.bindQueue).toHaveBeenCalledTimes(1);
    });

    test('Update progress', async () => {
        const mockTaskRepo: Mockify<ITaskRepo> = {
            getTasks: global.__mockPromise({totalCount: 1, list: [mockTask]}),
            updateTask: global.__mockPromise()
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.task': mockTaskRepo as ITaskRepo,
            'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain
        });

        await tm.updateProgress(
            mockTask.id,
            {percent: 55, description: {fr: 'description', en: 'description'}},
            mockCtx
        );

        expect(mockTaskRepo.getTasks).toHaveBeenCalledTimes(1);
        expect(mockTaskRepo.updateTask).toBeCalledWith(
            {id: mockTask.id, progress: {percent: 55, description: {fr: 'description', en: 'description'}}},
            mockCtx
        );
        expect(mockEventsManager.sendPubSubEvent).toHaveBeenCalledTimes(1);

        await tm.updateProgress(
            mockTask.id,
            {percent: 100, description: {fr: 'description', en: 'description'}},
            mockCtx
        );

        expect(mockTaskRepo.updateTask).toBeCalledWith(
            {id: mockTask.id, progress: {percent: 99, description: {fr: 'description', en: 'description'}}},
            mockCtx
        );
    });

    test('Set link', async () => {
        const mockTaskRepo: Mockify<ITaskRepo> = {
            getTasks: global.__mockPromise({totalCount: 1, list: [mockTask]}),
            updateTask: global.__mockPromise()
        };

        const tm = tasksManager({
            ...depsBase,
            config: conf as IConfig,
            'core.infra.task': mockTaskRepo as ITaskRepo,
            'core.domain.eventsManager': mockEventsManager as IEventsManagerDomain
        });

        await tm.setLink(mockTask.id, {name: 'name', url: 'url'}, mockCtx);

        expect(mockTaskRepo.getTasks).toHaveBeenCalledTimes(1);
        expect(mockTaskRepo.updateTask).toBeCalledWith({id: mockTask.id, link: {name: 'name', url: 'url'}}, mockCtx);
        expect(mockEventsManager.sendPubSubEvent).toHaveBeenCalledTimes(1);
    });
});
