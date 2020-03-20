import {IAttribute} from './attribute';

export enum ActionsListEvents {
    SAVE_VALUE = 'saveValue',
    DELETE_VALUE = 'deleteValue',
    GET_VALUE = 'getValue'
}

export enum ActionsListIOTypes {
    STRING = 'string',
    NUMBER = 'number',
    OBJECT = 'object',
    BOOLEAN = 'boolean'
}

export type ActionsListValueType = string | number | boolean | {};

// TODO: should be able to use [event: ActionsListEvents] as from TS v2.9
export interface IActionsListConfig {
    [ActionsListEvents.SAVE_VALUE]?: IActionsListSavedAction[];
    [ActionsListEvents.DELETE_VALUE]?: IActionsListSavedAction[];
    [ActionsListEvents.GET_VALUE]?: IActionsListSavedAction[];
}

export interface IActionsListContext {
    attribute?: IAttribute;
    library?: string;
    recordId?: number;
}

export interface IActionsListParams {
    [name: string]: any;
}

export interface IActionsListParamsConfig {
    name: string;
    type: string;
    description: string;
    required: boolean;
    default_value: string;
}

export interface IActionsListFunction {
    id: string;
    name: string;
    description: string;
    input_types: ActionsListIOTypes[];
    output_types: ActionsListIOTypes[];
    params?: IActionsListParamsConfig[];
    action: (value: ActionsListValueType, params: IActionsListParams, ctx: IActionsListContext) => ActionsListValueType;
}

export interface IActionsListSavedAction {
    id: string;
    name: string;
    is_system?: boolean;
    params?: Array<{name: string; value: string}>;
}
