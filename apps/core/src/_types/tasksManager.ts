// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

export enum OrderType {
    CREATE = 'CREATE',
    CANCEL = 'CANCEL'
}
export enum TaskStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    FAILED = 'FAILED',
    DONE = 'DONE'
}

export enum TaskPriority {
    LOW = 0,
    MEDIUM = 1,
    HIGH = 2
}

export type ITaskCreatePayload = Pick<ITask, 'id' | 'name' | 'func' | 'startAt' | 'priority' | 'callback'>;
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
    ALWAYS = 'ALWAYS',
    ON_SUCCESS = 'ON_SUCCESS',
    ON_FAILURE = 'ON_FAILURE'
}

export type ITaskCallback = ITaskFunc & {type: TaskCallbackType};

export interface ITask {
    id: string;
    name: string;
    created_at?: number;
    created_by?: string;
    modified_at?: number;
    modified_by?: string;
    active?: boolean;
    func: ITaskFunc;
    startAt: number;
    status: TaskStatus;
    priority: TaskPriority;
    progress?: number; // percent //TODO: maybe add more explicit progress status
    startedAt?: number;
    completedAt?: number;
    links?: string[];
    callback?: ITaskCallback;
    workerId?: number;
}
