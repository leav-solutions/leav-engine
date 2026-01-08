// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {type INotification, type INotificationChannel, NotificationChannels} from '../../../_types/notification';
import {type IQueryInfos} from '_types/queryInfos';
import {type IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';
import {type IPubSubNotificationData, TriggerNames} from '../../../_types/eventsManager';

export interface INotificationByWebSocketChannelDeps {
    'core.domain.eventsManager': IEventsManagerDomain;
}

export default function ({
    'core.domain.eventsManager': eventsManagerDomain,
}: INotificationByWebSocketChannelDeps): INotificationChannel {
    return {
        type: NotificationChannels.WEB_SOCKET,

        async sendNotifications(notifications: INotification[], ctx: IQueryInfos): Promise<void> {
            await Promise.all(
                notifications.map(async notification => {
                    const title = notification.content.title;
                    try {
                        const taskId = notification.content.taskId;

                        logger.debug(
                            `Sending webSocket notification "${title}" ${taskId ? `for task "${taskId}"` : ''} to user ${notification.recipientUserId}`,
                        );
                        await eventsManagerDomain.sendPubSubEvent(
                            {
                                triggerName: TriggerNames.NOTIFICATION,
                                data: {
                                    notification: {
                                        ...notification.content,
                                        date: notification.date,
                                    },
                                    recipientUserIds: [notification.recipientUserId],
                                } satisfies IPubSubNotificationData,
                            },
                            ctx,
                        );
                    } catch (error) {
                        logger.error(
                            `Error sending webSocket notification "${title}" to user ${notification.recipientUserId}: ${error.message}`,
                        );
                    }
                }),
            );
        },
    };
}
