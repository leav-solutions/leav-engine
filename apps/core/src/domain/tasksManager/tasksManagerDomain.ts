// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Joi from 'joi';
import * as Config from '_types/config';
import {IAmqpService} from '@leav/message-broker';
import {IQueryInfos} from '_types/queryInfos';
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
    ITaskFuncParams
} from '../../_types/tasksManager';
import winston from 'winston';
import {IList, SortOrder} from '../../_types/list';
import {IGetCoreEntitiesParams} from '_types/shared';
import {ITaskRepo} from '../../infra/task/taskRepo';
import {AwilixContainer} from 'awilix';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IUtils} from 'utils/utils';
import cluster from 'cluster';
import {cpus} from 'os';
import process from 'process';
import {ISystemTranslation} from '_types/systemTranslation';

export interface IUpdateData {
    status?: TaskStatus;
    progress?: {percent?: number; description?: ISystemTranslation};
    startedAt?: number;
    completedAt?: number;
    link?: {name: string; url: string};
    workerId?: number;
    canceledBy?: string;
    archive?: boolean;
}

interface IGetTasksParams extends IGetCoreEntitiesParams {
    filters?: ICoreEntityFilterOptions & {
        status?: TaskStatus;
        startAt?: number;
        created_by?: string;
        archive?: boolean;
    };
}

export interface ITasksManagerDomain {
    init(): Promise<void>;
    getTasks({params, ctx}: {params: IGetTasksParams; ctx: IQueryInfos}): Promise<IList<ITask>>;
    setLink(taskId: string, link: {name: string; url: string}, ctx: IQueryInfos): Promise<void>;
    updateProgress(
        taskId: string,
        progress: {percent?: number; description?: ISystemTranslation},
        ctx: IQueryInfos
    ): Promise<void>;
    createTask(task: ITaskCreatePayload, ctx: IQueryInfos): Promise<void>;
    cancelTask(task: ITaskCancelPayload, ctx: IQueryInfos): Promise<void>;
    deleteTask(taskId: string, archive: boolean, ctx: IQueryInfos): Promise<ITask>;
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

interface IMasterMsg {
    type: string;
    data?: any;
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
    const maxNbWorkers = config.tasksManager.nbWorkers || cpus().length;

    if (cluster.isWorker) {
        let taskId = null;

        // We send a message on initialization to the master to let it know that this worker is ready to receive a task
        process.send('alive');

        process.on('message', async (msg: IMasterMsg) => {
            try {
                if (msg.type === 'execute') {
                    let task = msg.data.task;
                    taskId = task.id;

                    task = await _executeTask(task, {userId: task.created_by});
                }
            } finally {
                await amqpService.close();
                cluster.worker.kill();
            }
        });
    }

    const _monitorTasks = (ctx: IQueryInfos): NodeJS.Timer => {
        // check if tasks waiting for execution and execute them
        return setInterval(async () => {
            // too much workers running, waiting...
            if (Object.keys(cluster.workers).length > maxNbWorkers) {
                return;
            }

            const tasksToExecute = await taskRepo.getTasksToExecute(ctx);

            if (!tasksToExecute.totalCount) {
                return;
            }

            const task = tasksToExecute.list[0];

            // We have a task to execute, we create a worker
            const worker = cluster.fork();

            await _attachWorker(task.id, worker.id, ctx);

            worker.on('message', async msg => {
                if (msg === 'alive') {
                    // send execution order to new worker created when it's alive
                    worker.send({type: 'execute', data: {task}} as IMasterMsg);
                }
            });

            worker.on('disconnect', async () => {
                await _detachWorker(task.id, ctx);
                await _executeCallback(task.id, ctx);
            });
        }, config.tasksManager.checkingInterval);
    };

    const _executeTask = async (task: ITask, ctx: IQueryInfos): Promise<ITask> => {
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

            await func(...task.func.args, {id: task.id});

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

    const _executeCallback = async (taskId: string, ctx: IQueryInfos): Promise<void> => {
        const res = await _getTasks({params: {filters: {id: taskId}}, ctx});

        const task = res.list[0];

        if (!task) {
            throw new Error('Task not found');
        }

        if (
            !!task.callback &&
            ((task.callback.type.includes(TaskCallbackType.ON_FAILURE) && task.status === TaskStatus.FAILED) ||
                (task.callback.type.includes(TaskCallbackType.ON_SUCCESS) && task.status === TaskStatus.DONE) ||
                (task.callback.type.includes(TaskCallbackType.ON_CANCEL) && task.status === TaskStatus.CANCELED))
        ) {
            try {
                const callbackFunc = _getDepsManagerFunc({
                    moduleName: task.callback.moduleName,
                    subModuleName: task.callback.subModuleName,
                    funcName: task.callback.name
                });

                await callbackFunc(...task.callback.args);
            } catch (e) {
                logger.error('Error executing callback', e);
            }
        }
    };

    const _validateMsg = (msg: ITaskOrder) => {
        const msgBodySchema = Joi.object().keys({
            time: Joi.number().required(),
            userId: Joi.string().required(),
            type: Joi.string()
                .equal(...Object.keys(OrderType))
                .required(),
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
                                    subModuleName: Joi.string(),
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

    const _onMessage = async (msg: string): Promise<void> => {
        const order: ITaskOrder = JSON.parse(msg);

        try {
            _validateMsg(order);
        } catch (e) {
            logger.error(e);
        }

        if (order.type === OrderType.CREATE) {
            await _createTask(order.payload as ITaskCreatePayload, {userId: order.userId});
        } else if (order.type === OrderType.CANCEL) {
            await _cancelTask(order.payload as ITaskCancelPayload, {userId: order.userId});
        }
    };

    const _createTask = async (
        {id, label, func, startAt, priority, callback}: ITaskCreatePayload,
        ctx: IQueryInfos
    ): Promise<ITask> => {
        const task = await taskRepo.createTask(
            {
                id,
                label,
                func,
                startAt,
                status: TaskStatus.PENDING,
                priority,
                archive: false,
                ...(!!callback && {callback})
            },
            ctx
        );

        await eventsManager.sendPubSubEvent({triggerName: TRIGGER_NAME_TASK, data: {task}}, ctx);

        return task;
    };

    const _updateTask = async (taskId: string, data: IUpdateData, ctx: IQueryInfos): Promise<ITask> => {
        const res = await _getTasks({params: {filters: {id: taskId}}, ctx});
        let task = res.list[0];

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

    const _attachWorker = async (taskId: string, workerId: number, ctx: IQueryInfos) =>
        _updateTask(taskId, {workerId}, ctx);

    const _detachWorker = async (taskId: string, ctx: IQueryInfos) => _updateTask(taskId, {workerId: null}, ctx);

    const _getTasks = async ({params, ctx}: {params: IGetTasksParams; ctx: IQueryInfos}): Promise<IList<ITask>> => {
        if (typeof params.sort === 'undefined') {
            params.sort = {field: 'id', order: SortOrder.ASC};
        }

        const tasks = await taskRepo.getTasks({params, ctx});

        return tasks;
    };

    const _getDepsManagerFunc = ({
        moduleName,
        subModuleName,
        funcName
    }: {
        moduleName: string;
        subModuleName?: string;
        funcName: string;
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
        const res = await _getTasks({params: {filters: {id}}, ctx});

        const task = res.list[0];

        if (!task) {
            throw new Error('Task not found');
        }

        // if task is still pending or running, cancel it
        if (task.status === TaskStatus.PENDING || task.status === TaskStatus.RUNNING) {
            await _updateTask(
                task.id,
                {status: TaskStatus.CANCELED, canceledBy: ctx.userId, completedAt: utils.getUnixTime()},
                ctx
            );

            if (typeof task.workerId !== 'undefined') {
                // sending kill signal to worker
                cluster.workers[task.workerId].kill();
            } else if (!!task.callback) {
                await _executeCallback(task.id, ctx);
            }
        }
    };

    const _deleteTask = async (taskId: string, archive: boolean, ctx: IQueryInfos): Promise<ITask> => {
        const res = await _getTasks({params: {filters: {id: taskId}}, ctx});

        const task = res.list[0];

        if (!task) {
            throw new Error('Task not found');
        } else if (!!task.workerId) {
            throw new Error(`Cannot delete: task ${taskId} is still running.`);
        }

        return archive ? _updateTask(taskId, {archive}, ctx) : taskRepo.deleteTask(taskId, ctx);
    };

    const _sendOrder = async (type: OrderType, payload: Payload, ctx: IQueryInfos): Promise<void> => {
        await amqpService.publish(
            config.amqp.exchange,
            config.tasksManager.routingKeys.orders,
            JSON.stringify({time: utils.getUnixTime(), userId: ctx.userId, type, payload})
        );
    };

    return {
        async init(): Promise<void> {
            await amqpService.consumer.channel.assertQueue(config.tasksManager.queues.orders);
            await amqpService.consumer.channel.bindQueue(
                config.tasksManager.queues.orders,
                config.amqp.exchange,
                config.tasksManager.routingKeys.orders
            );

            await amqpService.consume(
                config.tasksManager.queues.orders,
                config.tasksManager.routingKeys.orders,
                _onMessage
            );

            if (cluster.isMaster) {
                _monitorTasks({userId: '1'});
            }
        },
        async createTask(task: ITaskCreatePayload, ctx: IQueryInfos): Promise<void> {
            await _sendOrder(OrderType.CREATE, task, ctx);
        },
        async cancelTask(task: ITaskCancelPayload, ctx: IQueryInfos): Promise<void> {
            await _sendOrder(OrderType.CANCEL, task, ctx);
        },
        async deleteTask(taskId: string, archive: boolean, ctx: IQueryInfos): Promise<ITask> {
            return _deleteTask(taskId, archive, ctx);
        },
        async updateProgress(
            taskId: string,
            progress: {percent?: number; description?: ISystemTranslation},
            ctx: IQueryInfos
        ): Promise<void> {
            await _updateTask(taskId, {progress}, ctx);
        },
        async setLink(taskId: string, link: {name: string; url: string}, ctx: IQueryInfos): Promise<void> {
            await _updateTask(taskId, {link}, ctx);
        },
        getTasks: _getTasks
    };
}
