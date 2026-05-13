import {type INotification} from './notification';
import {type IRecord} from './record';
import {type ITask} from './tasksManager';

export enum TriggerNames {
    APPLICATION_EVENT = 'APPLICATION_EVENT',
    UPLOAD_FILE = 'UPLOAD_FILE',
    INDEXATION = 'INDEXATION',
    TASK = 'TASK',
    TREE_EVENT = 'TREE_EVENT',
    RECORD_UPDATE = 'RECORD_UPDATE',
    RECORD_NEW_COMMENT = 'RECORD_NEW_COMMENT',
    NOTIFICATION = 'NOTIFICATION',
}

export interface IPubSubNotificationData {
    notification: INotification;
    recipientUserIds: string[];
}

export interface IPubSubTaskData {
    task: ITask;
}

export interface IPubSubRecordNewCommentData {
    recordNewComment: {
        record: IRecord;
        comment: IRecord;
    };
}
