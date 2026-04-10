// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type InitQueryContextFunc} from '../helpers/initQueryContext';
import {type IEventsManagerDomain} from '../../domain/eventsManager/eventsManagerDomain';
import {type IConfig} from '../../_types/config';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IAppModule} from '../../_types/shared';
import {type IAppGraphQLSchema} from '../../_types/graphql';
import {type IGraphqlAppModule} from '../graphql/graphqlApp';

export type IEventsManagerApp = IAppModule & IGraphqlAppModule;

interface IDeps {
    'core.domain.eventsManager': IEventsManagerDomain;
    'core.app.helpers.initQueryContext': InitQueryContextFunc;
    config: IConfig;
}

export default function ({
    'core.app.helpers.initQueryContext': initQueryContext,
    'core.domain.eventsManager': eventsManagerDomain,
    config,
}: IDeps): IEventsManagerApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            return {
                typeDefs: `
                    enum EventAction {
                        ${eventsManagerDomain.getActions().join('\n')}
                    }
                    
                    input EventTopicRecordInput {
                        id: String!
                        libraryId: String!
                    }
                    
                    type EventTopicRecord {
                        id: String!
                        libraryId: String!
                    }
                    
                    input EventTopicPermissionInput {
                        id: String!
                        applyTo: String
                    }
                    
                    type EventTopicPermission {
                        id: String!
                        applyTo: String
                    }
                    
                    input EventTopicInput {
                        record: EventTopicRecordInput
                        library: String
                        attribute: String
                        tree: String
                        profile: String
                        permission: EventTopicPermissionInput
                        automationRule: String
                        apiKey: String
                        application: String
                        filename: String
                    }

                    type EventTopic {
                        record: EventTopicRecord
                        library: String
                        attribute: String
                        tree: String
                        profile: String
                        permission: EventTopicPermission
                        automationRule: String
                        apiKey: String
                        application: String
                        filename: String
                    }
                `,
                resolvers: {},
            };
        },
        extensionPoints: {
            registerEventActions(actions: string[], prefix: string) {
                const ctx: IQueryInfos = {
                    ...initQueryContext(),
                    userId: config.defaultUserId,
                    lang: config.lang.default,
                };

                eventsManagerDomain.registerEventActions(actions, prefix, ctx);
            },
        },
    };
}
