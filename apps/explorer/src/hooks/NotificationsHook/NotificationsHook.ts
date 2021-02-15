// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useQuery} from '@apollo/client';
import {useCallback, useMemo} from 'react';
import {useTranslation} from 'react-i18next';
import {getBaseNotification, IGetBaseNotification} from '../../queries/cache/notifications/getBaseNotificationQuery';
import {IGetNotification} from '../../queries/cache/notifications/getNotificationsQuery';
import {
    getNotificationsStack,
    IGetNotificationsStack
} from '../../queries/cache/notifications/getNotificationsStackQuery';
import {IBaseNotification, INotification, NotificationType} from '../../_types/types';

interface IUseNotificationsStackReturn {
    notificationsStack: INotification[];
    updateNotificationsStack: (notificationsStack: INotification[]) => void;
    addNotification: (notification: INotification) => void;
    baseNotification: IBaseNotification;
    updateBaseNotification: (baseNotification: IBaseNotification) => void;
}

export const useNotifications = (): IUseNotificationsStackReturn => {
    const {t} = useTranslation();
    const {data: dataStack, client} = useQuery<IGetNotification>(getNotificationsStack);
    const {data: dataBase} = useQuery<IGetNotification>(getBaseNotification);

    const defaultBaseNotification: IBaseNotification = {
        content: t('notification.base-message'),
        type: NotificationType.basic
    };

    const notificationsStack = useMemo(() => dataStack?.notificationsStack || [], [dataStack]);
    const baseNotification = dataBase?.baseNotification || defaultBaseNotification;

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
