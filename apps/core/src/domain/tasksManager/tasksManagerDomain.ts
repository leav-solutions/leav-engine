// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAmqpService} from '@leav/message-broker';
import {IQueryInfos} from '_types/queryInfos';
import {nanoid} from 'nanoid';
import Joi from 'joi';
import {
    Payload,
    ITaskOrder,
    TaskStatus,
    ITask,
    TaskPriority,
    TaskCallbackType,
    OrderType,
    ITaskCreatePayload,
    ITaskCancelPayload,
    ITaskFuncParams,
    ITaskDeletePayload,
    TaskCallbackStatus,
    ITaskCallback
} from '../../_types/tasksManager';
import winston from 'winston';
import {IList, SortOrder} from '../../_types/list';
import {IGetCoreEntitiesParams} from '_types/shared';
import {ITaskRepo} from '../../infra/task/taskRepo';
import {AwilixContainer} from 'awilix';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IUtils} from 'utils/utils';
import process from 'process';
import {v4 as uuidv4} from 'uuid';
import * as Config from '_types/config';
import {ISystemTranslation} from '_types/systemTranslation';
import * as amqp from 'amqplib';

export interface IUpdateData {
    status?: TaskStatus;
    progress?: {percent?: number; description?: ISystemTranslation};
    startedAt?: number;
    completedAt?: number;
    link?: {name: string | null; url: string | null};
    workerId?: number;
    canceledBy?: string | null;
    archive?: boolean;
    callback?: ITaskCallback;
}

interface IGetTasksParams extends IGetCoreEntitiesParams {
    filters?: ICoreEntityFilterOptions & {
        status?: TaskStatus;
        startAt?: number;
        created_by?: string;
        archive?: boolean;
        completedAt?: number;
    };
}

export interface ITasksManagerDomain {
    initMaster(): Promise<NodeJS.Timer>;
    initWorker(): Promise<void>;
    getTasks({params, ctx}: {params: IGetTasksParams; ctx: IQueryInfos}): Promise<IList<ITask>>;
    setLink(taskId: string | null, link: {name: string | null; url: string | null}, ctx: IQueryInfos): Promise<void>;
    updateProgress(
        taskId: string | null,
        progress: {percent?: number; description?: ISystemTranslation},
        ctx: IQueryInfos
    ): Promise<void>;
    createTask(task: ITaskCreatePayload, ctx: IQueryInfos): Promise<string>;
    cancelTask(task: ITaskCancelPayload, ctx: IQueryInfos): Promise<void>;
    deleteTask(task: ITaskDeletePayload, ctx: IQueryInfos): Promise<void>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqpService'?: IAmqpService;
    'core.infra.task'?: ITaskRepo;
    'core.depsManager'?: AwilixContainer;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    'core.utils.logger'?: winston.Winston;
    'core.utils'?: IUtils;
}

export const TRIGGER_NAME_TASK = 'TASK';

type DepsManagerFunc = <T extends any[]>(...args: [...args: T, task: ITaskFuncParams] | [...args: T]) => Promise<any>;

export default function ({
    config = null,
    'core.infra.amqpService': amqpService = null,
    'core.infra.task': taskRepo = null,
    'core.depsManager': depsManager = null,
    'core.domain.eventsManager': eventsManager = null,
    'core.utils.logger': logger = null,
    'core.utils': utils = null
}: IDeps): ITasksManagerDomain {
    const tag = `${process.pid}_${nanoid(3)}`;

    const workerCtx = {
        userId: config.defaultUserId,
        queryId: 'TasksManagerWorker'
    };

    const _monitorTasks = (ctx: IQueryInfos): NodeJS.Timer => {
        // check if tasks waiting for execution and execute them
        return setInterval(async () => {
            const taskToExecute = (await taskRepo.getTasksToExecute(ctx)).list[0];
            const taskToCancel = (await taskRepo.getTasksToCancel(ctx)).list[0];
            const taskWithPendingCallback = (await taskRepo.getTasksWithPendingCallback(ctx)).list[0];

            if (taskToCancel) {
                await _sendOrder(config.tasksManager.routingKeys.cancelOrders, taskToCancel, ctx);
            }

            if (taskWithPendingCallback) {
                await _executeCallback(taskWithPendingCallback, ctx);
            }

            if (taskToExecute) {
                await _updateTask(taskToExecute.id, {status: TaskStatus.PENDING}, ctx);
                await _sendOrder(config.tasksManager.routingKeys.execOrders, taskToExecute, ctx);
            }
        }, config.tasksManager.checkingInterval);
    };

    const _executeTask = async (task: ITask, ctx: IQueryInfos): Promise<ITask> => {
        await _attachWorker(task.id, process.pid, workerCtx);
        await _updateTask(
            task.id,
            {startedAt: utils.getUnixTime(), status: TaskStatus.RUNNING, progress: {percent: 0}},
            ctx
        );

        let status = task.status;
        let errorMessage = null;

        try {
            const func = _getDepsManagerFunc({
                moduleName: task.func.moduleName,
                subModuleName: task.func.subModuleName,
                funcName: task.func.name
            });

            await func(task.func.args, {id: task.id});

            status = TaskStatus.DONE;
        } catch (e) {
            logger.error('Error executing task', e);
            status = TaskStatus.FAILED;
            errorMessage = e.message;
        }

        const progress =
            status === TaskStatus.DONE
                ? {progress: {percent: 100}}
                : {
                      ...(errorMessage
                          ? {
                                progress: {
                                    description: config.lang.available.reduce((labels, lang) => {
                                        labels[lang] = errorMessage;
                                        return labels;
                                    }, {})
                                }
                            }
                          : {})
                  };

        return _updateTask(
            task.id,
            {
                ...progress,
                completedAt: utils.getUnixTime(),
                status
            },
            ctx
        );
    };

    const _executeCallback = async (task: ITask, ctx: IQueryInfos): Promise<void> => {
        await _updateTask(task.id, {callback: {...task.callback, status: TaskCallbackStatus.RUNNING}}, ctx);

        let status;

        if (
            (task.callback.type.includes(TaskCallbackType.ON_FAILURE) && task.status === TaskStatus.FAILED) ||
            (task.callback.type.includes(TaskCallbackType.ON_SUCCESS) && task.status === TaskStatus.DONE) ||
            (task.callback.type.includes(TaskCallbackType.ON_CANCEL) && task.status === TaskStatus.CANCELED)
        ) {
            try {
                const callbackFunc = _getDepsManagerFunc({
                    moduleName: task.callback.moduleName,
                    subModuleName: task.callback.subModuleName,
                    funcName: task.callback.name
                });

                await callbackFunc(...task.callback.args);

                status = TaskCallbackStatus.DONE;
            } catch (e) {
                logger.error('Error executing callback', e);
                status = TaskCallbackStatus.FAILED;
            }
        }

        await _updateTask(task.id, {callback: {...task.callback, status: status ?? TaskCallbackStatus.DONE}}, ctx);
    };

    const _validateMsg = (msg: ITaskOrder) => {
        const msgBodySchema = Joi.object().keys({
            time: Joi.number().required(),
            userId: Joi.string().required(),
            payload: Joi.object().when('order', {
                switch: [
                    {
                        is: OrderType.CREATE,
                        then: Joi.object().keys({
                            id: Joi.string().required(),
                            label: Joi.object().required(),
                            func: Joi.object()
                                .keys({
                                    moduleName: Joi.string().required(),
                                    subModuleName: Joi.string().required(),
                                    name: Joi.string().required(),
                                    args: Joi.array().required()
                                })
                                .required(),
                            startAt: Joi.date().timestamp('unix').raw().required(),
                            priority: Joi.string()
                                .valid(...Object.values(TaskPriority))
                                .required(),
                            callback: Joi.object().keys({
                                moduleName: Joi.string().required(),
                                subModuleName: Joi.string(),
                                name: Joi.string().required(),
                                args: Joi.array().required(),
                                type: Joi.array()
                                    .items(...Object.values(TaskCallbackType))
                                    .required()
                            })
                        })
                    },
                    {
                        is: OrderType.CANCEL,
                        then: Joi.object().keys({id: Joi.string().required()})
                    }
                ]
            })
        });

        const isValid = msgBodySchema.validate(msg);

        if (!!isValid.error) {
            const errorMsg = isValid.error.details.map(e => e.message).join(', ');
            throw new Error(errorMsg);
        }
    };

    const _updateTask = async (taskId: string | null, data: IUpdateData, ctx: IQueryInfos): Promise<ITask> => {
        let task = (await _getTasks({params: {filters: {id: taskId}}, ctx})).list[0];

        if (!task) {
            throw new Error('Task not found');
        }

        task = await taskRepo.updateTask(
            {
                id: taskId,
                ...data
            },
            ctx
        );

        await eventsManager.sendPubSubEvent({triggerName: TRIGGER_NAME_TASK, data: {task}}, ctx);

        return task;
    };

    const _attachWorker = async (taskId: string | null, workerId: number, ctx: IQueryInfos): Promise<void> => {
        await _updateTask(taskId, {workerId}, ctx);
    };

    const _detachWorker = async (taskId: string | null, ctx: IQueryInfos): Promise<void> => {
        await _updateTask(taskId, {workerId: null}, ctx);
    };

    const _getTasks = async ({params, ctx}: {params: IGetTasksParams; ctx: IQueryInfos}): Promise<IList<ITask>> => {
        if (typeof params.sort === 'undefined') {
            params.sort = {field: 'id', order: SortOrder.ASC};
        }

        return taskRepo.getTasks({params, ctx});
    };

    const _getDepsManagerFunc = ({
        moduleName,
        subModuleName,
        funcName
    }: {
        moduleName: string | null;
        subModuleName?: string | null;
        funcName: string | null;
    }): DepsManagerFunc => {
        const func: DepsManagerFunc = depsManager.resolve(
            `core.${moduleName}${!!subModuleName ? `.${subModuleName}` : ''}`
        )?.[funcName];

        if (!func) {
            throw new Error(
                `Function core.${moduleName}${!!subModuleName ? `.${subModuleName}` : ''}.${funcName} not found`
            );
        }

        return func;
    };

    const _cancelTask = async ({id}: ITaskCancelPayload, ctx: IQueryInfos): Promise<void> => {
        const task = (await _getTasks({params: {filters: {id}}, ctx})).list[0];

        if (!task) {
            throw new Error('Task not found');
        }

        // if task is still pending or running, cancel it
        if (
            task.status === TaskStatus.CREATED ||
            task.status === TaskStatus.PENDING ||
            task.status === TaskStatus.RUNNING
        ) {
            const newData: IUpdateData =
                typeof task.workerId === 'undefined'
                    ? {status: TaskStatus.CANCELED, canceledBy: ctx.userId, completedAt: utils.getUnixTime()}
                    : {status: TaskStatus.PENDING_CANCEL, canceledBy: ctx.userId};

            await _updateTask(task.id, newData, ctx);
        }
    };

    const _createTask = async (
        {id, label, func, startAt, priority, callback}: ITaskCreatePayload,
        ctx: IQueryInfos
    ): Promise<string> => {
        const task = await taskRepo.createTask(
            {
                id: id ?? uuidv4(),
                label,
                func,
                startAt: startAt ?? utils.getUnixTime(),
                status: TaskStatus.CREATED,
                priority,
                archive: false, // FIXME: move to repo
                ...(!!callback && {callback: {...callback, status: TaskCallbackStatus.PENDING}})
            },
            (({dbProfiler, ...c}) => c)(ctx)
        );

        await eventsManager.sendPubSubEvent({triggerName: TRIGGER_NAME_TASK, data: {task}}, ctx);

        return task.id;
    };

    const _deleteTask = async ({id, archive}: ITaskDeletePayload, ctx: IQueryInfos): Promise<ITask> => {
        const task = (await _getTasks({params: {filters: {id}}, ctx})).list[0];

        if (!task) {
            throw new Error('Task not found');
        } else if (!!task.workerId) {
            throw new Error(`Cannot delete: task ${id} is still running.`);
        }

        return archive ? _updateTask(id, {archive}, ctx) : taskRepo.deleteTask(id, ctx);
    };

    const _exit = async () => {
        await amqpService.close();
        process.exit();
    };

    const _onExecMessage = async (msg: amqp.ConsumeMessage): Promise<void> => {
        const order: ITaskOrder = JSON.parse(msg.content.toString());

        try {
            _validateMsg(order);
        } catch (e) {
            logger.error(e);
            amqpService.consumer.channel.ack(msg);
        }

        // We stop listening to the execution order queue because if we ack the message we receive a new task.
        // We can't wait for the task to finish before the ack because it can be long and exceed the rabbitmq timeout.
        amqpService.consumer.channel.cancel(tag);
        amqpService.consumer.channel.ack(msg);

        const task = order.payload as ITask;

        await _executeTask(task, {userId: task.created_by});
        await _detachWorker(task.id, workerCtx);

        if (config.tasksManager.restartWorker) {
            return _exit();
        }

        await _listenExecOrders();
    };

    const _onCancelMessage = async (msg: amqp.ConsumeMessage): Promise<void> => {
        const order: ITaskOrder = JSON.parse(msg.content.toString());

        try {
            _validateMsg(order);
        } catch (e) {
            logger.error(e);
        } finally {
            amqpService.consumer.channel.ack(msg);
        }

        const task = order.payload as ITask;

        // This worker is not involved
        if (task.workerId !== process.pid) {
            return;
        }

        await _updateTask(task.id, {completedAt: utils.getUnixTime(), status: TaskStatus.CANCELED}, workerCtx);
        await _detachWorker(task.id, workerCtx);

        if (config.tasksManager.restartWorker) {
            await _exit();
        }
    };

    const _sendOrder = async (routingKey: string | null, payload: Payload, ctx: IQueryInfos): Promise<void> => {
        await amqpService.publish(
            config.amqp.exchange,
            routingKey,
            JSON.stringify({time: utils.getUnixTime(), userId: ctx.userId, payload})
        );
    };

    const _listenExecOrders = async () => {
        await amqpService.consume(
            config.tasksManager.queues.execOrders,
            config.tasksManager.routingKeys.execOrders,
            _onExecMessage,
            tag
        );
    };

    return {
        // Core
        getTasks: _getTasks,
        async createTask(task: ITaskCreatePayload, ctx: IQueryInfos): Promise<string> {
            return _createTask(task, ctx);
        },
        async cancelTask(task: ITaskCancelPayload, ctx: IQueryInfos): Promise<void> {
            await _cancelTask(task, ctx);
        },
        async deleteTask(task: ITaskDeletePayload, ctx: IQueryInfos): Promise<void> {
            await _deleteTask(task, ctx);
        },

        // Master
        async initMaster(): Promise<NodeJS.Timer> {
            // Create exec queue
            await amqpService.consumer.channel.assertQueue(config.tasksManager.queues.execOrders);
            await amqpService.consumer.channel.bindQueue(
                config.tasksManager.queues.execOrders,
                config.amqp.exchange,
                config.tasksManager.routingKeys.execOrders
            );

            return _monitorTasks({
                userId: config.defaultUserId,
                queryId: 'TasksManagerDomain'
            });
        },

        // Workers
        async initWorker(): Promise<void> {
            await _listenExecOrders();

            // wait for cancel orders
            const cancelOrdersQueue = `${config.tasksManager.queues.cancelOrders}_${tag}`;
            await amqpService.consumer.channel.assertQueue(cancelOrdersQueue, {
                autoDelete: true,
                durable: false,
                exclusive: true
            });
            await amqpService.consumer.channel.bindQueue(
                cancelOrdersQueue,
                config.amqp.exchange,
                config.tasksManager.routingKeys.cancelOrders
            );
            await amqpService.consume(
                cancelOrdersQueue,
                config.tasksManager.routingKeys.cancelOrders,
                _onCancelMessage
            );
        },
        async updateProgress(
            taskId: string | null,
            progress: {percent?: number; description?: ISystemTranslation},
            ctx: IQueryInfos
        ): Promise<void> {
            if (typeof progress.percent !== 'undefined' && progress.percent === 100) {
                // If percent update is equal to 100, task is completed but not yet updated
                // Only the task manager can update task status to completed
                progress.percent = 99;
            }

            await _updateTask(taskId, {progress}, ctx);
        },
        async setLink(
            taskId: string | null,
            link: {name: string | null; url: string | null},
            ctx: IQueryInfos
        ): Promise<void> {
            await _updateTask(taskId, {link}, ctx);
        }
    };
}
