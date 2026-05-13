import {useDeleteAllUserNotificationsMutation, useDeleteUserNotificationMutation} from '../../../../__generated__';
import {type Notification} from '../types';

export const useDeleteUserNotifications = () => {
    const [deleteUserNotificationMutation] = useDeleteUserNotificationMutation();
    const [deleteAllUserNotificationsMutation] = useDeleteAllUserNotificationsMutation();

    const deleteUserNotifications = async (notifications: Notification[]) => {
        if (notifications.length === 1) {
            await deleteUserNotificationMutation({
                variables: {notificationId: notifications[0].id},
            });
        } else {
            await deleteAllUserNotificationsMutation();
        }
    };

    return {deleteUserNotifications};
};
