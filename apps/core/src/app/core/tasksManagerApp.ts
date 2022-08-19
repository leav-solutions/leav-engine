// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITasksManagerDomain} from 'domain/tasksManager/tasksManagerDomain';
import winston from 'winston';
import {IConfig} from '_types/config';
import {IAppGraphQLSchema} from '_types/graphql';
import {TaskStatus, TaskPriority, ITask, TaskCallbackType, OrderType} from '../../_types/tasksManager';
import {IPaginationParams, ISortParams, IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IUtils} from 'utils/utils';
import {GraphQLEnumType} from 'graphql';
import {IRecordDomain} from 'domain/record/recordDomain';
import {withFilter} from 'graphql-subscriptions';
import {IServer} from 'interface/server';
import {IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {EventType} from '../../_types/event';

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
    'core.interface.server'?: IServer;
    'core.domain.eventsManager'?: IEventsManagerDomain;
}

export interface IGetTasksArgs {
    filters?: ICoreEntityFilterOptions & {
        status: TaskStatus;
    };
    pagination?: IPaginationParams;
    sort?: ISortParams;
}

export default function ({
    'core.interface.server': server = null,
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

                    type Task {
                        id: ID!,
                        name: String!,
                        modified_at: Int,
                        created_at: Int,
                        modified_by: User,
                        created_by: User,
                        startAt: Int,
                        status: TaskStatus,
                        priority: TaskPriority,
                        progress: Int,
                        startedAt: Int,
                        completedAt: Int,
                        links: [String]
                    }

                    type TasksList {
                        totalCount: Int!
                        list: [Task!]!
                    }

                    input TaskFiltersInput {
                        id: ID,
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
                    }
                `,
                // type Subscription {
                //     taskProgress: Int!
                // }
                resolvers: {
                    TaskPriority,
                    Query: {
                        async tasks(
                            _,
                            {filters, pagination, sort}: IGetTasksArgs,
                            ctx: IQueryInfos
                        ): Promise<IList<ITask>> {
                            // FIXME: test publish pubsub, to del
                            await eventsManager.send([EventType.PUBSUB], {}, ctx);

                            return tasksManagerDomain.getTasks({
                                params: {filters, pagination, sort, withCount: true},
                                ctx
                            });
                        }
                    },
                    Mutation: {
                        async cancelTask(_, {taskId}, ctx: IQueryInfos): Promise<boolean> {
                            await tasksManagerDomain.sendOrder(OrderType.CANCEL, {id: taskId}, ctx);
                            return true;
                        }
                    }
                    // ,
                    // Subscription: {
                    //     taskProgress: {
                    //         subscribe: () => eventsManager.pubsub.asyncIterator('TASK_PROGRESS')
                    //         // withFilter(
                    //         //     () => server.pubsub.asyncIterator('TASK_PROGRESS'),
                    //         //     (payload, variables) => {
                    //         //         return payload.taskProgress.taskId === variables.taskId;
                    //         //     }
                    //         // )
                    //     }
                    //     // taskProgress: () => pubsub.asyncIterator(['TASK_PROGRESS'])
                    //     // {
                    //     //     subscribe: async (_, {taskId}, ctx: IQueryInfos) => {
                    //     //         console.debug({taskId});
                    //     //         return tasksManagerDomain.getProgress(taskId, ctx);
                    //     //     }
                    //     // }
                    // }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
