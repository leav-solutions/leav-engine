export enum EventTypes {
    CREATE = 'CREATE',
    REMOVE = 'REMOVE',
    MOVE = 'MOVE',
    UPDATE = 'UPDATE',
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
