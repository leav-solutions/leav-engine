// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {NotificationType, NotificationPriority, NotificationChannel} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_NOTIFICATIONS
// ====================================================

export interface GET_NOTIFICATIONS_notificationsStack {
    content: string;
    type: NotificationType;
    time: number;
    priority: NotificationPriority | null;
    channel: NotificationChannel | null;
}

export interface GET_NOTIFICATIONS_baseNotification {
    content: string;
    type: NotificationType | null;
}

export interface GET_NOTIFICATIONS {
    notificationsStack: GET_NOTIFICATIONS_notificationsStack[] | null;
    baseNotification: GET_NOTIFICATIONS_baseNotification | null;
}
