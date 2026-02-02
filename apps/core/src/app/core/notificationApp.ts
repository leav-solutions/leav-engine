// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type PublishedEvent} from '@leav/utils';
import {type IAppGraphQLSchema} from '_types/graphql';
import {type IGraphqlAppModule} from 'app/graphql/graphqlApp';
import {type IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {withFilter} from 'graphql-subscriptions';
import {type IUtils} from 'utils/utils';
import {type IPubSubNotificationData, TriggerNames} from '../../_types/eventsManager';
import {type IQueryInfos} from '_types/queryInfos';

export type INotificationApp = IGraphqlAppModule;

interface IDeps {
    'core.utils'?: IUtils;
    'core.domain.eventsManager'?: IEventsManagerDomain;
}

export default function ({'core.domain.eventsManager': eventsManager = null}: IDeps): INotificationApp {
    return {
        async getGraphQLSchema(): Promise<IAppGraphQLSchema> {
            const baseSchema = {
                typeDefs: `
                    enum NotificationLevel {
                        success
                        info
                        warning
                        error
                    }

                    type TaskLink {
                        name: String!,
                        url: String!
                    }

                    type RelatedEntity {
                        url: String!,
                        label: String!
                    }

                    type Attachment {
                        url: String!,
                        label: String!
                    }

                    type Notification {
                        level: NotificationLevel!,
                        title: String!,
                        message: String!,
                        displayDuration: Int,
                        relatedEntities: [RelatedEntity!],
                        attachments: [Attachment!],
                        date: Int!
                        taskId: ID
                    }

                    type Subscription {
                        notification: Notification!
                    }
                `,
                resolvers: {
                    Subscription: {
                        notification: {
                            subscribe: withFilter(
                                () => eventsManager.subscribe([TriggerNames.NOTIFICATION]),
                                (payload: PublishedEvent<IPubSubNotificationData>, _, ctx: IQueryInfos) => {
                                    if (payload.recipientUserIds.includes(ctx.userId)) {
                                        return true;
                                    }

                                    return false;
                                },
                            ),
                        },
                    },
                },
            };

            const fullSchema = {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};

            return fullSchema;
        },
    };
}
