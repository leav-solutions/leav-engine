export interface IParam {
    // INTERNAL
    name: string;
    type: string;
    description: string;
    required: boolean;
    default_value: string;
    value?: string;
}

export interface IAction {
    // INTERNAL
    id: number;
    name: string;
    description: string | null;
    input_types: string[];
    output_types: string[];
    params: Array<IParam | null> | null;
    isSystem?: boolean | null;
}

export interface IReserveAction {
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
    name: string;
    is_system?: boolean;
    params: IParamConfig[] | null;
}

export interface IParamInput {
    actionId: number;
    paramName: string;
    value: string;
}

export interface ICurrActionListOrder {
        saveValue: number[],
        getValue: number[],
        deleteValue: number[]
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
