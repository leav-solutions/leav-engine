// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {logger} from '@leav/logger';
import {type INotification, type INotificationChannel, NotificationChannels} from '../../../_types/notification';
import {type IQueryInfos} from '_types/queryInfos';
import {type IEventsManagerDomain} from 'domain/eventsManager/eventsManagerDomain';

export interface INotificationByWebSocketChannelDeps {
    'core.domain.eventsManager': IEventsManagerDomain;
}

export default function ({
    'core.domain.eventsManager': eventsManagerDomain
}: INotificationByWebSocketChannelDeps): INotificationChannel {
    return {
        type: NotificationChannels.WEB_SOCKET,
        async sendNotifications(notifications: INotification[], ctx: IQueryInfos): Promise<void> {
            for (const notification of notifications) {
                logger.debug(
                    `Sending webSocket notification "${notification.content.title}" to ${notification.recipientUserId}`
                );
            }

            // eventsManagerDomain.sendPubSubEvent with new event type
            // notificationApp with Subscription on that event
        }
    };
}
