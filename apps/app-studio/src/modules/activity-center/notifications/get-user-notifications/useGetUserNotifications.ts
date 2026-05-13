import {useState} from 'react';
import {useGetUserNotificationsQuery, useSubscribeToUserNotificationsSubscription} from '../../../../__generated__';
import {type Notification} from '../types';

export const useGetUserNotifications = () => {
    const [userNotifications, setUserNotifications] = useState<Map<string, Notification>>(new Map());

    const {loading, error} = useGetUserNotificationsQuery({
        fetchPolicy: 'network-only',
        onCompleted: ({notifications}) => {
            setUserNotifications(new Map(notifications.list.map(notification => [notification.id, notification])));
        },
    });

    useSubscribeToUserNotificationsSubscription({
        onData: subData => {
            const notification = subData.data.data?.notification;

            setUserNotifications(prev => {
                const newMap = new Map(prev);
                newMap.set(notification.id, notification);
                return newMap;
            });
        },
    });

    const removeNotifications = (notificationIds: string[]) => {
        setUserNotifications(prev => {
            const newMap = new Map(prev);
            notificationIds.forEach(id => newMap.delete(id));
            return newMap;
        });
    };

    const sortedByCreationDateUserNotifications = Array.from(userNotifications.values()).sort(
        (a, b) => Number(b.date) - Number(a.date),
    );

    return {userNotifications: sortedByCreationDateUserNotifications, loading, error, removeNotifications};
};
