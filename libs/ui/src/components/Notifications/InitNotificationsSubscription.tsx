import {type ReactNode} from 'react';
import useNotificationsSubscription, {type INotificationTrackingEvent} from './hooks/useNotificationSubscription';

export const InitNotificationsSubscription = ({
    children,
    onTrackingEvents,
}: {
    children: ReactNode;
    onTrackingEvents?: (events: INotificationTrackingEvent[]) => void;
}) => {
    useNotificationsSubscription(onTrackingEvents);

    return <>{children}</>;
};
