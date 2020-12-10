// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
