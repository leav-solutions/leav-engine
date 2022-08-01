// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

export enum eTaskStatus {
    WAITING = 'WAITING',
    IN_PROGRESS = 'IN_PROGRESS',
    DONE = 'DONE'
}

export interface ITaskOrderPayload {
    moduleName: string;
    funcName: string;
    funcArgs: any[];
    startAt: number;
}

export interface ITaskOrder {
    time: number;
    userId: string;
    payload: ITaskOrderPayload;
}

export interface ITask {
    id: string;
    created_at?: number;
    created_by?: string;
    modified_at?: number;
    modified_by?: string;
    active?: boolean;
    moduleName: string;
    funcName: string;
    funcArgs: any[];
    startAt: number;
    status: eTaskStatus;
    progress?: number; // percent //TODO: maybe add more explicit progress status
    startedAt?: number;
    completedAt?: number;
    links?: string[];
}
