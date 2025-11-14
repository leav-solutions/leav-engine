// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {type IConfig} from '_types/config';
import {type INotificationChannel, type ICreateNotification, type INotification} from '_types/notification';
import {type IQueryInfos} from '_types/queryInfos';
import dayjs from 'dayjs';

export interface INotificationDomain {
    createNotification(notification: ICreateNotification, ctx: IQueryInfos): Promise<void>;
}

export interface INotificationDomainDeps {
    'core.domain.notification.emailChannel': INotificationChannel;
    'core.domain.notification.webSocketChannel': INotificationChannel;
    config: IConfig;
}

export default function ({
    'core.domain.notification.emailChannel': emailChannel,
    'core.domain.notification.webSocketChannel': webSocketChannel,
    config,
}: INotificationDomainDeps): INotificationDomain {
    if (config.notification.enable === false) {
        return notificationsDisabled();
    }

    const channels: INotificationChannel[] = [
        ...((config.notification.email.enable && [emailChannel]) || []),
        ...((config.notification.webSocket.enable && [webSocketChannel]) || []),
    ];

    logger.verbose(`Notification system enabled with channels: ${channels.map(c => c.type).join(', ')}`);

    const sendNotificationsViaChannels = (notifications: INotification[], ctx: IQueryInfos): Promise<void[]> =>
        Promise.all(
            channels.map(async channel => {
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
        async createNotification(notification: ICreateNotification, ctx: IQueryInfos): Promise<void> {
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

                const notifications: INotification[] = notification.recipients.userIds.map(userId => ({
                    date: dayjs().unix(),
                    recipientUserId: userId,
                    content: notification.content,
                }));

                // save notifications to the database

                await sendNotificationsViaChannels(notifications, ctx);
            } catch (error) {
                logger.error(`Error creating notification: ${error.message}`);
            }
        },
    };
}

function notificationsDisabled(): INotificationDomain {
    logger.verbose('Notification system is disabled in the configuration.');
    return {
        async createNotification(): Promise<void> {
            logger.silly('Notification system is disabled. Skipping notification creation.');
        },
    };
}
