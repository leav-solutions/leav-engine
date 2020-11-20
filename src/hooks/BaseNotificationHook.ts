import {useQuery} from '@apollo/client';
import {useCallback} from 'react';
import {useTranslation} from 'react-i18next';
import {getBaseNotification, IGetBaseNotification} from '../queries/cache/notifications/getBaseNotificationQuery';
import {IBaseNotification, NotificationType} from '../_types/types';

type IUseBaseNotificationReturn = [IBaseNotification, (baseNotification: IBaseNotification) => void];

export const useBaseNotification = (): IUseBaseNotificationReturn => {
    const {t} = useTranslation();
    const {data, client} = useQuery<IGetBaseNotification>(getBaseNotification);

    const defaultBaseNotification: IBaseNotification = {
        content: t('notification.base-message'),
        type: NotificationType.basic
    };

    const baseNotification = data?.baseNotification || defaultBaseNotification;

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

    return [baseNotification, updateBaseNotification];
};
