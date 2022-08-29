// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export enum EventTypes {
    CREATE = 'CREATE',
    REMOVE = 'REMOVE',
    MOVE = 'MOVE',
    UPDATE = 'UPDATE'
}

export interface IEventMsg {
    event: EventTypes;
    time: number;
    pathAfter: string;
    pathBefore: string;
    inode: number;
    isDirectory: boolean;
    hash?: string;
    rootKey: string;
    recordId?: string;
}
