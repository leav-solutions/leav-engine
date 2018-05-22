import {description} from 'joi';
import {IAttribute} from './attribute';
import libraryDomain from 'domain/libraryDomain';

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
    [ActionsListEvents.SAVE_VALUE]?: [IActionsListSavedAction];
    [ActionsListEvents.DELETE_VALUE]?: [IActionsListSavedAction];
    [ActionsListEvents.GET_VALUE]?: [IActionsListSavedAction];
}

export interface IActionsListContext {
    attribute?: IAttribute;
    library?: string;
    recordId?: number;
}

export interface IActionsListParams {
    [name: string]: any;
}

export interface IActionsListFunction {
    name: string;
    description: string;
    inputTypes: ActionsListIOTypes[];
    outputTypes: ActionsListIOTypes[];
    params?: [{name: string; type: string; description: string}];
    action: (value: ActionsListValueType, params: IActionsListParams, ctx: IActionsListContext) => ActionsListValueType;
}

export interface IActionsListSavedAction {
    name: string;
    isSystem: boolean;
    params?: [{name: string; value: string}];
}
