import {IAttribute} from './attribute';
import {ILibrary} from './library';

export interface IRecord {
    id?: number;
    library?: string;
    created_at?: number;
    modified_at?: number;
    [attributeName: string]: any;
}

export interface IRecordFilterOption {
    attribute: IAttribute;
    value: string | number;
}

export interface IQueryField {
    name: string;
    fields: IQueryField[];
    arguments: Array<{name: string; value: string}>;
}

export interface IRecordIdentity {
    id: number;
    library: ILibrary;
    label?: string;
    color?: string;
    preview?: string;
}

export interface IRecordIdentityConf {
    label?: string;
    color?: string;
    preview?: string;
}
