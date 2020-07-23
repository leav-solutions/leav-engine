import {IAttribute} from './attribute';
import {ILibrary} from './library';
import {IPreview} from './preview';

export interface IRecord {
    id?: string;
    library?: string;
    created_at?: number;
    created_by?: string;
    modified_at?: number;
    modified_by?: string;
    active?: boolean;
    [attributeName: string]: any;
}

export enum Operator {
    AND = 'AND',
    OR = 'OR',
    OPEN_BRACKET = 'OPEN_BRACKET',
    CLOSE_BRACKET = 'CLOSE_BRACKET'
}

export enum Condition {
    EQUAL = 'EQUAL',
    NOT_EQUAL = 'NOT_EQUAL',
    BEGIN_WITH = 'BEGIN_WITH',
    END_WITH = 'END_WITH',
    CONTAINS = 'CONTAINS',
    NOT_CONTAINS = 'NOT_CONTAINS',
    GREATER_THAN = 'GREATER_THAN',
    LESS_THAN = 'LESS_THAN'
}

export interface IRecordFilterOption {
    attributes?: IAttribute[];
    value?: string | number | boolean;
    condition?: Condition;
    operator?: Operator;
}

export interface IRecordSort {
    attributes: IAttribute[];
    order: string;
}

export interface IQueryField {
    name: string;
    fields: IQueryField[];
    arguments: Array<{name: string; value: string}>;
}

export interface IRecordIdentity {
    id: string;
    library: ILibrary;
    label?: string;
    color?: string;
    preview?: IPreview;
}

export interface IRecordIdentityConf {
    label?: string;
    color?: string;
    preview?: string;
}
