// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {type IConfig} from '_types/config';
import {
    type INotificationChannel,
    type ICreateNotification,
    type NotificationChannels,
    type INotification,
} from '_types/notification';
import {type IQueryInfos} from '_types/queryInfos';
import dayjs from 'dayjs';
import {
    type INotificationFilterOptionsInRepo,
    type ICreateNotificationInRepo,
    type INotificationRepo,
} from '../../infra/notification/notificationRepo';
import {type IList} from '../../_types/list';

export interface INotificationDomain {
    createNotification(notification: ICreateNotification, ctx: IQueryInfos): Promise<INotification[]>;
    getNotifications(ctx: IQueryInfos): Promise<IList<INotification>>;
    deleteAllNotifications(ctx: IQueryInfos): Promise<INotification[]>;
    deleteNotification(notificationId: string, ctx: IQueryInfos): Promise<INotification>;
}

export interface INotificationDomainDeps {
    'core.domain.notification.emailChannel': INotificationChannel;
    'core.domain.notification.webSocketChannel': INotificationChannel;
    'core.infra.notification': INotificationRepo;
    config: IConfig;
}

export default function ({
    'core.domain.notification.emailChannel': emailChannel,
    'core.domain.notification.webSocketChannel': webSocketChannel,
    'core.infra.notification': notificationRepo,
    config,
}: INotificationDomainDeps): INotificationDomain {
    if (config.notification.enable === false) {
        return notificationsDisabled();
    }

    const enabledChannels: INotificationChannel[] = [
        ...((config.notification.email.enable && [emailChannel]) || []),
        ...((config.notification.webSocket.enable && [webSocketChannel]) || []),
    ];
    const defaultChannelsType = enabledChannels.map(c => c.type);

    logger.verbose(`Notification system enabled with channels: ${enabledChannels.map(c => c.type).join(', ')}`);

    const sendNotificationsViaChannels = (
        notifications: INotification[],
        filterChannelsType: NotificationChannels[],
        ctx: IQueryInfos,
    ): Promise<void[]> =>
        Promise.all(
            enabledChannels
                .filter(channel => filterChannelsType.includes(channel.type))
                .map(async channel => {
                    try {
                        await channel.sendNotifications(notifications, ctx);
                    } catch (error) {
                        logger.error(
                            `Error sending ${notifications.length} notifications via channel ${channel.type}: ${error.message}`,
                        );
                    }
                }),
        );

    return {
        async createNotification(notification: ICreateNotification, ctx: IQueryInfos): Promise<INotification[]> {
            try {
                if (notification.recipients.userIds.length === 0 && notification.recipients.groupIds.length === 0) {
                    throw new Error('No recipients specified for the notification');
                }
                if (notification.recipients.groupIds.length > 0) {
                    throw new Error('Group recipients are not implemented yet');
                }
                logger.debug(
                    `Creating notification "${notification.content.title}" to users ${notification.recipients.userIds.join(', ')} from user ${notification.emitterUserId}:
- Message: ${notification.content.message}
- Related entities: ${
                        notification.content.relatedEntities && notification.content.relatedEntities.length > 0
                            ? notification.content.relatedEntities.map(e => `${e.label} (${e.url})`).join(', ')
                            : 'No related entities'
                    }
- Attachments: ${
                        notification.content.attachments && notification.content.attachments.length > 0
                            ? notification.content.attachments.map(a => `${a.label} (${a.url})`).join(', ')
                            : 'No attachments'
                    }`,
                );

                const notificationsToCreate: ICreateNotificationInRepo[] = notification.recipients.userIds.map(
                    userId => ({
                        date: dayjs().unix(),
                        userId,
                        displayDuration: notification.displayDuration,
                        taskId: notification.taskId,
                        ...notification.content,
                    }),
                );

                const createdNotifications = await Promise.all(
                    notificationsToCreate.map(n => notificationRepo.createNotification(n, ctx)),
                );

                await sendNotificationsViaChannels(
                    createdNotifications,
                    notification.channels || defaultChannelsType,
                    ctx,
                );

                return createdNotifications;
            } catch (error) {
                logger.error(`Error creating notification: ${error.message}`);
                return [];
            }
        },
        async getNotifications(ctx: IQueryInfos): Promise<IList<INotification>> {
            const filters: INotificationFilterOptionsInRepo = {
                userId: ctx.userId,
            };

            return notificationRepo.getNotifications(
                {
                    filters,
                    withCount: true,
                },
                ctx,
            );
        },
        async deleteAllNotifications(ctx: IQueryInfos): Promise<INotification[]> {
            return notificationRepo.deleteNotificationsByRecipientUserId(ctx.userId, ctx);
        },
        async deleteNotification(notificationId: string, ctx: IQueryInfos): Promise<INotification> {
            const notification = (await notificationRepo.getNotifications({filters: {id: notificationId}}, ctx))
                .list[0];

            if (!notification) {
                throw new Error(`Notification with ID ${notificationId} not found`);
            } else if (notification.userId !== ctx.userId) {
                throw new Error(`User ${ctx.userId} is not authorized to delete notification ${notificationId}`);
            }

            return notificationRepo.deleteNotificationById(notificationId, ctx);
        },
    };
}

function notificationsDisabled(): INotificationDomain {
    logger.verbose('Notification system is disabled in the configuration.');

    return {
        async createNotification(): Promise<INotification[]> {
            logger.silly('Notification system is disabled. Skipping notification creation.');
            return [];
        },
        async getNotifications(): Promise<IList<INotification>> {
            logger.silly('Notification system is disabled. Skipping notification retrieval.');
            return {totalCount: 0, list: []};
        },
        async deleteNotification(): Promise<INotification> {
            logger.silly('Notification system is disabled. Skipping notification deletion.');
            return null;
        },
        async deleteAllNotifications(): Promise<INotification[]> {
            logger.silly('Notification system is disabled. Skipping notifications deletion.');
            return [];
        },
    };
}
