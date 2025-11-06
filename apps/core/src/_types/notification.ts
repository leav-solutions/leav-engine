// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {type IQueryInfos} from './queryInfos';

export interface INotification {
    // May be add an id field later

    /**
     * Timestamp of the notification creation in milliseconds since epoch
     */
    date: number;

    /**
     * User ID of the notification recipient
     */
    recipientUserId: string;

    content: INotificationContent;
}

export interface INotificationContent {
    level: 'info' | 'warning';
    title: string;
    message: string;
    relatedEntities?: Array<{
        url: string;
        label: string;
    }>;
    attachments?: Array<{
        url: string;
        label: string;
    }>;
}

export interface ICreateNotification {
    emitterUserId: string;

    /**
     * Recipients of the notification, need at least one userId or groupId
     */
    recipients: {
        userIds: string[];

        /**
         * No implementation yet
         */
        groupIds: string[];
    };

    /**
     * Priority of the notification, may change which channel is used to send it (no yet implemented)
     */
    priority: 'urgent' | 'normal';

    content: INotificationContent;
}

export enum NotificationChannels {
    EMAIL = 'email',
    WEB_SOCKET = 'web_socket',
    // WEB_PUSH = 'web_push'
}

export interface INotificationChannel {
    type: NotificationChannels;
    sendNotifications(notifications: INotification[], ctx: IQueryInfos): Promise<void>;
}
