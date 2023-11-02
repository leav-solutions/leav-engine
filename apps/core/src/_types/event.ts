// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// Copyright LEAV Solutions 2017

export interface IEvent {
    time: number;
    userId: string;
    emitter: string; // Unique ID of the process emitting the event. Used to figure out if the event is coming from current process
    queryId: string;
}

export type PublishedEvent<T> = IEvent & T;

/* Database events */

export enum EventAction {
    API_KEY_DELETE = 'API_KEY_DELETE',
    API_KEY_SAVE = 'API_KEY_SAVE',
    APP_DELETE = 'APP_DELETE',
    APP_SAVE = 'APP_SAVE',
    ATTRIBUTE_DELETE = 'ATTRIBUTE_DELETE',
    ATTRIBUTE_SAVE = 'ATTRIBUTE_SAVE',
    EXPORT_START = 'EXPORT_START',
    EXPORT_END = 'EXPORT_END',
    DATA_IMPORT_START = 'DATA_IMPORT_START',
    DATA_IMPORT_END = 'DATA_IMPORT_END',
    CONFIG_IMPORT_START = 'CONFIG_IMPORT_START',
    CONFIG_IMPORT_END = 'CONFIG_IMPORT_END',
    GLOBAL_SETTINGS_SAVE = 'GLOBAL_SETTINGS_SAVE',
    LIBRARY_DELETE = 'LIBRARY_DELETE',
    LIBRARY_PURGE = 'LIBRARY_PURGE',
    LIBRARY_SAVE = 'LIBRARY_SAVE',
    TASKS_DELETE = 'TASKS_DELETE',
    PERMISSION_SAVE = 'PERMISSION_SAVE',
    RECORD_DELETE = 'RECORD_DELETE',
    RECORD_SAVE = 'RECORD_SAVE',
    TREE_ADD_ELEMENT = 'TREE_ADD_ELEMENT',
    TREE_DELETE = 'TREE_DELETE',
    TREE_DELETE_ELEMENT = 'TREE_DELETE_ELEMENT',
    TREE_MOVE_ELEMENT = 'TREE_MOVE_ELEMENT',
    TREE_SAVE = 'TREE_SAVE',
    VALUE_DELETE = 'VALUE_DELETE',
    VALUE_SAVE = 'VALUE_SAVE',
    VERSION_PROFILE_DELETE = 'VERSION_PROFILE_DELETE',
    VERSION_PROFILE_SAVE = 'VERSION_PROFILE_SAVE'
}

export interface IDbPayload {
    trigger?: string; // The high level action that triggered the event: an import, a plugin action, a mass action...
    action: EventAction;
    topic: {
        // Any data to identify which element is concerned by the event
        record?: {
            id: string;
            libraryId: string;
        };
        library?: string;
        attribute?: string;
        tree?: string;
        [key: string]: any;
    };
    before?: any; // Value before the event
    after?: any; // Value after the event
    metadata?: any; // Any data that can be useful to the human reading the logs
}

export interface IDbEvent extends IEvent {
    payload: IDbPayload;
}

/* PubSub events */

export interface IPubSubEvent extends IEvent {
    payload: IPubSubPayload;
}

export interface IPubSubPayload {
    triggerName: string;
    data: any;
}
