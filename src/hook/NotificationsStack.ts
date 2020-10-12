import {useQuery} from '@apollo/client';
import {useCallback} from 'react';
import {getNotificationsStack, IGetNotificationsStack} from '../queries/cache/notifications/getNotificationsStackQuery';
import {INotification} from '../_types/types';

type IUseNotificationsStackReturn = [INotification[], (notificationsStack: INotification[]) => void];

export const useNotificationsStack = (): IUseNotificationsStackReturn => {
    const {data, client} = useQuery<IGetNotificationsStack>(getNotificationsStack);

    const notificationsStack = data?.notificationsStack || [];

    const updateNotificationsStack = useCallback(
        (notificationsStack: INotification[]) => {
            client.writeQuery<IGetNotificationsStack>({
                query: getNotificationsStack,
                data: {
                    notificationsStack
                }
            });
        },
        [client]
    );

    return [notificationsStack, updateNotificationsStack];
};

export const useAddNotification = () => {
    const [notificationsStack, updateNotificationsStack] = useNotificationsStack();

    const addNotification = useCallback(
        (notification: INotification) => {
            setImmediate(() => updateNotificationsStack([...notificationsStack, notification]));
        },
        [updateNotificationsStack, notificationsStack]
    );

    return addNotification;
};
