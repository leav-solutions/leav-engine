import {type IQueryInfos} from './queryInfos';
import {type IAttribute} from './attribute';
import {type ISystemTranslation} from './systemTranslation';
import {type IValue} from './value';
import {type Errors} from './errors';

export enum ActionsListEvents {
    SAVE_VALUE = 'saveValue',
    POST_SAVE_VALUE = 'postSaveValue',
    DELETE_VALUE = 'deleteValue',
    POST_DELETE_VALUE = 'postDeleteValue',
    GET_VALUE = 'getValue',
}

export enum ActionsListIOTypes {
    STRING = 'string',
    NUMBER = 'number',
    OBJECT = 'object',
    BOOLEAN = 'boolean',
}

export type ActionsListValueType = string | number | boolean | object;

export type ActionsListConfig = {[Event in ActionsListEvents]?: IActionsListSavedAction[]};

export interface IActionsListContext extends IQueryInfos {
    actionEvent: ActionsListEvents;
    attribute?: IAttribute;
    library?: string;
    recordId?: string;
}

export type ActionsListParams<T extends string | number | symbol> = Record<T, string>;

export type ActionsListParamsConfig<ParamsRequired extends Record<string, boolean>> = {
    [Name in keyof ParamsRequired]: {
        name: Name;
        type: 'boolean' | 'string' | 'number'; // TODO: find admin type
        description: string;
        required: ParamsRequired[Name];
        helper_value: string;
    };
}[keyof ParamsRequired];

export interface IActionsListFunctionResult {
    values: IValue[];
    errors: Array<{errorType: Errors; attributeValue: IValue; message?: string}>;
}

type PartialByCondition<TargetType, RequiredValues extends Record<keyof TargetType, boolean>> = {
    [
        FieldName in keyof TargetType as RequiredValues[FieldName] extends true ? FieldName : never
    ]: TargetType[FieldName];
} & {
    [
        FieldName in keyof TargetType as RequiredValues[FieldName] extends false ? FieldName : never
    ]?: TargetType[FieldName];
};

/**
 * @types ParamsRequired is record of params key with matching boolean for required option: `{ paramName: isRequired }`
 */
export interface IActionsListFunction<
    ParamsRequired extends Record<string | number | symbol, boolean> = Record<string | number | symbol, boolean>,
> {
    id: string;
    name: string;
    description: string;
    input_types: ActionsListIOTypes[];
    output_types: ActionsListIOTypes[];
    params?: Array<ActionsListParamsConfig<ParamsRequired>>;
    error_message?: ISystemTranslation;
    compute: boolean;
    action: (
        values: IValue[],
        params: PartialByCondition<ActionsListParams<keyof ParamsRequired>, ParamsRequired>,
        ctx: IActionsListContext,
    ) => IActionsListFunctionResult | Promise<IActionsListFunctionResult>;
}

export interface IActionsListSavedAction {
    id: string;
    name: string;
    is_system?: boolean;
    params?: Array<{name: string; value: string}>;
    error_message?: ISystemTranslation;
}

export interface IRunActionsListCtx extends IQueryInfos {
    actionEvent: ActionsListEvents;
    attribute?: IAttribute;
    recordId?: string;
    library?: string;
}
