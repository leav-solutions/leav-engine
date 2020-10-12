import gql from 'graphql-tag';
import {INotificationBase} from '../../../_types/types';

export interface IGetNotificationBase {
    notificationBase: INotificationBase;
}

export const getNotificationBase = gql`
    query GET_NOTIFICATIONS_STACK {
        notificationBase @client
    }
`;
