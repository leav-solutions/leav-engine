export enum EventType {
    RECORD_CREATE = 'RECORD_CREATE',
    RECORD_UPDATE = 'RECORD_UPDATE',
    RECORD_DELETE = 'RECORD_DELETE',
    LIBRARY_SAVE = 'LIBRARY_SAVE',
    LIBRARY_DELETE = 'LIBRARY_DELETE',
    VALUE_SAVE = 'VALUE_SAVE',
    VALUE_DELETE = 'VALUE_DELETE'
}

export interface IPayload {
    type: EventType;
}

export interface IRecordPayload extends IPayload {
    data: {
        id: string;
        old?: any;
        new?: any;
    };
}

export interface ILibraryPayload extends IPayload {
    data: {
        id: string;
        old?: any;
        new?: any;
    };
}

export interface IValuePayload extends IPayload {
    data: {
        libraryId: string;
        recordId: string;
        attributeId: string;
        value?: {
            old: any;
            new: any;
        };
    };
}

export type Payload = IRecordPayload | ILibraryPayload | IValuePayload;

export interface IEvent {
    date: Date;
    userId: string;
    payload: Payload;
}
