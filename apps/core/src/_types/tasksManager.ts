// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ISystemTranslation} from './systemTranslation';

export enum OrderType {
    CREATE = 'CREATE',
    CANCEL = 'CANCEL'
}
export enum TaskStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    FAILED = 'FAILED',
    DONE = 'DONE',
    CANCELED = 'CANCELED'
}

export enum TaskPriority {
    LOW = 0,
    MEDIUM = 1,
    HIGH = 2
}

export type ITaskCreatePayload = Pick<ITask, 'id' | 'label' | 'func' | 'startAt' | 'priority' | 'callback'>;
export type ITaskCancelPayload = Pick<ITask, 'id'>;

export type Payload = ITaskCreatePayload | ITaskCancelPayload;

export interface ITaskOrder {
    time: number;
    userId: string;
    type: OrderType;
    payload: Payload;
}

export interface ITaskFunc {
    moduleName: string;
    subModuleName?: string;
    name: string;
    args: any[];
}

export enum TaskCallbackType {
    ON_SUCCESS = 'ON_SUCCESS',
    ON_FAILURE = 'ON_FAILURE',
    ON_CANCEL = 'ON_CANCEL'
}

export type ITaskCallback = ITaskFunc & {type: TaskCallbackType[]};

// Interface to add as the least param of a new task function
export interface ITaskFuncParams {
    id?: string;
    startAt?: number;
    callback?: ITaskCallback;
}

export interface ITask {
    id: string;
    label: ISystemTranslation;
    created_at: number;
    created_by: string;
    modified_at: number;
    func: ITaskFunc;
    startAt: number;
    status: TaskStatus;
    priority: TaskPriority;
    archive: boolean;
    canceledBy?: string;
    progress?: {percent?: number; description?: string};
    startedAt?: number;
    completedAt?: number;
    link?: {name: string; url: string};
    callback?: ITaskCallback;
    workerId?: number;
}
