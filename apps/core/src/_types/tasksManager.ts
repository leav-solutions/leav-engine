// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

export enum eTaskStatus {
    PENDING = 'PENDING',
    RUNNING = 'RUNNING',
    FAILED = 'FAILED',
    DONE = 'DONE'
}

export interface ITaskOrderPayload {
    func: ITaskFunc;
    startAt: number;
}

export interface ITaskOrder {
    time: number;
    userId: string;
    payload: ITaskOrderPayload;
}

export interface ITaskFunc {
    moduleName: string;
    subModuleName: string;
    name: string;
    args: any[];
}

export interface ITask {
    id: string;
    created_at?: number;
    created_by?: string;
    modified_at?: number;
    modified_by?: string;
    active?: boolean;
    func: ITaskFunc;
    startAt: number;
    status: eTaskStatus;
    progress?: number; // percent //TODO: maybe add more explicit progress status
    startedAt?: number;
    completedAt?: number;
    links?: string[];
    callback?: ITaskFunc;
}
