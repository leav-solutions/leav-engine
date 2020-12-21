// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
