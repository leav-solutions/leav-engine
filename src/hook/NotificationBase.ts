import {useQuery} from '@apollo/client';
import {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {getNotificationBase, IGetNotificationBase} from '../queries/cache/notifications/getNotificationBaseQuery';
import {INotificationBase, NotificationType} from '../_types/types';

type IUseNotificationBaseReturn = [INotificationBase, (notificationBase: INotificationBase) => void];

export const useNotificationBase = (): IUseNotificationBaseReturn => {
    const {t} = useTranslation();
    const {data, client} = useQuery<IGetNotificationBase>(getNotificationBase);

    const defaultNotificationBase: INotificationBase = {
        content: t('notification.base-message'),
        type: NotificationType.basic
    };

    const notificationBase = data?.notificationBase || defaultNotificationBase;

    const updateNotificationBase = useCallback(
        (newNotificationBase: INotificationBase) => {
            client.writeQuery<IGetNotificationBase>({
                query: getNotificationBase,
                data: {
                    notificationBase: newNotificationBase
                }
            });
        },
        [client]
    );

    return [notificationBase, updateNotificationBase];
};
