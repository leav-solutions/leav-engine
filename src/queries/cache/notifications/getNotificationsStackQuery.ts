import gql from 'graphql-tag';
import {INotification} from '../../../_types/types';

export interface IGetNotificationsStack {
    notifications: {stacks: INotification[]};
}

export const getNotificationsStack = gql`
    query GET_NOTIFICATIONS_STACK {
        notifications @client {
            stacks @client
        }
    }
`;
