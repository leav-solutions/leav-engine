// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {NotificationType} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_BASE_NOTIFICATION
// ====================================================

export interface GET_BASE_NOTIFICATION_baseNotification {
    content: string;
    type: NotificationType | null;
}

export interface GET_BASE_NOTIFICATION {
    baseNotification: GET_BASE_NOTIFICATION_baseNotification | null;
}
