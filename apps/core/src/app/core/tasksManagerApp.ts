// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {IRecordDomain} from 'domain/record/recordDomain';
import {withFilter} from 'graphql-subscriptions';
import {IUtils} from 'utils/utils';
import winston from 'winston';
import {IConfig} from '_types/config';
import {IAppGraphQLSchema} from '_types/graphql';
import {IList, IPaginationParams, ISortParams} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IRecord} from '_types/record';
import {ITasksManagerDomain} from '../../domain/tasksManager/tasksManagerDomain';
import {TriggerNames} from '../../_types/eventsManager';
import {USERS_LIBRARY} from '../../_types/library';
import {AttributeCondition} from '../../_types/record';
import {ITask, TaskPriority, TaskStatus, TaskType} from '../../_types/tasksManager';

export interface ITasksManagerApp {
    initMaster(): Promise<NodeJS.Timer>;
    initWorker(): Promise<void>;
    getGraphQLSchema(): Promise<IAppGraphQLSchema>;
}

interface IDeps {
    'core.domain.tasksManager'?: ITasksManagerDomain;
    'core.utils.logger'?: winston.Winston;
    config?: IConfig;
    'core.utils'?: IUtils;
    'core.domain.record'?: IRecordDomain;
    'core.domain.eventsManager'?: IEventsManagerDomain;
}

export interface IGetTasksArgs {
    filters?: ICoreEntityFilterOptions & {
        created_by: string;
        status: TaskStatus;
        archive: boolean;
    };
    pagination?: IPaginationParams;
    sort?: ISortParams;
}

export default function ({
    'core.domain.record': recordDomain = null,
    'core.domain.tasksManager': tasksManagerDomain = null,
    'core.domain.eventsManager': eventsManager = null
}: IDeps): ITasksManagerApp {
    const _getUser = async (userId: string, ctx: IQueryInfos): Promise<IRecord> => {
        const record = await recordDomain.find({
            params: {
                library: USERS_LIBRARY,
                filters: [{field: 'id', value: userId, condition: AttributeCondition.EQUAL}]
            },
            ctx
        });

        return record.list.length ? record.list[0] : null;
    };

    return {
        initMaster: tasksManagerDomain.initMaster,
        initWorker: tasksManagerDomain.initWorker,
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    scalar TaskPriority

                    enum TaskStatus {
                        ${Object.values(TaskStatus).join(' ')}
                    }

                    enum TaskType {
                        ${Object.values(TaskType).join(' ')}
                    }

                    type TaskLink {
                        name: String!,
                        url: String!
                    }

                    type TaskRole {
                        type: TaskType!,
                        detail: String
                    }

                    type Task {
                        id: ID!,
                        label: SystemTranslation!,
                        modified_at: Int!,
                        created_at: Int!,
                        created_by: Record!,
                        startAt: Int!,
                        status: TaskStatus!,
                        priority: TaskPriority!,
                        archive: Boolean!,
                        role: TaskRole,
                        progress: Progress,
                        startedAt: Int,
                        completedAt: Int,
                        link: TaskLink,
                        canceledBy: Record
                    }

                    type Progress {
                        percent: Int
                        description: SystemTranslation
                    }

                    type TasksList {
                        totalCount: Int!
                        list: [Task!]!
                    }

                    input TaskFiltersInput {
                        id: ID,
                        created_by: ID,
                        status: TaskStatus,
                        archive: Boolean,
                        type: TaskType
                    }

                    input DeleteTaskInput {
                        id: ID!
                        archive: Boolean!
                    }

                    extend type Query {
                        tasks(
                            filters: TaskFiltersInput,
                            pagination: Pagination,
                            sort: RecordSortInput
                        ): TasksList!
                    }

                    extend type Mutation {
                        cancelTask(taskId: ID!): Boolean!
                        deleteTasks(tasks: [DeleteTaskInput!]!): Boolean!
                    }

                    type Subscription {
                        task(filters: TaskFiltersInput): Task!
                    }
                `,
                resolvers: {
                    TaskPriority,
                    Task: {
                        created_by: async (task: ITask, _, ctx): Promise<IRecord> => _getUser(task.created_by, ctx),
                        canceledBy: async (task: ITask, _, ctx): Promise<IRecord> => {
                            if (!task.canceledBy) {
                                return null;
                            }

                            return _getUser(task.canceledBy, ctx);
                        }
                    },
                    Query: {
                        async tasks(
                            _,
                            {filters, pagination, sort}: IGetTasksArgs,
                            ctx: IQueryInfos
                        ): Promise<IList<ITask>> {
                            return tasksManagerDomain.getTasks({
                                params: {filters, pagination, sort, withCount: true},
                                ctx
                            });
                        }
                    },
                    Mutation: {
                        async deleteTasks(
                            _,
                            {tasks}: {tasks: Array<{id: string; archive: boolean}>},
                            ctx: IQueryInfos
                        ): Promise<boolean> {
                            await tasksManagerDomain.deleteTasks(tasks, ctx);
                            return true;
                        },
                        async cancelTask(_, {taskId}: {taskId: string}, ctx: IQueryInfos): Promise<boolean> {
                            await tasksManagerDomain.cancelTask({id: taskId}, ctx);
                            return true;
                        }
                    },
                    Subscription: {
                        task: {
                            subscribe: withFilter(
                                () => eventsManager.subscribe([TriggerNames.TASK]),
                                (payload, variables) => {
                                    let toReturn = true;

                                    if (typeof variables.filters?.created_by !== 'undefined') {
                                        toReturn = payload.task.created_by === variables.filters.created_by;
                                    }

                                    if (toReturn && typeof variables.filters?.id !== 'undefined') {
                                        toReturn = payload.task.id === variables.filters.id;
                                    }

                                    if (toReturn && typeof variables.filters?.status !== 'undefined') {
                                        toReturn = payload.task.status === variables.filters.status;
                                    }

                                    if (toReturn && typeof variables.filters?.archive !== 'undefined') {
                                        toReturn = payload.task.archive === variables.filters.archive;
                                    }

                                    if (toReturn && typeof variables.filters?.type !== 'undefined') {
                                        toReturn = payload.task.role?.type === variables.filters.type;
                                    }

                                    return toReturn;
                                }
                            )
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
