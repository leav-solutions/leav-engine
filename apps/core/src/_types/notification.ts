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
        /**
         * Optional analytics event to emit when this attachment is opened (e.g. report downloaded).
         * The host app forwards it to its tracker on click.
         */
        trackingEvent?: INotificationTrackingEvent;
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

    /**
     * Generic analytics events to emit when this notification is consumed.
     * The host app forwards them to its tracker.
     */
    trackingEvents?: INotificationTrackingEvent[];
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

export interface INotificationTrackingEvent {
    category: string;
    action: string;
    name?: string;
    value?: number;
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
