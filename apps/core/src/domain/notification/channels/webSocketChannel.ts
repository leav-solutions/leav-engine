import {logger} from '@leav/logger';
import {type INotification, type INotificationChannel, NotificationChannels} from '../../../_types/notification';
import {type IQueryInfos} from '../../../_types/queryInfos';
import {type IEventsManagerDomain} from '../../eventsManager/eventsManagerDomain';
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
                    const title = notification.title;
                    try {
                        const taskId = notification.taskId;

                        logger.debug(
                            `Sending webSocket notification "${title}" ${taskId ? `for task "${taskId}"` : ''} to user ${notification.userId}`,
                        );
                        await eventsManagerDomain.sendPubSubEvent(
                            {
                                triggerName: TriggerNames.NOTIFICATION,
                                data: {
                                    notification,
                                    recipientUserIds: [notification.userId],
                                } satisfies IPubSubNotificationData,
                            },
                            ctx,
                        );
                    } catch (error) {
                        logger.error(
                            `Error sending webSocket notification "${title}" to user ${notification.userId}: ${error.message}`,
                        );
                    }
                }),
            );
        },
    };
}
