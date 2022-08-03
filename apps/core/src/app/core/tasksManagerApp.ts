// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITasksManagerDomain} from 'domain/tasksManager/tasksManagerDomain';
import winston from 'winston';
import {IConfig} from '_types/config';
import {IAppGraphQLSchema} from '_types/graphql';
import {eTaskStatus, ITask} from '_types/tasksManager';
import {IPaginationParams, ISortParams, IList} from '_types/list';
import {IQueryInfos} from '_types/queryInfos';
import {IUtils} from 'utils/utils';
// import {AttributeCondition, IRecord} from '../../_types/record';
import {IRecordDomain} from 'domain/record/recordDomain';
import {AwilixContainer} from 'awilix';
// import {USERS_LIBRARY} from '../../_types/library';

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
}

export interface IGetTasksArgs {
    filters?: ICoreEntityFilterOptions & {
        status: eTaskStatus;
    };
    pagination?: IPaginationParams;
    sort?: ISortParams;
}

export default function ({
    'core.domain.tasksManager': tasksManagerDomain = null
}: // 'core.utils.logger': logger = null,
// 'core.domain.record': recordDomain = null,
// 'core.utils': utils = null,
// config = null
IDeps): ITasksManagerApp {
    return {
        init: tasksManagerDomain.init,
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    type Task {
                        id: ID!,
                        modified_at: Int,
                        created_at: Int,
                        modified_by: User,
                        created_by: User,
                        moduleName: String,
                        funcName: String,
                        funcArgs: String,
                        startAt: Int,
                        status: TaskStatus,
                        progress: Int,
                        startedAt: Int,
                        completedAt: Int,
                        links: [String]
                    }

                    type TasksList {
                        totalCount: Int!
                        list: [Task!]!
                    }

                    enum TaskStatus {
                        WAITING
                        IN_PROGRESS
                        DONE
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
                `,
                resolvers: {
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
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
