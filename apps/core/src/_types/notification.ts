// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {type IQueryInfos} from './queryInfos';

export interface INotification extends Omit<ICoreEntity, 'label'>, INotificationContent, INotificationMetadata {
    /**
     * Timestamp of the notification creation in milliseconds since epoch
     */
    date: number;

    /**
     * User ID of the notification recipient
     */
    userId: string;

    taskId?: string;
}

export interface INotificationContent {
    level: 'success' | 'info' | 'warning' | 'error';
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

export interface INotificationMetadata {
    /**
     * Priority of the notification, may change which channel is used to send it (no yet implemented)
     */
    priority?: 'urgent' | 'normal';

    /**
     * Optional task ID associated with the notification
     * For email, will be added as a custom header (X-Task-Id)
     */
    taskId?: string;
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

    content: INotificationContent;

    metadata?: INotificationMetadata;

    /**
     * Channels to send the notification to (if not set, all channels will be used)
     */
    channels?: NotificationChannels[];
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
