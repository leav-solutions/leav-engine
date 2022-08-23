// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecord} from './record';
import {ILibrary} from './library';
import {IValue} from './value';

export interface IEvent {
    time: number;
    userId: string;
}

/* Database events */

export enum EventAction {
    RECORD_SAVE = 'RECORD_SAVE',
    RECORD_DELETE = 'RECORD_DELETE',
    LIBRARY_SAVE = 'LIBRARY_SAVE',
    LIBRARY_DELETE = 'LIBRARY_DELETE',
    VALUE_SAVE = 'VALUE_SAVE',
    VALUE_DELETE = 'VALUE_DELETE'
}

export interface IDbPayload {
    action: EventAction;
}

export interface IRecordPayload extends IDbPayload {
    data: {
        id: string;
        libraryId: string;
        old?: IRecord;
        new?: IRecord;
    };
}

export type DataLibrary = Omit<ILibrary, 'attributes' | 'fullTextAttributes'> & {
    attributes?: string[];
    fullTextAttributes?: string[];
};

export interface ILibraryPayload extends IDbPayload {
    data: {
        old?: DataLibrary;
        new?: DataLibrary;
    };
}

export interface IValuePayload extends IDbPayload {
    data: {
        libraryId: string;
        recordId: string;
        attributeId: string;
        value: {
            new?: IValue | IValue[];
            old?: IValue | IValue[];
        };
    };
}

export type DbPayload = IRecordPayload | ILibraryPayload | IValuePayload;

export interface IDbEvent extends IEvent {
    payload: DbPayload;
}

/* PubSub events */

export interface IPubSubEvent extends IEvent {
    payload: IPubSubPayload;
}

export interface IPubSubPayload {
    triggerName: string;
    data: any;
}
