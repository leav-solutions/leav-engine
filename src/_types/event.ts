export enum EventType {
    RECORD_SAVE = 'RECORD_SAVE',
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
        libraryId: string;
        old?: any;
        new?: any;
    };
}

export interface ILibraryPayload extends IPayload {
    data: {
        id: string;
    };
}

export interface IValuePayload extends IPayload {
    data: {
        libraryId: string;
        recordId: string;
        attributeId: string;
        value?: {
            new: any;
            old?: any;
        };
    };
}

export type Payload = IRecordPayload | ILibraryPayload | IValuePayload;

export interface IEvent {
    time: number;
    userId: string;
    payload: Payload;
}
