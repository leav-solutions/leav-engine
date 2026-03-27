// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type PublishedEvent} from '@leav/utils';
import {type IAppGraphQLSchema} from '../../_types/graphql';
import {type IGraphqlAppModule} from '../graphql/graphqlApp';
import {type IEventsManagerDomain} from '../../domain/eventsManager/eventsManagerDomain';
import {withFilter} from 'graphql-subscriptions';
import {type IUtils} from '../../utils/utils';
import {type IPubSubNotificationData, TriggerNames} from '../../_types/eventsManager';
import {type IQueryInfos} from '../../_types/queryInfos';
import {type IList} from '../../_types/list';
import {type INotification} from '../../_types/notification';
import {type INotificationDomain} from '../../domain/notification/notificationDomain';

export type INotificationApp = IGraphqlAppModule;

interface IDeps {
    'core.utils'?: IUtils;
    'core.domain.eventsManager'?: IEventsManagerDomain;
    'core.domain.notification'?: INotificationDomain;
}

export default function ({
    'core.domain.eventsManager': eventsManager = null,
    'core.domain.notification': notificationDomain = null,
}: IDeps): INotificationApp {
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
                   
                   type NotificationsList {
                        totalCount: Int!
                        list: [Notification!]!
                    }
                         
                    type Notification {
                        id: ID!,
                        date: Int!,
                        level: NotificationLevel!,
                        title: String!,
                        message: String!,
                        relatedEntities: [RelatedEntity!],
                        attachments: [Attachment!],
                        taskId: ID
                    }

                    extend type Query {
                        notifications: NotificationsList!
                    }

                    extend type Mutation {
                        deleteNotification(notificationId: ID!): Notification!
                        deleteAllNotifications: [Notification!]!
                    }

                    type Subscription {
                        notification: Notification!
                    }
                `,
                resolvers: {
                    Query: {
                        notifications: (_: never, _args: never, ctx: IQueryInfos): Promise<IList<INotification>> =>
                            notificationDomain.getNotifications(ctx),
                    },
                    Mutation: {
                        deleteAllNotifications: (_: never, _args: never, ctx: IQueryInfos): Promise<INotification[]> =>
                            notificationDomain.deleteAllNotifications(ctx),
                        deleteNotification: (
                            _: never,
                            args: {notificationId: string},
                            ctx: IQueryInfos,
                        ): Promise<INotification> => notificationDomain.deleteNotification(args.notificationId, ctx),
                    },
                    Subscription: {
                        notification: {
                            subscribe: withFilter(
                                () => eventsManager.subscribe([TriggerNames.NOTIFICATION]),
                                (payload: PublishedEvent<IPubSubNotificationData>, _, ctx: IQueryInfos) =>
                                    payload.recipientUserIds.includes(ctx.userId),
                            ),
                        },
                    },
                },
            };

            return {typeDefs: baseSchema.typeDefs, resolvers: baseSchema.resolvers};
        },
    };
}
