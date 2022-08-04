// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Joi from 'joi';
import * as Config from '_types/config';
import {IAmqpService} from '@leav/message-broker';
import {IQueryInfos} from '_types/queryInfos';
import {v4 as uuidv4} from 'uuid';
import {ITaskOrderPayload, ITaskOrder, eTaskStatus, ITask, ITaskFunc} from '../../_types/tasksManager';
import {IRecordDomain} from 'domain/record/recordDomain';
import {IValueDomain} from 'domain/value/valueDomain';
import {IList, SortOrder} from '../../_types/list';
import {IGetCoreEntitiesParams} from '_types/shared';
import {ITaskRepo, TASKS_COLLECTION} from '../../infra/task/taskRepo';
import {AwilixContainer} from 'awilix';

interface IUpdateData {
    status?: eTaskStatus;
    progress?: number;
    startedAt?: number;
    completedAt?: number;
    links?: string[];
}

interface IGetTasksParams extends IGetCoreEntitiesParams {
    filters?: ICoreEntityFilterOptions & {
        status?: eTaskStatus;
    };
}

export interface ITasksManagerDomain {
    init(): Promise<void>;
    sendOrder(payload: ITaskOrderPayload, ctx: IQueryInfos): Promise<void>;
    create(taskFunc: ITaskFunc, startAt: number, ctx: IQueryInfos): Promise<ITask>;
    update(
        taskId: string,
        {status, progress, startedAt, completedAt, links}: IUpdateData,
        ctx: IQueryInfos
    ): Promise<ITask>;
    complete(taskId: string, links: string[], ctx: IQueryInfos): Promise<void>;
    start(taskId: string, ctx: IQueryInfos): Promise<void>;
    getTasks({params, ctx}: {params: IGetTasksParams; ctx: IQueryInfos}): Promise<IList<ITask>>;
}

interface IDeps {
    config?: Config.IConfig;
    'core.infra.amqpService'?: IAmqpService;
    'core.domain.record'?: IRecordDomain;
    'core.domain.value'?: IValueDomain;
    'core.infra.task'?: ITaskRepo;
    'core.depsManager'?: AwilixContainer;
}

export default function ({
    config = null,
    'core.infra.amqpService': amqpService = null,
    'core.domain.record': recordDomain = null,
    'core.domain.value': valueDomain = null,
    'core.infra.task': taskRepo = null,
    'core.depsManager': depsManager = null
}: IDeps): ITasksManagerDomain {
    const _getLinuxTime = () => Math.floor(Date.now() / 1000);

    const _validateMsg = (msg: ITaskOrder) => {
        const msgBodySchema = Joi.object().keys({
            time: Joi.number().required(),
            userId: Joi.string().required(),
            payload: Joi.object()
                .keys({
                    func: Joi.object().keys({
                        moduleName: Joi.string().required(),
                        subModuleName: Joi.string().required(),
                        name: Joi.string().required(),
                        args: Joi.array().required()
                    }),
                    startAt: Joi.date().timestamp('unix').raw().required()
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

        const {func, startAt} = order.payload;

        await _create(func, startAt, ctx);
    };

    const _create = async (taskFunc: ITaskFunc, startAt: number, ctx: IQueryInfos): Promise<ITask> => {
        const task = await taskRepo.createTask(
            {
                func: taskFunc,
                startAt,
                status: eTaskStatus.PENDING,
                created_at: _getLinuxTime(),
                created_by: ctx.userId,
                modified_at: _getLinuxTime(),
                modified_by: ctx.userId
            },
            ctx
        );

        return task;
    };

    const _update = async (taskId: string, data: IUpdateData, ctx: IQueryInfos): Promise<ITask> => {
        const task = await taskRepo.updateTask(
            {
                id: taskId,
                ...data,
                modified_at: _getLinuxTime(),
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

    return {
        async init(): Promise<void> {
            await amqpService.consumer.channel.assertQueue(config.tasksManager.queues.orders);
            await amqpService.consumer.channel.bindQueue(
                config.tasksManager.queues.orders,
                config.amqp.exchange,
                config.tasksManager.routingKeys.orders
            );

            return amqpService.consume(
                config.tasksManager.queues.orders,
                config.tasksManager.routingKeys.orders,
                _onMessage
            );
        },
        async sendOrder(payload: ITaskOrderPayload, ctx: IQueryInfos): Promise<void> {
            await amqpService.publish(
                config.amqp.exchange,
                config.tasksManager.routingKeys.orders,
                JSON.stringify({time: _getLinuxTime(), userId: ctx.userId, payload})
            );
        },
        create: _create, // return task id
        update: _update,
        getTasks: _getTasks,
        async start(taskId: string, ctx: IQueryInfos): Promise<void> {
            const task = (await _getTasks({params: {filters: {id: taskId}}, ctx}))?.list[0];

            const func = depsManager.resolve(`core.${task.func.moduleName}.${task.func.subModuleName}`)?.[
                task.func.name
            ];

            await _update(taskId, {startedAt: _getLinuxTime(), status: eTaskStatus.RUNNING}, ctx);

            try {
                await func(...task.func.args, ctx, taskId);
            } catch (e) {
                await _update(taskId, {status: eTaskStatus.FAILED}, ctx);
            } finally {
                // FIXME: call callback ?
            }
        },
        async complete(taskId: string, links: string[], ctx: IQueryInfos): Promise<void> {
            await _update(taskId, {completedAt: _getLinuxTime(), status: eTaskStatus.DONE, links}, ctx);
        }
    };
}

// TODO:
// setCancelCallback(function) // TODO: add callback attribute in db
// ctx dans la task
