import {EventAction} from '@leav/utils';
import {IApplicationDomain} from 'domain/application/applicationDomain';
import {IAttributeDomain} from 'domain/attribute/attributeDomain';
import {ILibraryDomain} from 'domain/library/libraryDomain';
import {ILogDomain} from 'domain/log/logDomain';
import {ITreeDomain} from 'domain/tree/treeDomain';
import {IVersionProfileDomain} from 'domain/versionProfile/versionProfileDomain';
import {IAppGraphQLSchema} from '_types/graphql';
import {ILogFilters, ILogPagination, ILogSort, Log} from '_types/log';
import {IQueryInfos} from '_types/queryInfos';
import {USERS_LIBRARY} from '../../_types/library';

export interface ICoreLogApp {
    getGraphQLSchema(): IAppGraphQLSchema;
}

interface IDeps {
    'core.domain.log'?: ILogDomain;
    'core.domain.library'?: ILibraryDomain;
    'core.domain.attribute'?: IAttributeDomain;
    'core.domain.tree'?: ITreeDomain;
    'core.domain.versionProfile'?: IVersionProfileDomain;
    'core.domain.application'?: IApplicationDomain;
}

export default function({
    'core.domain.log': logDomain,
    'core.domain.library': libraryDomain,
    'core.domain.attribute': attributeDomain,
    'core.domain.tree': treeDomain,
    'core.domain.versionProfile': versionProfileDomain,
    'core.domain.application': applicationDomain
}: IDeps = {}): ICoreLogApp {
    return {
        getGraphQLSchema() {
            const baseSchema = {
                typeDefs: `
                    enum LogAction {
                        ${Object.keys(EventAction).join(' ')}
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

                    type Log {
                        time: Int!
                        user: User!
                        queryId: String!
                        instanceId: String!
                        trigger: String
                        action: LogAction
                        topic: LogTopic
                        before: Any
                        after: Any
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
                        action: LogAction,
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

                    extend type Query {
                        logs(filters: LogFilterInput, sort: LogSortInput, pagination: Pagination): [Log!]
                    }
                `,
                resolvers: {
                    Query: {
                        logs: async (
                            _,
                            args: {filters: ILogFilters; sort: ILogSort; pagination: ILogPagination},
                            ctx
                        ) => {
                            const {filters, sort, pagination} = args;

                            if (filters.time) {
                                filters.time.from = filters.time.from ? filters.time.from * 1000 : null;
                                filters.time.to = filters.time.to ? filters.time.to * 1000 : null;
                            }

                            return logDomain.getLogs({filters, sort, pagination}, ctx);
                        }
                    },
                    Log: {
                        user: async (log: Log, _, ctx: IQueryInfos) => {
                            return {
                                id: log.userId,
                                library: USERS_LIBRARY
                            };
                        },
                        time: (log: Log) => {
                            return Math.trunc(log.time / 1000);
                        }
                    },
                    LogTopic: {
                        record: async (topic: Log['topic'], _, ctx: IQueryInfos) => {
                            return topic.record
                                ? {
                                      id: topic.record.id,
                                      library: topic.record.libraryId
                                  }
                                : null;
                        },
                        library: async (topic: Log['topic'], _, ctx: IQueryInfos) => {
                            return topic.library ? libraryDomain.getLibraryProperties(topic.library, ctx) : null;
                        },
                        attribute: async (topic: Log['topic'], _, ctx: IQueryInfos) => {
                            return topic.attribute
                                ? attributeDomain.getAttributeProperties({id: topic.attribute, ctx})
                                : null;
                        },
                        tree: async (topic: Log['topic'], _, ctx: IQueryInfos) => {
                            return topic.tree ? treeDomain.getTreeProperties(topic.tree, ctx) : null;
                        },
                        profile: async (topic: Log['topic'], _, ctx: IQueryInfos) => {
                            return topic.profile
                                ? versionProfileDomain.getVersionProfileProperties({id: topic.profile, ctx})
                                : null;
                        },
                        permission: async (topic: Log['topic'], _, ctx: IQueryInfos) => {
                            return topic.permission
                                ? {
                                      type: topic.permission.type,
                                      applyTo: topic.permission.applyTo
                                  }
                                : null;
                        },
                        application: async (topic: Log['topic'], _, ctx: IQueryInfos) => {
                            return topic.application
                                ? applicationDomain.getApplicationProperties({id: topic.application, ctx})
                                : null;
                        }
                    }
                }
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        }
    };
}
