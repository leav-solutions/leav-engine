import gql from 'graphql-tag';
import {IBaseNotification, INotification} from '../../../_types/types';

export interface IGetNotification {
    notificationsStack: INotification[];
    baseNotification: IBaseNotification;
}

export const getNotifications = gql`
    query GET_NOTIFICATIONS {
        notificationsStack @client
        baseNotification @client
    }
`;
