// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type IApplicationDomain} from '../../domain/application/applicationDomain';
import {type IAttributeDomain} from '../../domain/attribute/attributeDomain';
import {type IEventsManagerDomain} from '../../domain/eventsManager/eventsManagerDomain';
import {type ILibraryDomain} from '../../domain/library/libraryDomain';
import {type ILogDomain} from '../../domain/log/logDomain';
import {type ITreeDomain} from '../../domain/tree/treeDomain';
import {type IVersionProfileDomain} from '../../domain/versionProfile/versionProfileDomain';
import {type ILogFilters, type ILogPagination, type ILogResponse, type ILogSort, type Log} from '../../_types/log';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IAppModule} from '../../_types/shared';
import {USERS_LIBRARY} from '../../_types/library';
import {type IGraphqlAppModule} from '../graphql/graphqlApp';
import {type IAppGraphQLSchema} from '../../_types/graphql';
import {EventAction} from '@leav/utils';
import {type IDBPayloadData} from '../../_types/events';
import {type IFormatLogValueHelper} from '../../domain/value/helpers/formatLogValue';
import {AttributeCondition} from '../../_types/record';
import {type i18n} from 'i18next';
import {type IRecordDomain} from '../../domain/record/recordDomain';
import {AttributeTypes} from '../../_types/attribute';
import {type IConfig} from '../../_types/config';

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
    'core.domain.record': IRecordDomain;
    translator: i18n;
    config: IConfig;
}

export default function ({
    'core.domain.log': logDomain,
    'core.domain.eventsManager': eventsManagerDomain,
    'core.domain.library': libraryDomain,
    'core.domain.attribute': attributeDomain,
    'core.domain.tree': treeDomain,
    'core.domain.value.helpers.formatLogValue': formatLogValue,
    'core.domain.versionProfile': versionProfileDomain,
    'core.domain.application': applicationDomain,
    'core.domain.record': recordDomain,
    translator,
    config,
}: IDeps): ICoreLogApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const toSystemTranslation = (key: string, id: string) =>
                Object.fromEntries(config.lang.available.map(lang => [lang, translator.t(key, {lng: lang, id})]));

            const baseSchema = {
                typeDefs: `
                    enum LogAction {
                        ${eventsManagerDomain.getActions().join('\n')}
                    }

                    type PermissionTopic {
                        type: String!,
                        applyTo: Any
                    }

                    type LogUnknownEntity {
                        id: ID!
                        label: SystemTranslation
                    }

                    type LogUnknownStringEntity {
                        id: String!
                        label: SystemTranslation
                    }

                    type LogUnknownApplicationEntity {
                        id: ID!
                        label: SystemTranslation!
                    }

                    union LogRecord = Record | LogUnknownEntity
                    union LogUser = Record | LogUnknownEntity
                    union LogLibrary = Library | LogUnknownEntity
                    union LogAttribute = StandardAttribute | LinkAttribute | TreeAttribute | LogUnknownEntity
                    union LogTree = Tree | LogUnknownEntity
                    union LogVersionProfile = VersionProfile | LogUnknownStringEntity
                    union LogApplication = Application | LogUnknownApplicationEntity

                    type LogTopic {
                        record: LogRecord
                        library: LogLibrary
                        attribute: LogAttribute
                        tree: LogTree
                        profile: LogVersionProfile
                        permission: PermissionTopic
                        apiKey: String
                        application: LogApplication
                        filename: String
                    }

                    type LogData {
                        raw: Any
                        asString: String
                    }

                    type Log {
                        time: Int!
                        user: LogUser!
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
                            ctx: IQueryInfos,
                        ): Promise<ILogResponse> => {
                            const {filters, sort, pagination} = args;

                            if (filters?.time?.from) {
                                filters.time.from = filters.time.from * 1_000;
                            }
                            if (filters?.time?.to) {
                                filters.time.to = filters.time.to * 1_000;
                            }

                            return logDomain.getLogs({filters, sort, pagination}, ctx);
                        },
                    },
                    Log: {
                        user: async (log: Log, _, ctx: IQueryInfos) => {
                            try {
                                const result = await recordDomain.find({
                                    params: {
                                        filters: [
                                            {
                                                field: 'id',
                                                value: log.userId,
                                                condition: AttributeCondition.EQUAL,
                                            },
                                        ],
                                        library: USERS_LIBRARY,
                                        retrieveInactive: true,
                                    },
                                    ctx,
                                });

                                if (result.list.length === 0) {
                                    return {
                                        _isUnknown: true,
                                        id: log.userId,
                                        label: toSystemTranslation('logs.unknown_user', log.userId),
                                    };
                                }

                                return result.list[0];
                            } catch (error) {
                                return {
                                    _isUnknown: true,
                                    id: log.userId,
                                    label: toSystemTranslation('logs.unknown_user', log.userId),
                                };
                            }
                        },
                        time: (log: Log) => Math.trunc(log.time / 1000),
                        before: (log: Log): ILogData => (log.before ? {...log, rawData: log.before} : null),
                        after: (log: Log): ILogData => (log.after ? {...log, rawData: log.after} : null),
                    },
                    LogUnknownEntity: {
                        __isTypeOf: (obj: {_isUnknown?: boolean}) => obj._isUnknown === true,
                    },
                    LogUnknownStringEntity: {
                        __isTypeOf: (obj: {_isUnknown?: boolean}) => obj._isUnknown === true,
                    },
                    LogUnknownApplicationEntity: {
                        __isTypeOf: (obj: {_isUnknown?: boolean}) => obj._isUnknown === true,
                    },
                    LogRecord: {
                        __resolveType: (obj: {_isUnknown?: boolean}) =>
                            obj._isUnknown ? 'LogUnknownEntity' : 'Record',
                    },
                    LogUser: {
                        __resolveType: (obj: {_isUnknown?: boolean}) =>
                            obj._isUnknown ? 'LogUnknownEntity' : 'Record',
                    },
                    LogLibrary: {
                        __resolveType: (obj: {_isUnknown?: boolean}) =>
                            obj._isUnknown ? 'LogUnknownEntity' : 'Library',
                    },
                    LogAttribute: {
                        __resolveType: (obj: {_isUnknown?: boolean; type?: AttributeTypes}) => {
                            if (obj._isUnknown) {
                                return 'LogUnknownEntity';
                            }
                            switch (obj.type) {
                                case AttributeTypes.SIMPLE_LINK:
                                case AttributeTypes.ADVANCED_LINK:
                                    return 'LinkAttribute';
                                case AttributeTypes.TREE:
                                    return 'TreeAttribute';
                                default:
                                    return 'StandardAttribute';
                            }
                        },
                    },
                    LogTree: {
                        __resolveType: (obj: {_isUnknown?: boolean}) => (obj._isUnknown ? 'LogUnknownEntity' : 'Tree'),
                    },
                    LogVersionProfile: {
                        __resolveType: (obj: {_isUnknown?: boolean}) =>
                            obj._isUnknown ? 'LogUnknownStringEntity' : 'VersionProfile',
                    },
                    LogApplication: {
                        __resolveType: (obj: {_isUnknown?: boolean}) =>
                            obj._isUnknown ? 'LogUnknownApplicationEntity' : 'Application',
                    },
                    LogTopic: {
                        record: async (topic: Log['topic'], _, ctx: IQueryInfos) => {
                            if (!topic.record) {
                                return null;
                            }

                            try {
                                const result = await recordDomain.find({
                                    params: {
                                        filters: [
                                            {
                                                field: 'id',
                                                value: topic.record.id,
                                                condition: AttributeCondition.EQUAL,
                                            },
                                        ],
                                        library: topic.record.libraryId,
                                        retrieveInactive: true,
                                    },
                                    ctx,
                                });

                                if (result.list.length === 0) {
                                    return {
                                        _isUnknown: true,
                                        id: topic.record.id,
                                        label: toSystemTranslation('logs.unknown_record', topic.record.id),
                                    };
                                }

                                return result.list[0];
                            } catch (error) {
                                return {
                                    _isUnknown: true,
                                    id: topic.record.id,
                                    label: toSystemTranslation('logs.unknown_record', topic.record.id),
                                };
                            }
                        },
                        library: async (topic: Log['topic'], _, ctx: IQueryInfos) => {
                            if (!topic.library) {
                                return null;
                            }
                            try {
                                const result = await libraryDomain.getLibraryProperties(topic.library, ctx);
                                return result;
                            } catch (error) {
                                return {
                                    _isUnknown: true,
                                    id: topic.library,
                                    label: toSystemTranslation('logs.unknown_library', topic.library),
                                };
                            }
                        },
                        attribute: async (topic: Log['topic'], _, ctx: IQueryInfos) => {
                            if (!topic.attribute) {
                                return null;
                            }
                            try {
                                const result = await attributeDomain.getAttributeProperties({id: topic.attribute, ctx});
                                return result;
                            } catch (error) {
                                return {
                                    _isUnknown: true,
                                    id: topic.attribute,
                                    label: toSystemTranslation('logs.unknown_attribute', topic.attribute),
                                };
                            }
                        },
                        tree: async (topic: Log['topic'], _, ctx: IQueryInfos) => {
                            if (!topic.tree) {
                                return null;
                            }
                            try {
                                const result = await treeDomain.getTreeProperties(topic.tree, ctx);
                                return result;
                            } catch (error) {
                                return {
                                    _isUnknown: true,
                                    id: topic.tree,
                                    label: toSystemTranslation('logs.unknown_tree', topic.tree),
                                };
                            }
                        },
                        profile: async (topic: Log['topic'], _, ctx: IQueryInfos) => {
                            if (!topic.profile) {
                                return null;
                            }
                            try {
                                const result = await versionProfileDomain.getVersionProfileProperties({
                                    id: topic.profile,
                                    ctx,
                                });
                                return result;
                            } catch (error) {
                                return {
                                    _isUnknown: true,
                                    id: topic.profile,
                                    label: toSystemTranslation('logs.unknown_version_profile', topic.profile),
                                };
                            }
                        },
                        permission: async (topic: Log['topic'], _, ctx: IQueryInfos) =>
                            topic.permission
                                ? {
                                      type: topic.permission.type,
                                      applyTo: topic.permission.applyTo,
                                  }
                                : null,
                        application: async (topic: Log['topic'], _, ctx: IQueryInfos) => {
                            if (!topic.application) {
                                return null;
                            }
                            try {
                                const result = await applicationDomain.getApplicationProperties({
                                    id: topic.application,
                                    ctx,
                                });
                                return (
                                    result ?? {
                                        _isUnknown: true,
                                        id: topic.application,
                                        label: toSystemTranslation('logs.unknown_application', topic.application),
                                    }
                                );
                            } catch (error) {
                                return {
                                    _isUnknown: true,
                                    id: topic.application,
                                    label: toSystemTranslation('logs.unknown_application', topic.application),
                                };
                            }
                        },
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
                                        ctx,
                                    );
                                default:
                                    return null;
                            }
                        },
                    },
                },
            };

            return {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};
        },
    };
}

interface ILogData extends Log {
    rawData: any;
}
