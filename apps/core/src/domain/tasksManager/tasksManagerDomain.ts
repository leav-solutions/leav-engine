// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Joi from 'joi';
import * as Config from '_types/config';
import {IAmqpService} from '@leav/message-broker';
import {IQueryInfos} from '_types/queryInfos';
import {v4 as uuidv4} from 'uuid';
import {
    ITaskOrderPayload,
    ITaskOrder,
    TaskStatus,
    ITask,
    ITaskFunc,
    TaskPriority,
    TaskCallbackType
} from '../../_types/tasksManager';
import {IList, SortOrder} from '../../_types/list';
import {IGetCoreEntitiesParams} from '_types/shared';
import {ITaskRepo} from '../../infra/task/taskRepo';
import {AwilixContainer} from 'awilix';

interface IUpdateData {
    status?: TaskStatus;
    progress?: number;
    startedAt?: number;
    completedAt?: number;
    links?: string[];
}

interface IGetTasksParams extends IGetCoreEntitiesParams {
    filters?: ICoreEntityFilterOptions & {
        status?: TaskStatus;
    };
}

export interface ITasksManagerDomain {
    init(): Promise<void>;
    sendOrder(payload: ITaskOrderPayload, ctx: IQueryInfos): Promise<void>;
    getTasks({params, ctx}: {params: IGetTasksParams; ctx: IQueryInfos}): Promise<IList<ITask>>;
    setLinks(taskId: string, links: string[], ctx: IQueryInfos): Promise<void>;
    updateProgress(taskId: string, progress: number, ctx: IQueryInfos): Promise<void>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqpService'?: IAmqpService;
    'core.infra.task'?: ITaskRepo;
    'core.depsManager'?: AwilixContainer;
}

export default function ({
    config = null,
    'core.infra.amqpService': amqpService = null,
    'core.infra.task': taskRepo = null,
    'core.depsManager': depsManager = null
}: IDeps): ITasksManagerDomain {
    const _getUnixTime = () => Math.floor(Date.now() / 1000);

    const _monitorTasks = (ctx: IQueryInfos): NodeJS.Timer => {
        // check if tasks waiting for execution and execute them

        return setInterval(async () => {
            const tasks = await taskRepo.getTasks({
                ctx
            });

            let tasksToExecute = tasks.list.filter(
                task => task.status === TaskStatus.PENDING && task.startAt <= _getUnixTime()
            );

            // no pending tasks // parallel execution?
            if (!tasksToExecute.length || tasks.list.map(t => t.status).includes(TaskStatus.RUNNING)) {
                return;
            }

            // reorder tasks by priority and startAt
            tasksToExecute = tasksToExecute.sort((a, b) => {
                if (a.priority === b.priority) {
                    return a.startAt - b.startAt;
                }

                return b.priority - a.priority;
            });

            // we execute only one task to avoid concurrency and let other tasks available
            await _executeTask(tasksToExecute[0], ctx);
        }, config.tasksManager.checkingInterval);
    };

    const _validateMsg = (msg: ITaskOrder) => {
        const msgBodySchema = Joi.object().keys({
            time: Joi.number().required(),
            userId: Joi.string().required(),
            payload: Joi.object()
                .keys({
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
                .required()
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

        const {func, startAt, priority, callback} = order.payload;

        await _createTask({func, startAt, priority, callback}, ctx);
    };

    const _createTask = async (
        {func, startAt, priority, callback}: ITaskOrderPayload,
        ctx: IQueryInfos
    ): Promise<ITask> => {
        const task = await taskRepo.createTask(
            {
                func,
                startAt,
                status: TaskStatus.PENDING,
                priority,
                created_at: _getUnixTime(),
                created_by: ctx.userId,
                modified_at: _getUnixTime(),
                modified_by: ctx.userId,
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
                ...data,
                modified_at: _getUnixTime(),
                modified_by: ctx.userId
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

    const _executeTask = async (task: ITask, ctx: IQueryInfos): Promise<void> => {
        await _updateTask(task.id, {startedAt: _getUnixTime(), status: TaskStatus.RUNNING, progress: 0}, ctx);

        let status = task.status;
        const callback = task.callback;

        try {
            const func = _getDepsManagerFunc({
                moduleName: task.func.moduleName,
                subModuleName: task.func.subModuleName,
                funcName: task.func.name
            });
            await func(...task.func.args, {id: task.id});
            status = TaskStatus.DONE;
        } catch (e) {
            console.error(e);
            status = TaskStatus.FAILED;
        }

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

        const updateData = status === TaskStatus.DONE ? {completedAt: _getUnixTime(), status, progress: 100} : {status};
        await _updateTask(task.id, updateData, ctx);
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

            _monitorTasks({userId: '1'});
        },
        async sendOrder(payload: ITaskOrderPayload, ctx: IQueryInfos): Promise<void> {
            await amqpService.publish(
                config.amqp.exchange,
                config.tasksManager.routingKeys.orders,
                JSON.stringify({time: _getUnixTime(), userId: ctx.userId, payload})
            );
        },
        async updateProgress(taskId: string, progress: number, ctx: IQueryInfos): Promise<void> {
            await _updateTask(taskId, {progress}, ctx);
        },
        async setLinks(taskId: string, links: string[], ctx: IQueryInfos): Promise<void> {
            await _updateTask(taskId, {links}, ctx);
        },
        getTasks: _getTasks
    };
}

// TODO:
// ctx dans la task ??
// concurrency between services
// ctx userId 'system' ??
