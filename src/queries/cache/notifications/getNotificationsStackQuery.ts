import gql from 'graphql-tag';
import {INotification} from '../../../_types/types';

export interface IGetNotificationsStack {
    notificationsStack: INotification[];
}

export const getNotificationsStack = gql`
    query GET_NOTIFICATIONS_STACK {
        notificationsStack @client
    }
`;
