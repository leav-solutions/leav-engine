export interface IEvent {
    time: number;
    userId: string;
    emitter: string;
    queryId: string;
    instanceId: string;
}

/*** Database events ***/

/**
 * When adding an event in this list, ensure to run `yarn graphql-generate` in apps/admin to
 * allow filter on it in admin history page
 */
export enum EventAction {
    API_KEY_DELETE = 'API_KEY_DELETE',
    API_KEY_SAVE = 'API_KEY_SAVE',
    APP_DELETE = 'APP_DELETE',
    APP_SAVE = 'APP_SAVE',
    AUTOMATION_RULE_CREATE = 'AUTOMATION_RULE_CREATE',
    AUTOMATION_RULE_UPDATE = 'AUTOMATION_RULE_UPDATE',
    AUTOMATION_RULE_DELETE = 'AUTOMATION_RULE_DELETE',
    AUTOMATION_PIPELINE_SUCCESS = 'AUTOMATION_PIPELINE_SUCCESS',
    AUTOMATION_PIPELINE_FAILURE = 'AUTOMATION_PIPELINE_FAILURE',
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
    RECORD_DELETE = 'RECORD_DELETE', // when a record is purged (for now)
    RECORD_SAVE = 'RECORD_SAVE', // when a record is updated (rare, only for some fileManager events !)
    RECORD_INIT = 'RECORD_INIT', // when a record is created, still not active
    SDO_LOG_EXPORT_RECORD = 'SDO_LOG_EXPORT_RECORD',
    SDO_LOG_IMPORT_RECORD = 'SDO_LOG_IMPORT_RECORD',
    SDO_LOG_ERROR = 'SDO_LOG_ERROR',
    DTO_LOG_IMPORT_RECORD = 'DTO_LOG_IMPORT_RECORD',
    DTO_LOG_ERROR = 'DTO_LOG_ERROR',
    TREE_ADD_ELEMENT = 'TREE_ADD_ELEMENT',
    TREE_DELETE = 'TREE_DELETE',
    TREE_DELETE_ELEMENT = 'TREE_DELETE_ELEMENT',
    TREE_MOVE_ELEMENT = 'TREE_MOVE_ELEMENT',
    TREE_SAVE = 'TREE_SAVE',
    VALUE_DELETE = 'VALUE_DELETE',
    VALUE_SAVE = 'VALUE_SAVE',
    VERSION_PROFILE_DELETE = 'VERSION_PROFILE_DELETE',
    VERSION_PROFILE_SAVE = 'VERSION_PROFILE_SAVE',
}

export interface IDbPayload {
    trigger?: string; // The high level action that triggered the event: an import, a plugin action, a mass action...
    action: EventAction | string; // The action that triggered the event
    // To identify which element is concerned by the event
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
        automationRule?: string;
        apiKey?: string;
        application?: string;
        filename?: string;
    };
    before?: any; // Value before the event
    after?: any; // Value after the event
    metadata?: any; // Any data that can be useful to the human reading the logs
}

export interface IDbEvent extends IEvent {
    payload: IDbPayload;
}

/*** PubSub events ***/

export type PublishedEvent<T> = IEvent & T;

export interface IPubSubEvent extends IEvent {
    payload: IPubSubPayload;
}

export interface IPubSubPayload {
    triggerName: string;
    data: any;
}
