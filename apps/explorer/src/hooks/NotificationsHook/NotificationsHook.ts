// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {GET_NOTIFICATIONS_STACK, GET_NOTIFICATIONS_STACK_notificationsStack} from '_gqlTypes/GET_NOTIFICATIONS_STACK';
import {NotificationChannel, NotificationPriority} from '_gqlTypes/globalTypes';
import {
    getBaseNotification,
    IGetBaseNotification
} from '../../graphQL/queries/cache/notifications/getBaseNotificationQuery';
import {IGetNotification} from '../../graphQL/queries/cache/notifications/getNotificationsQuery';
import {getNotificationsStack} from '../../graphQL/queries/cache/notifications/getNotificationsStackQuery';
import {IBaseNotification, INotification, NotificationType} from '../../_types/types';

interface IUseNotificationsStackReturn {
    notificationsStack: GET_NOTIFICATIONS_STACK_notificationsStack[];
    updateNotificationsStack: (notificationsStack: GET_NOTIFICATIONS_STACK_notificationsStack[]) => void;
    addNotification: (notification: INotification) => void;
    baseNotification: IBaseNotification;
    updateBaseNotification: (baseNotification: IBaseNotification) => void;
}

export const useNotifications = (): IUseNotificationsStackReturn => {
    const {t} = useTranslation();
    const {data: dataStack, client} = useQuery<GET_NOTIFICATIONS_STACK>(getNotificationsStack);
    const {data: dataBase} = useQuery<IGetNotification>(getBaseNotification);

    const defaultBaseNotification: IBaseNotification = {
        content: t('notification.base-message'),
        type: NotificationType.basic
    };

    const notificationsStack = useMemo(() => dataStack?.notificationsStack || [], [dataStack]);
    const baseNotification = dataBase?.baseNotification || defaultBaseNotification;

    const updateNotificationsStack = useCallback(
        async (newNotificationsStack: GET_NOTIFICATIONS_STACK_notificationsStack[]) => {
            client.writeQuery<GET_NOTIFICATIONS_STACK>({
                query: getNotificationsStack,
                data: {
                    notificationsStack: newNotificationsStack
                }
            });
        },
        [client]
    );

    const updateBaseNotification = useCallback(
        (newBaseNotification: IBaseNotification) => {
            client.writeQuery<IGetBaseNotification>({
                query: getBaseNotification,
                data: {
                    baseNotification: newBaseNotification
                }
            });
        },
        [client]
    );

    const addNotification = useCallback(
        (notification: INotification) => {
            const notificationType: GET_NOTIFICATIONS_STACK_notificationsStack = {
                ...notification,
                time: notification.time ?? 5000,
                channel: notification.channel ?? NotificationChannel.trigger,
                priority: notification.priority ?? NotificationPriority.low
            };
            updateNotificationsStack([...notificationsStack, notificationType]);
        },
        [updateNotificationsStack, notificationsStack]
    );

    return {notificationsStack, updateNotificationsStack, addNotification, baseNotification, updateBaseNotification};
};
