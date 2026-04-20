// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitButton, KitEmpty, KitLoader, KitNotification, KitSpace} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {
    activityCenterTabEmptyContent,
    activityCenterTabContent,
    activityCenterTabFooter,
} from '../activityCenter.module.css';
import {useGetUserNotifications} from './get-user-notifications/useGetUserNotifications';
import {getNotificationDisplayData} from './getNotificationDisplayData';
import {useConfirmModal, useLang} from '_ui/hooks';
import {type Notification} from './types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {ERROR_NOTIFICATION_DURATION, BREAK_TWO_LINES} from '_ui/constants';
import {useDeleteUserNotifications} from './delete-user-notifications/useDeleteUserNotifications';

export const NotificationsList = () => {
    const {userNotifications, loading, error, removeNotifications} = useGetUserNotifications();
    const {deleteUserNotifications} = useDeleteUserNotifications();

    const {t} = useTranslation();
    const {lang} = useLang();
    const {openConfirmModal} = useConfirmModal();
    const userHasNotifications = userNotifications?.length > 0;
    const userHasMultipleNotifications = userNotifications?.length > 1;

    if (loading) {
        return (
            <div data-testid="notifications-loader" className={activityCenterTabEmptyContent}>
                <KitLoader />
            </div>
        );
    }

    if (error) {
        return (
            <KitEmpty
                className={activityCenterTabEmptyContent}
                image={KitEmpty.ASSET_TASKS_ERROR}
                title={t('error.title')}
                description={t('error.description')}
            />
        );
    }

    if (!userHasNotifications) {
        return (
            <KitEmpty
                className={activityCenterTabEmptyContent}
                image={KitEmpty.ASSET_LIST}
                description={t('activity_center.notifications.no_notifications')}
            />
        );
    }

    const onArchiveUserNotifications = async (notifications: Notification[]) => {
        openConfirmModal({
            title: t('activity_center.notifications.delete_notification', {count: notifications?.length}),
            content:
                t('activity_center.notifications.delete_notification_description', {count: notifications?.length}) +
                BREAK_TWO_LINES +
                t('global.are_you_sure'),
            onOk: async () => {
                try {
                    await deleteUserNotifications(notifications);
                    // Notifications will be removed from userNotifications list
                    removeNotifications(notifications.map(notification => notification.id));
                } catch {
                    KitNotification.error({
                        message: t('error.title'),
                        description: t('error.description'),
                        duration: ERROR_NOTIFICATION_DURATION,
                        closable: true,
                    });
                }
            },
        });
    };

    return (
        <>
            <KitSpace className={activityCenterTabContent} direction="vertical" size="s">
                {userNotifications?.map(notification => {
                    const {
                        notificationType,
                        notificationIcon,
                        notificationRelativeTime,
                        notificationArchiveButtons,
                        notificationDownloadButtons,
                    } = getNotificationDisplayData({
                        notification,
                        t,
                        lang,
                        onArchiveUserNotifications,
                    });

                    return (
                        <KitNotification
                            key={notification.id}
                            type={notificationType}
                            icon={notificationIcon}
                            actionExtra={notificationArchiveButtons}
                            message={notification.title}
                            messageExtra={notificationRelativeTime}
                            description={notification.message}
                            footer={notificationDownloadButtons}
                        />
                    );
                })}
            </KitSpace>
            {userHasMultipleNotifications && (
                <div className={activityCenterTabFooter}>
                    <KitButton
                        type="secondary"
                        icon={<FontAwesomeIcon icon={faTrash} />}
                        onClick={() => onArchiveUserNotifications(userNotifications)}
                        danger
                    >
                        {t('global.delete_all')}
                    </KitButton>
                </div>
            )}
        </>
    );
};
