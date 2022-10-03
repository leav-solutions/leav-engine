// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import winston from 'winston';
import {IConfig} from '_types/config';
import {IAppGraphQLSchema} from '_types/graphql';
import {TaskStatus, TaskPriority, ITask, OrderType} from '../../_types/tasksManager';
import {IPaginationParams, ISortParams, IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IUtils} from 'utils/utils';
import {IRecordDomain} from 'domain/record/recordDomain';
import {withFilter} from 'graphql-subscriptions';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {ITasksManagerDomain, TRIGGER_NAME_TASK} from '../../domain/tasksManager/tasksManagerDomain';
import {IRecord} from '_types/record';
import {AttributeCondition} from '../../_types/record';
import {USERS_LIBRARY} from '../../_types/library';

export interface ITasksManagerApp {
    init(): Promise<void>;
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
    };
    pagination?: IPaginationParams;
    sort?: ISortParams;
}

export default function ({
    'core.domain.record': recordDomain = null,
    'core.domain.tasksManager': tasksManagerDomain = null,
    'core.domain.eventsManager': eventsManager = null
}: IDeps): ITasksManagerApp {
    return {
        init: tasksManagerDomain.init,
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    scalar TaskPriority

                    enum TaskStatus {
                        ${Object.values(TaskStatus).join(' ')}
                    }

                    type TaskLink {
                        name: String!,
                        url: String!
                    }

                    type Task {
                        id: ID!,
                        name: String!,
                        modified_at: Int,
                        created_at: Int,
                        created_by: User,
                        startAt: Int,
                        status: TaskStatus,
                        priority: TaskPriority,
                        progress: Progress,
                        startedAt: Int,
                        completedAt: Int,
                        link: TaskLink,
                        canceledBy: ID
                    }

                    type Progress {
                        percent: Int!
                        description: String
                    }

                    type TasksList {
                        totalCount: Int!
                        list: [Task!]!
                    }

                    input TaskFiltersInput {
                        id: ID,
                        created_by: ID,
                        status: TaskStatus
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
                        deleteTask(taskId: ID!): Task!
                    }

                    type Subscription {
                        task(createdBy: ID): Task!
                    }
                `,
                resolvers: {
                    Task: {
                        created_by: async (task: ITask, _, ctx): Promise<IRecord> => {
                            const record = await recordDomain.find({
                                params: {
                                    library: USERS_LIBRARY,
                                    filters: [
                                        {field: 'id', value: task.created_by, condition: AttributeCondition.EQUAL}
                                    ]
                                },
                                ctx
                            });

                            return record.list.length ? record.list[0] : null;
                        }
                    },
                    TaskPriority,
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
                        async deleteTask(_, {taskId}, ctx: IQueryInfos): Promise<ITask> {
                            return tasksManagerDomain.deleteTask(taskId, ctx);
                        },
                        async cancelTask(_, {taskId}, ctx: IQueryInfos): Promise<boolean> {
                            await tasksManagerDomain.cancelTask({id: taskId}, ctx);
                            return true;
                        }
                    },
                    Subscription: {
                        task: {
                            subscribe: withFilter(
                                () => eventsManager.suscribe([TRIGGER_NAME_TASK]),
                                (payload, variables) => {
                                    return typeof variables.createdBy !== 'undefined'
                                        ? payload.task.created_by === variables.createdBy
                                        : true;
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
