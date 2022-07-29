// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

export interface IPayload {
    moduleName: string;
    funcName: string;
    funcArgs: any[];
    startAt: number;
}

export interface ITaskOrder {
    time: number;
    userId: string;
    payload: IPayload;
}
