// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IApplicationDomain} from 'domain/application/applicationDomain';
import {type IAttributeDomain} from 'domain/attribute/attributeDomain';
import {type IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {type ILibraryDomain} from 'domain/library/libraryDomain';
import {type ILogDomain} from 'domain/log/logDomain';
import {type ITreeDomain} from 'domain/tree/treeDomain';
import {type IVersionProfileDomain} from 'domain/versionProfile/versionProfileDomain';
import {type ILogFilters, type ILogPagination, type ILogResponse, type ILogSort, type Log} from '_types/log';
import {type IQueryInfos} from '_types/queryInfos';
import {type IAppModule} from '_types/shared';
import {USERS_LIBRARY} from '../../_types/library';
import {type IGraphqlAppModule} from 'app/graphql/graphqlApp';
import {type IAppGraphQLSchema} from '_types/graphql';
import {EventAction} from '@leav/utils';
import {type IDBPayloadData} from '_types/events';
import {type IFormatLogValueHelper} from 'domain/value/helpers/formatLogValue';

export type ICoreLogApp = IAppModule & IGraphqlAppModule;

interface IDeps {
    'core.domain.log': ILogDomain;
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.domain.library': ILibraryDomain;
    'core.domain.attribute': IAttributeDomain;
    'core.domain.tree': ITreeDomain;
    'core.domain.value.helpers.formatLogValue': IFormatLogValueHelper;
    'core.domain.versionProfile': IVersionProfileDomain;
    'core.domain.application': IApplicationDomain;
}

export default function ({
    'core.domain.log': logDomain,
    'core.domain.eventsManager': eventsManagerDomain,
    'core.domain.library': libraryDomain,
    'core.domain.attribute': attributeDomain,
    'core.domain.tree': treeDomain,
    'core.domain.value.helpers.formatLogValue': formatLogValue,
    'core.domain.versionProfile': versionProfileDomain,
    'core.domain.application': applicationDomain
}: IDeps): ICoreLogApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    enum LogAction {
                        ${eventsManagerDomain.getActions().join('\n')}
                    }

                    type PermissionTopic {
                        type: String!,
                        applyTo: Any
                    }

                    type LogTopic {
                        record: Record
                        library: Library
                        attribute: Attribute
                        tree: Tree
                        profile: VersionProfile
                        permission: PermissionTopic
                        apiKey: String
                        application: Application
                        filename: String
                    }

                    type LogData {
                        raw: Any
                        asString: String
                    }

                    type Log {
                        time: Int!
                        user: Record!
                        queryId: String!
                        instanceId: String!
                        trigger: String
                        action: LogAction
                        topic: LogTopic
                        before: LogData
                        after: LogData
                        metadata: Any
                    }

                    input LogFilterTimeInput {
                        from: Int,
                        to: Int
                    }

                    input LogTopicRecordFilterInput {
                        id: String,
                        libraryId: String
                    }

                    input LogTopicPermissionFilterInput {
                        type: String,
                        applyTo: String
                    }

                    input LogTopicFilterInput {
                        record: LogTopicRecordFilterInput,
                        library: String,
                        attribute: String,
                        tree: String,
                        profile: String,
                        permission: LogTopicPermissionFilterInput,
                        apiKey: String,
                        filename: String
                    }

                    input LogFilterInput {
                        topic: LogTopicFilterInput,
                        actions: [LogAction!],
                        userId: String,
                        time: LogFilterTimeInput,
                        queryId: String,
                        instanceId: String,
                        trigger: String
                    }

                    enum LogSortableField {
                        time
                        action
                        queryId
                        instanceId
                        trigger
                        userId
                    }

                    input LogSortInput {
                        field: LogSortableField!,
                        order: SortOrder!
                    }

                    type Logs {
                        logs: [Log!]!
                        total: Int!
                    }

                    extend type Query {
                        logs(filters: LogFilterInput, sort: LogSortInput, pagination: Pagination): Logs
                    }
                `,
                resolvers: {
                    Query: {
                        logs: async (
                            _,
                            args: {filters: ILogFilters; sort: ILogSort; pagination: ILogPagination},
                            ctx: IQueryInfos
                        ): Promise<ILogResponse> => {
                            const {filters, sort, pagination} = args;

                            if (filters?.time?.from) {
                                filters.time.from = filters.time.from * 1_000;
                            }
                            if (filters?.time?.to) {
                                filters.time.to = filters.time.to * 1_000;
                            }

                            return logDomain.getLogs({filters, sort, pagination}, ctx);
                        }
                    },
                    Log: {
                        user: async (log: Log, _, ctx: IQueryInfos) => ({
                            id: log.userId,
                            library: USERS_LIBRARY
                        }),
                        time: (log: Log) => Math.trunc(log.time / 1000),
                        before: (log: Log): ILogData => (log.before ? {...log, rawData: log.before} : null),
                        after: (log: Log): ILogData => (log.after ? {...log, rawData: log.after} : null)
                    },
                    LogTopic: {
                        record: async (topic: Log['topic'], _, ctx: IQueryInfos) =>
                            topic.record
                                ? {
                                      id: topic.record.id,
                                      library: topic.record.libraryId
                                  }
                                : null,
                        library: async (topic: Log['topic'], _, ctx: IQueryInfos) =>
                            topic.library ? libraryDomain.getLibraryProperties(topic.library, ctx) : null,
                        attribute: async (topic: Log['topic'], _, ctx: IQueryInfos) =>
                            topic.attribute
                                ? attributeDomain.getAttributeProperties({id: topic.attribute, ctx}).catch(() => null)
                                : null,
                        tree: async (topic: Log['topic'], _, ctx: IQueryInfos) =>
                            topic.tree ? treeDomain.getTreeProperties(topic.tree, ctx) : null,
                        profile: async (topic: Log['topic'], _, ctx: IQueryInfos) =>
                            topic.profile
                                ? versionProfileDomain.getVersionProfileProperties({id: topic.profile, ctx})
                                : null,
                        permission: async (topic: Log['topic'], _, ctx: IQueryInfos) =>
                            topic.permission
                                ? {
                                      type: topic.permission.type,
                                      applyTo: topic.permission.applyTo
                                  }
                                : null,
                        application: async (topic: Log['topic'], _, ctx: IQueryInfos) =>
                            topic.application
                                ? applicationDomain.getApplicationProperties({id: topic.application, ctx})
                                : null
                    },
                    LogData: {
                        raw: (logData: ILogData) => logData.rawData || null,
                        asString: async (log: ILogData, _, ctx: IQueryInfos): Promise<string | null> => {
                            const rawData = log.rawData;
                            if (rawData == null) {
                                return null;
                            }
                            switch (log.action) {
                                case EventAction.VALUE_SAVE:
                                case EventAction.VALUE_DELETE:
                                    return formatLogValue.formatAsString(
                                        log,
                                        rawData as IDBPayloadData<EventAction.VALUE_DELETE | EventAction.VALUE_SAVE>,
                                        ctx
                                    );
                                default:
                                    return null;
                            }
                        }
                    }
                }
            };

            return {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};
        }
    };
}

interface ILogData extends Log {
    rawData: any;
}
