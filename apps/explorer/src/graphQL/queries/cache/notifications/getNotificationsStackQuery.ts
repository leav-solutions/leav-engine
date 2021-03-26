// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import gql from 'graphql-tag';
import {INotification} from '../../../../_types/types';

export interface IGetNotificationsStack {
    notificationsStack: INotification[];
}

export const getNotificationsStack = gql`
    query GET_NOTIFICATIONS_STACK {
        notificationsStack @client {
            content @client
            type @client
            time @client
            priority @client
            channel @client
        }
    }
`;
