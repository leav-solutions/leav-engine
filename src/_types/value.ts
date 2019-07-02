import {ITreeElement} from './tree';

export interface IValueVersion {
    [treeName: string]: ITreeElement;
}

export interface IDbValueVersion {
    [treeName: string]: string;
}

export interface IValue {
    id_value?: number;
    attribute?: string;
    value?: any;
    raw_value?: any;
    created_at?: number;
    modified_at?: number;
    version?: IValueVersion;
}

export interface IValuesOptions {
    version?: IValueVersion;
    [optionName: string]: any;
}
