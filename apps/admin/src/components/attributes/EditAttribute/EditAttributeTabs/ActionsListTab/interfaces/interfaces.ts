// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
export interface IParam {
    // INTERNAL
    name: string;
    type: string;
    description: string;
    required: boolean;
    helper_value: string;
    value?: string;
}

export interface IAction {
    // INTERNAL
    list_id: number;
    id: string;
    name: string;
    description: string | null;
    input_types: string[];
    output_types: string[];
    params: Array<IParam | null> | null;
    isSystem?: boolean | null;
    error_message?: SystemTranslation;
}

export interface IReserveAction {
    id: string;
    name: string;
    description: string;
    input_types: string[];
    output_types: string[];
    params: Array<IParam | null> | null;
}

export interface IParamConfig {
    name: string;
    value: string | undefined;
}

export interface IActionConfig {
    id: string;
    is_system?: boolean;
    params: IParamConfig[] | null;
    error_message?: SystemTranslation;
}

export interface IParamInput {
    actionId: number;
    paramName: string;
    value: string;
}

export interface ICurrActionListOrder {
    saveValue: number[];
    getValue: number[];
    deleteValue: number[];
}

export interface IDragObject {
    action: IAction;
    colorTypeDictionnary: IColorDic;
    id: string;
    origin: string;
    originalIndex: number;
    type: string;
    connectionState: string;
}

export interface IColorDic {
    // INTERNAL
    [key: string]: number[];
}

export interface ICurrentActionList {
    higherId: number;
    [key: number]: IAction;
}

export interface IAllActionLists {
    saveValue: ICurrentActionList;
    getValue: ICurrentActionList;
    deleteValue: ICurrentActionList;
}
