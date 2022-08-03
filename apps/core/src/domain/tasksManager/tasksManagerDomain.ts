// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import Joi from 'joi';
import * as Config from '_types/config';
import {IAmqpService} from '@leav/message-broker';
import {IQueryInfos} from '_types/queryInfos';
import {v4 as uuidv4} from 'uuid';
import {ITaskOrderPayload, ITaskOrder, eTaskStatus, ITask} from '../../_types/tasksManager';
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
    create(
        moduleName: string,
        subModuleName: string,
        funcName: string,
        funcArgs: string,
        startAt: number,
        ctx: IQueryInfos
    ): Promise<string>;
    update(
        taskId: string,
        {status, progress, startedAt, completedAt, links}: IUpdateData,
        ctx: IQueryInfos
    ): Promise<void>;
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
                    moduleName: Joi.string().required(),
                    subModuleName: Joi.string().required(),
                    funcName: Joi.string().required(),
                    funcArgs: Joi.string().required(),
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

        const {moduleName, subModuleName, funcName, funcArgs, startAt} = order.payload;

        await _create(moduleName, subModuleName, funcName, funcArgs, startAt, ctx);
    };

    const _create = async (
        moduleName: string,
        subModuleName: string,
        funcName: string,
        funcArgs: string,
        startAt: number,
        ctx: IQueryInfos
    ): Promise<string> => {
        const task = await recordDomain.createRecord(TASKS_COLLECTION, ctx);

        await valueDomain.saveValueBatch({
            library: TASKS_COLLECTION,
            recordId: task.id,
            values: [
                {
                    attribute: 'moduleName',
                    value: moduleName
                },
                {
                    attribute: 'subModuleName',
                    value: subModuleName
                },
                {
                    attribute: 'funcName',
                    value: funcName
                },
                {
                    attribute: 'funcArgs',
                    value: funcArgs
                },
                {
                    attribute: 'startAt',
                    value: startAt
                },
                {
                    attribute: 'status',
                    value: eTaskStatus.WAITING
                }
            ],
            ctx
        });

        return task.id;
    };

    const _update = async (taskId: string, data: IUpdateData, ctx: IQueryInfos): Promise<void> => {
        let values = Object.keys(data)
            .filter(k => k !== 'links')
            .map(k => ({attribute: k, value: data[k]}));

        if (typeof data.links !== 'undefined') {
            values = values.concat(data.links.map(l => ({attribute: 'links', value: l})));
        }

        await valueDomain.saveValueBatch({
            library: TASKS_COLLECTION,
            recordId: taskId,
            values,
            ctx
        });
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
            await _update(taskId, {startedAt: _getLinuxTime(), status: eTaskStatus.IN_PROGRESS}, ctx);

            const task = (await _getTasks({params: {filters: {id: taskId}}, ctx}))?.list[0];

            await (depsManager.resolve(`core.${task.moduleName}.${task.subModuleName}`) as any)[task.funcName](
                ...JSON.parse(task.funcArgs),
                ctx
            );

            // FIXME: callback ?
        },
        async complete(taskId: string, links: string[], ctx: IQueryInfos): Promise<void> {
            await _update(taskId, {completedAt: _getLinuxTime(), status: eTaskStatus.DONE, links}, ctx);
        }
    };
}

// TODO:
// setCancelCallback(function) // TODO: add callback attribute in db
// ctx dans la task
