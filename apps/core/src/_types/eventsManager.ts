// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {type INotificationContent} from './notification';
import {type ITask} from './tasksManager';

export enum TriggerNames {
    APPLICATION_EVENT = 'APPLICATION_EVENT',
    UPLOAD_FILE = 'UPLOAD_FILE',
    INDEXATION = 'INDEXATION',
    TASK = 'TASK',
    TREE_EVENT = 'TREE_EVENT',
    RECORD_UPDATE = 'RECORD_UPDATE',
    NOTIFICATION = 'NOTIFICATION',
}

export interface IPubSubNotificationData {
    notification: INotificationContent & {
        date: number;
        displayDuration?: number;
    };
    recipientUserIds: string[];
}

export interface IPubSubTaskData {
    task: ITask;
}
