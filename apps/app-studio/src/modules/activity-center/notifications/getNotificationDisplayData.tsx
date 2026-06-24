import {KitButton, KitSpace, KitTooltip, KitTypography} from 'aristid-ds';
import {type IKitNotification} from 'aristid-ds/dist/Kit/Feedback/Notification/types';
import {type Notification} from './types';
import {NotificationLevel} from '_ui/_gqlTypes';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faCircleCheck,
    faCircleXmark,
    faDownload,
    faSpinner,
    faTimes,
    faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons';
import {type ReactNode} from 'react';
import {type TFunction} from 'i18next';
import {trackNotificationEvents} from '../../../services/analytics';
import {NOTIFICATION_CENTER_TRACKING_SOURCE} from '_ui/constants';

interface INotificationDisplayData {
    notificationType: IKitNotification['type'];
    notificationIcon?: IKitNotification['icon'];
    notificationRelativeTime: ReactNode;
    notificationArchiveButtons?: ReactNode;
    notificationDownloadButtons?: ReactNode;
}

const ONE_DAY_IN_SECONDS = 24 * 60 * 60;
const ONE_HOUR_IN_SECONDS = 60 * 60;
const ONE_MINUTE_IN_SECONDS = 60;
const TIME_SEPARATOR = ' • ';

const _getRelativeTimePhrase = (diffInSeconds: number, notificationDate: Date, t: TFunction, lang: string[]) => {
    const range =
        diffInSeconds < ONE_HOUR_IN_SECONDS ? 'minutes' : diffInSeconds < ONE_DAY_IN_SECONDS ? 'hours' : 'days';

    const timeStr = notificationDate.toLocaleTimeString(lang, {hour: '2-digit', minute: '2-digit', hour12: false});

    switch (range) {
        case 'minutes': {
            if (diffInSeconds < ONE_MINUTE_IN_SECONDS) {
                return `${t('activity_center.notifications.duration_less_than_minute')}${TIME_SEPARATOR}${timeStr}`;
            }
            const minutes = Math.floor(diffInSeconds / ONE_MINUTE_IN_SECONDS);
            return `${t('activity_center.notifications.duration_minutes', {minutes, count: minutes})}${TIME_SEPARATOR}${timeStr}`;
        }
        case 'hours': {
            const hours = Math.floor(diffInSeconds / ONE_HOUR_IN_SECONDS);
            return `${t('activity_center.notifications.duration_hours', {hours, count: hours})}${TIME_SEPARATOR}${timeStr}`;
        }
        case 'days': {
            const days = Math.floor(diffInSeconds / ONE_DAY_IN_SECONDS);
            return `${t('activity_center.notifications.duration_days', {days, count: days})}${TIME_SEPARATOR}${timeStr}`;
        }
    }
};

const _formatRelativeTime = (notificationTimestamp: number, t: TFunction, lang: string[]) => {
    const now = Math.floor(Date.now() / 1_000);
    const diffInSeconds = now - notificationTimestamp;
    const notificationDate = new Date(notificationTimestamp * 1_000);

    const relativeTimeText = _getRelativeTimePhrase(diffInSeconds, notificationDate, t, lang);
    const dateText = notificationDate.toLocaleString(lang, {dateStyle: 'short', timeStyle: 'short'});

    return (
        <KitTooltip title={dateText}>
            <KitTypography.Text size="fontSize7">{relativeTimeText}</KitTypography.Text>
        </KitTooltip>
    );
};

const _buildNotificationArchiveButtons = (
    notification: Notification,
    t: TFunction,
    onArchiveUserNotifications: (notifications: Notification[]) => void,
) => (
    <KitTooltip title={t('global.delete')}>
        <KitButton
            type="tertiary"
            size="s"
            icon={<FontAwesomeIcon icon={faTimes} />}
            aria-label={t('global.delete')}
            onClick={() => onArchiveUserNotifications([notification])}
        />
    </KitTooltip>
);

const _buildNotificationDownloadButtons = (notification: Notification, t: TFunction) => (
    <KitSpace direction="horizontal" size="xs">
        {notification.attachments?.map(attachment => (
            <KitButton
                key={attachment.url}
                type="secondary"
                size="m"
                onClick={() => {
                    if (attachment.trackingEvent) {
                        trackNotificationEvents([
                            {...attachment.trackingEvent, name: NOTIFICATION_CENTER_TRACKING_SOURCE},
                        ]);
                    }
                    window.open(attachment.url, '_blank');
                }}
                icon={<FontAwesomeIcon icon={faDownload} />}
            >
                {t('global.download')}
            </KitButton>
        ))}
        {notification.relatedEntities?.map(relatedEntity => (
            <KitButton
                key={relatedEntity.url}
                type="secondary"
                size="m"
                onClick={() => {
                    window.location.href = relatedEntity.url;
                }}
            >
                {relatedEntity.label ?? t('global.show')}
            </KitButton>
        ))}
    </KitSpace>
);

export const getNotificationDisplayData = ({
    notification,
    t,
    lang,
    onArchiveUserNotifications,
}: {
    notification: Notification;
    t: TFunction;
    lang: string[];
    onArchiveUserNotifications: (notifications: Notification[]) => void;
}): INotificationDisplayData => {
    const commonDisplayData = {
        notificationRelativeTime: _formatRelativeTime(notification.date, t, lang),
        notificationArchiveButtons: _buildNotificationArchiveButtons(notification, t, onArchiveUserNotifications),
        notificationDownloadButtons: _buildNotificationDownloadButtons(notification, t),
    };

    switch (notification.level) {
        case NotificationLevel.info:
            return {
                notificationType: 'info',
                notificationIcon: <FontAwesomeIcon icon={faSpinner} />,
                ...commonDisplayData,
            };
        case NotificationLevel.warning:
            return {
                notificationType: 'warning',
                notificationIcon: <FontAwesomeIcon icon={faTriangleExclamation} />,
                ...commonDisplayData,
            };
        case NotificationLevel.error:
            return {
                notificationType: 'error',
                notificationIcon: <FontAwesomeIcon icon={faCircleXmark} />,
                ...commonDisplayData,
            };
        case NotificationLevel.success:
            return {
                notificationType: 'success',
                notificationIcon: <FontAwesomeIcon icon={faCircleCheck} />,
                ...commonDisplayData,
            };
    }
};
