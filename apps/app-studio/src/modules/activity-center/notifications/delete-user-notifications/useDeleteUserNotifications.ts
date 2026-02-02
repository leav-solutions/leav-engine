// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
