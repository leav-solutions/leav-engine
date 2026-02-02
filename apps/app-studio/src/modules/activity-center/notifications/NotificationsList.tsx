// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {KitButton, KitEmpty, KitLoader, KitModal, KitNotification, KitSpace} from 'aristid-ds';
import {useTranslation} from 'react-i18next';
import {
    activityCenterTabEmptyContent,
    activityCenterTabContent,
    activityCenterTabFooter,
} from '../activityCenter.module.css';
import {useGetUserNotifications} from './get-user-notifications/useGetUserNotifications';
import {getNotificationDisplayData} from './getNotificationDisplayData';
import {useLang} from '_ui/hooks';
import {BREAK_TWO_LINES} from '_ui/components/Explorer/_constants';
import {type Notification} from './types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrash} from '@fortawesome/free-solid-svg-icons';
import {ERROR_NOTIFICATION_DURATION} from '_ui/constants';
import {useDeleteUserNotifications} from './delete-user-notifications/useDeleteUserNotifications';

export const NotificationsList = () => {
    const {userNotifications, loading, error, removeNotifications} = useGetUserNotifications();
    const {deleteUserNotifications} = useDeleteUserNotifications();

    const {t} = useTranslation();
    const {lang} = useLang();

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
        KitModal.confirm({
            width: '100%',
            style: {content: {width: '90vw', maxWidth: '656px'}},
            type: 'confirm',
            icon: false,
            title: t('activity_center.notifications.delete_notification', {count: notifications?.length}),
            content:
                t('activity_center.notifications.delete_notification_description', {count: notifications?.length}) +
                BREAK_TWO_LINES +
                t('global.are_you_sure'),
            okText: t('global.confirm'),
            cancelText: t('global.cancel'),
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
