export interface IEvent {
    time: number;
    userId: string;
    emitter: string;
    queryId: string;
    instanceId: string;
}
/*** Database events ***/
export declare enum EventAction {
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
    trigger?: string;
    action: EventAction;
    topic: {
        record?: {
            id: string;
            libraryId: string;
        };
        library?: string;
        attribute?: string;
        tree?: string;
        profile?: string;
        permission?: {
            type: string;
            applyTo?: any;
        };
        apiKey?: string;
        application?: string;
        filename?: string;
    };
    before?: any;
    after?: any;
    metadata?: any;
}
export interface IDbEvent extends IEvent {
    payload: IDbPayload;
}
/*** PubSub events ***/
export declare type PublishedEvent<T> = IEvent & T;
export interface IPubSubEvent extends IEvent {
    payload: IPubSubPayload;
}
export interface IPubSubPayload {
    triggerName: string;
    data: any;
}
