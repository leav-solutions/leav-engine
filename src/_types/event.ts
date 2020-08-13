export enum EventType {
    RECORD_CREATE = 'RECORD_CREATE',
    RECORD_DELETE = 'RECORD_DELETE',
    LIBRARY_SAVE = 'LIBRARY_SAVE',
    LIBRARY_DELETE = 'LIBRARY_DELETE',
    VALUE_SAVE = 'VALUE_SAVE', // TODO: how to index it?
    VALUE_DELETE = 'VALUE_DELETE' // TODO: "
}

export interface IPayload {
    type: EventType;
}

export interface IRecordPayload extends IPayload {
    data: {
        id: string;
        libraryId: string;
        old?: any;
        new?: any;
    };
}

export interface ILibraryPayload extends IPayload {
    data: {
        id: string;
        fullTextAttributes?: string[];
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
