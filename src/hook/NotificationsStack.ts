import {useQuery} from '@apollo/client';
import {getNotificationsStack, IGetNotificationsStack} from '../queries/cache/notifications/getNotificationsStackQuery';
import {INotification} from '../_types/types';

interface IUseNotificationsStackReturn {
    notificationsStack: INotification[];
    updateNotificationsStack: (notificationsStack: INotification[]) => void;
}

export const useNotificationsStack = (): IUseNotificationsStackReturn => {
    const {data, client} = useQuery<IGetNotificationsStack>(getNotificationsStack);

    const notificationsStack = data?.notifications.stacks || [];

    const updateNotificationsStack = (notificationsStack: INotification[]) => {
        client.writeQuery<IGetNotificationsStack>({
            query: getNotificationsStack,
            data: {
                notifications: {
                    stacks: notificationsStack
                }
            }
        });
    };

    return {notificationsStack, updateNotificationsStack};
};

export const useAddNotifications = () => {
    const {notificationsStack, updateNotificationsStack} = useNotificationsStack();

    const addNotifications = (notification: INotification) => {
        updateNotificationsStack([...notificationsStack, notification]);
    };

    return addNotifications;
};
