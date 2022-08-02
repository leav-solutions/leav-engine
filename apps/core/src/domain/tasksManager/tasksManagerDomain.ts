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

interface IUpdateData {
    status?: eTaskStatus;
    progress?: number;
    startedAt?: number;
    completedAt?: number;
    links?: string[];
}

interface IGetTasksParams extends IGetCoreEntitiesParams {
    filters: ICoreEntityFilterOptions & {
        status: eTaskStatus;
    };
}

export interface ITasksManagerDomain {
    init(): Promise<void>;
    sendOrder(payload: ITaskOrderPayload, ctx: IQueryInfos): Promise<void>;
    create(moduleName: string, funcName: string, funcArgs: any[], startAt: number, ctx: IQueryInfos): Promise<string>;
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
}

export default function ({
    config = null,
    'core.infra.amqpService': amqpService = null,
    'core.domain.record': recordDomain = null,
    'core.domain.value': valueDomain = null,
    'core.infra.task': taskRepo = null
}: IDeps): ITasksManagerDomain {
    const _validateMsg = (msg: ITaskOrder) => {
        const msgBodySchema = Joi.object().keys({
            time: Joi.number().required(),
            userId: Joi.string().required(),
            payload: Joi.object()
                .keys({
                    moduleName: Joi.string().required(),
                    funcName: Joi.string().required(),
                    funcArgs: Joi.array().required(),
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

        const {moduleName, funcName, funcArgs, startAt} = order.payload;

        await _create(moduleName, funcName, funcArgs, startAt, ctx);
    };

    const _create = async (
        moduleName: string,
        funcName: string,
        funcArgs: any[],
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
                    attribute: 'funcName',
                    value: funcName
                },
                {
                    attribute: 'funcArgs',
                    value: JSON.stringify(funcArgs)
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
                JSON.stringify({time: Date.now(), userId: ctx.userId, payload})
            );
        },
        create: _create, // return task id
        update: _update,
        async start(taskId: string, ctx: IQueryInfos): Promise<void> {
            await _update(taskId, {startedAt: Date.now(), status: eTaskStatus.IN_PROGRESS}, ctx);
        },
        async complete(taskId: string, links: string[], ctx: IQueryInfos): Promise<void> {
            await _update(taskId, {completedAt: Date.now(), status: eTaskStatus.DONE, links}, ctx);
        },
        async getTasks({params, ctx}: {params: IGetTasksParams; ctx: IQueryInfos}): Promise<IList<ITask>> {
            if (typeof params.sort === 'undefined') {
                params.sort = {field: 'id', order: SortOrder.ASC};
            }

            const tasks = await taskRepo.getTasks({params, ctx});

            console.debug({tasks: tasks.list});

            return tasks;
        }
    };
}

// TODO:
// create(...)
// update(progression)
// complete
// getInfos(id)
// 	-> progress, nom, status, …
// getTasks(…) TODO: à tester
// setCancelCallback(function) // TODO: add callback attribute in db

// funcARgs as string everywhere ?
// dates problem graphql
