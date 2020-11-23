import {useQuery} from '@apollo/client';
import {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {getBaseNotification, IGetBaseNotification} from '../queries/cache/notifications/getBaseNotificationQuery';
import {getNotifications, IGetNotification} from '../queries/cache/notifications/getNotificationsQuery';
import {getNotificationsStack, IGetNotificationsStack} from '../queries/cache/notifications/getNotificationsStackQuery';
import {IBaseNotification, INotification, NotificationType} from '../_types/types';

type IUseNotificationsStackReturn = {
    notificationsStack: INotification[];
    updateNotificationsStack: (notificationsStack: INotification[]) => void;
    addNotification: (notification: INotification) => void;
    baseNotification: IBaseNotification;
    updateBaseNotification: (baseNotification: IBaseNotification) => void;
};

export const useNotifications = (): IUseNotificationsStackReturn => {
    const {t} = useTranslation();
    const {data, client} = useQuery<IGetNotification>(getNotifications);

    const defaultBaseNotification: IBaseNotification = {
        content: t('notification.base-message'),
        type: NotificationType.basic
    };

    const notificationsStack = data?.notificationsStack || [];
    const baseNotification = data?.baseNotification || defaultBaseNotification;

    const updateNotificationsStack = useCallback(
        (newNotificationsStack: INotification[]) => {
            client.writeQuery<IGetNotificationsStack>({
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
            updateNotificationsStack([...notificationsStack, notification]);
        },
        [updateNotificationsStack, notificationsStack]
    );

    return {notificationsStack, updateNotificationsStack, addNotification, baseNotification, updateBaseNotification};
};
