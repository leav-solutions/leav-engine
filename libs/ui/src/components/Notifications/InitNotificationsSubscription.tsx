import {type ReactNode} from 'react';
import useNotificationsSubscription from './hooks/useNotificationSubscription';

export const InitNotificationsSubscription = ({children}: {children: ReactNode}) => {
    useNotificationsSubscription();

    return <>{children}</>;
};
