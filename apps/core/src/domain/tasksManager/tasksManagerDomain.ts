// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Joi from 'joi';
import * as Config from '_types/config';
import {IAmqpService} from '@leav/message-broker';
import {IQueryInfos} from '_types/queryInfos';
import {v4 as uuidv4} from 'uuid';
import {
    Payload,
    ITaskOrder,
    TaskStatus,
    ITask,
    TaskPriority,
    TaskCallbackType,
    OrderType,
    ITaskCreatePayload,
    ITaskCancelPayload
} from '../../_types/tasksManager';
import {IList, SortOrder} from '../../_types/list';
import {IGetCoreEntitiesParams} from '_types/shared';
import {ITaskRepo} from '../../infra/task/taskRepo';
import {AwilixContainer} from 'awilix';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {EventType} from '../../_types/event';
import {Worker, isMainThread, workerData, parentPort} from 'worker_threads';
import path from 'path';
import {IUtils} from 'utils/utils';

import cluster from 'cluster';
import {cpus} from 'os';
import process from 'process';

const numCPUs = cpus().length;

export interface IUpdateData {
    status?: TaskStatus;
    progress?: number;
    startedAt?: number;
    completedAt?: number;
    links?: string[];
    workerId?: number;
}

interface IGetTasksParams extends IGetCoreEntitiesParams {
    filters?: ICoreEntityFilterOptions & {
        status?: TaskStatus;
        startAt?: number;
    };
}

export interface ITasksManagerDomain {
    init(): Promise<void>;
    sendOrder(type: OrderType, payload: Payload, ctx: IQueryInfos): Promise<void>;
    getTasks({params, ctx}: {params: IGetTasksParams; ctx: IQueryInfos}): Promise<IList<ITask>>;
    setLinks(taskId: string, links: string[], ctx: IQueryInfos): Promise<void>;
    updateProgress(taskId: string, progress: number, ctx: IQueryInfos): Promise<void>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqpService'?: IAmqpService;
    'core.infra.task'?: ITaskRepo;
    'core.depsManager'?: AwilixContainer;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    'core.utils'?: IUtils;
}

interface IMasterMsg {
    type: string;
    data?: any;
}

export default function ({
    config = null,
    'core.infra.amqpService': amqpService = null,
    'core.infra.task': taskRepo = null,
    'core.depsManager': depsManager = null,
    'core.domain.eventsManager': eventsManager = null,
    'core.utils': utils = null
}: IDeps): ITasksManagerDomain {
    if (cluster.isWorker) {
        // We send a message on initialization to the master to let it know that this worker is ready to receive a task
        process.send('alive');

        process.on('message', async (msg: IMasterMsg) => {
            if (msg.type === 'execute') {
                console.debug('Executing task from worker', cluster.worker.id);
                await _executeTask(msg.data.task, {userId: '1'});
                console.debug('Task executed, worker', cluster.worker.id, 'exit');
                process.exit(0);
            } else if (msg.type === 'cancel') {
                console.debug('Task canceled, worker', cluster.worker.id, 'exit');
                process.exit(0);
            }
        });
    }

    const _monitorTasks = (ctx: IQueryInfos): NodeJS.Timer => {
        // check if tasks waiting for execution and execute them
        return setInterval(async () => {
            console.debug('interval');
            console.debug('cluster.workers', cluster.workers);
            console.debug({isMaster: cluster.isMaster, workers: Object.keys(cluster.workers).length});

            // too much workers running, waiting...
            if (Object.keys(cluster.workers).length > numCPUs) {
                console.debug('too much workers running, waiting...');
                return;
            }

            const tasksToExecute = await taskRepo.getTasksToExecute(ctx);

            if (!tasksToExecute.totalCount) {
                return;
            }

            const task = tasksToExecute.list[0];

            // We have a task to execute, we create a worker
            const worker = cluster.fork();
            console.debug('worker', worker.id, 'created');

            worker.on('message', async msg => {
                console.debug('msg', msg, 'received from worker', worker.id);
                if (msg === 'alive') {
                    console.debug('Sending execution task msg to worker');
                    // send execution order to new worker created when it's alive
                    worker.send({type: 'execute', data: {task}} as IMasterMsg);
                }
            });

            // TODO: si une tache en cours a ce worker id il faut fork (si on a atteint le numCpus on return on attend la fin d'une tache)
            // si c'est ok ce worker est libre et on execute la tache
            // On attache le worker id à la tache et on le détache des que la tache est terminé

            // we execute only one task to avoid concurrency and let other tasks available
            // await _executeTask(tasksToExecute.list[0], ctx);
        }, config.tasksManager.checkingInterval);
    };

    const _executeTask = async (task: ITask, ctx: IQueryInfos): Promise<void> => {
        await _updateTask(
            task.id,
            {startedAt: utils.getUnixTime(), status: TaskStatus.RUNNING, progress: 0, workerId: cluster.worker.id},
            ctx
        );

        let status = task.status;
        const callback = task.callback;

        try {
            const func = _getDepsManagerFunc({
                moduleName: task.func.moduleName,
                subModuleName: task.func.subModuleName,
                funcName: task.func.name
            });

            await func(...task.func.args, {id: task.id});

            if (
                typeof callback !== 'undefined' &&
                (callback.type === TaskCallbackType.ALWAYS ||
                    (callback.type === TaskCallbackType.ON_FAILURE && status === TaskStatus.FAILED) ||
                    (callback.type === TaskCallbackType.ON_SUCCESS && status === TaskStatus.DONE))
            ) {
                const callbackFunc = _getDepsManagerFunc({
                    moduleName: callback.moduleName,
                    subModuleName: callback.subModuleName,
                    funcName: callback.name
                });

                await callbackFunc(...callback.args);
            }

            status = TaskStatus.DONE;
        } catch (e) {
            console.error(e);
            status = TaskStatus.FAILED;
        }

        await new Promise(resolve => setTimeout(resolve, 300000)); // 300s

        await _updateTask(
            task.id,
            {
                ...(status === TaskStatus.DONE ? {completedAt: utils.getUnixTime(), progress: 100} : {}),
                status,
                workerId: null
            },
            ctx
        );
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
                            name: Joi.string().required(),
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
                                type: Joi.string()
                                    .valid(...Object.values(TaskCallbackType))
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
        const ctx: IQueryInfos = {
            userId: '1',
            queryId: uuidv4()
        };

        try {
            _validateMsg(order);
        } catch (e) {
            console.error(e);
        }

        if (order.type === OrderType.CREATE) {
            await _createTask(order.payload as ITaskCreatePayload, ctx);
        } else if (order.type === OrderType.CANCEL) {
            await _cancelTask(order.payload as ITaskCancelPayload, ctx);
        }
    };

    const _createTask = async (
        {id, name, func, startAt, priority, callback}: ITaskCreatePayload,
        ctx: IQueryInfos
    ): Promise<ITask> => {
        const task = await taskRepo.createTask(
            {
                id,
                name,
                func,
                startAt,
                status: TaskStatus.PENDING,
                priority,
                ...(!!callback && {callback})
            },
            ctx
        );

        return task;
    };

    const _updateTask = async (taskId: string, data: IUpdateData, ctx: IQueryInfos): Promise<ITask> => {
        const task = await taskRepo.updateTask(
            {
                id: taskId,
                ...data
            },
            ctx
        );

        return task;
    };

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
    }): any => {
        const func = depsManager.resolve(`core.${moduleName}${!!subModuleName ? `.${subModuleName}` : ''}`)?.[funcName];

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

        if (task.status !== TaskStatus.RUNNING || typeof task.workerId === 'undefined') {
            throw new Error('Task not running');
        }

        // send cancel signal to worker
        console.debug('Sending cancel signal to task', id, ', worker', task.workerId);
        cluster.workers[task.workerId].send({type: 'cancel'} as IMasterMsg);
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
        async sendOrder(type: OrderType, payload: Payload, ctx: IQueryInfos): Promise<void> {
            await amqpService.publish(
                config.amqp.exchange,
                config.tasksManager.routingKeys.orders,
                JSON.stringify({time: utils.getUnixTime(), userId: ctx.userId, type, payload})
            );
        },
        async updateProgress(taskId: string, progress: number, ctx: IQueryInfos): Promise<void> {
            await _updateTask(taskId, {progress}, ctx);
            // await eventsManager.send([EventType.PUBSUB], {taskId, progress}, ctx);
        },
        async setLinks(taskId: string, links: string[], ctx: IQueryInfos): Promise<void> {
            await _updateTask(taskId, {links}, ctx);
        },
        getTasks: _getTasks
    };
}
