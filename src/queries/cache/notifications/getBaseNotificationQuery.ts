import gql from 'graphql-tag';
import {IBaseNotification} from '../../../_types/types';

export interface IGetBaseNotification {
    baseNotification: IBaseNotification;
}

export const getBaseNotification = gql`
    query GET_BASE_NOTIFICATION {
        baseNotification @client
    }
`;
