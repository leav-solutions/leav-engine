// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ISystemTranslation} from './systemTranslation';

export enum OrderType {
    CREATE = 'CREATE',
    CANCEL = 'CANCEL',
    DELETE = 'DELETE'
}

export enum TaskStatus {
    CREATED = 'CREATED',
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    FAILED = 'FAILED',
    DONE = 'DONE',
    PENDING_CANCEL = 'PENDING_CANCEL',
    CANCELED = 'CANCELED'
}

export enum TaskPriority {
    LOW = 0,
    MEDIUM = 1,
    HIGH = 2
}

export type ITaskCreatePayload = Pick<ITask, 'label' | 'func' | 'priority' | 'callbacks'> &
    Partial<Pick<ITask, 'id' | 'startAt' | 'role'>>;

export type ITaskCancelPayload = Pick<ITask, 'id'>;
export type ITaskDeletePayload = Pick<ITask, 'id'> & {archive: boolean};

export type Payload = ITaskCreatePayload | ITaskCancelPayload | ITaskDeletePayload;

export interface ITaskOrder {
    time: number;
    userId: string;
    payload: Payload;
}

export interface ITaskFunc {
    moduleName: string;
    subModuleName?: string;
    name: string;
    args: {[key: string]: any};
}

export enum TaskCallbackType {
    ON_SUCCESS = 'ON_SUCCESS',
    ON_FAILURE = 'ON_FAILURE',
    ON_CANCEL = 'ON_CANCEL'
}

export enum TaskCallbackStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    FAILED = 'FAILED',
    DONE = 'DONE',
    SKIPPED = 'SKIPPED'
}

export type ITaskCallback = ITaskFunc & {args: any[]; type: TaskCallbackType[]; status?: TaskCallbackStatus};

// Interface to add as the least param of a new task function
export interface ITaskFuncParams {
    id?: string;
    startAt?: number;
    callbacks?: ITaskCallback[];
}

export enum TaskType {
    EXPORT = 'EXPORT',
    IMPORT_CONFIG = 'IMPORT_CONFIG',
    IMPORT_DATA = 'IMPORT_DATA',
    INDEXATION = 'INDEXATION'
}

export interface ITaskRole {
    type: TaskType;
    detail?: string;
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
    role?: ITaskRole;
    canceledBy?: string;
    progress?: {percent?: number; description?: ISystemTranslation};
    startedAt?: number;
    completedAt?: number;
    link?: {name: string; url: string};
    callbacks?: ITaskCallback[];
    workerId?: number;
}
