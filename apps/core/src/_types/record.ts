// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IAttributeWithRevLink} from 'infra/attributeTypes/attributeTypesRepo';
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

export enum AttributeCondition {
    EQUAL = 'EQUAL',
    NOT_EQUAL = 'NOT_EQUAL',
    BEGIN_WITH = 'BEGIN_WITH',
    END_WITH = 'END_WITH',
    CONTAINS = 'CONTAINS',
    NOT_CONTAINS = 'NOT_CONTAINS',
    GREATER_THAN = 'GREATER_THAN',
    LESS_THAN = 'LESS_THAN',
    IS_EMPTY = 'IS_EMPTY',
    IS_NOT_EMPTY = 'IS_NOT_EMPTY',
    BETWEEN = 'BETWEEN',
    TODAY = 'TODAY',
    YESTERDAY = 'YESTERDAY',
    TOMORROW = 'TOMORROW',
    NEXT_MONTH = 'NEXT_MONTH',
    LAST_MONTH = 'LAST_MONTH',
    START_ON = 'START_ON',
    START_BEFORE = 'START_BEFORE',
    START_AFTER = 'START_AFTER',
    END_ON = 'END_ON',
    END_BEFORE = 'END_BEFORE',
    END_AFTER = 'END_AFTER',
    VALUES_COUNT_EQUAL = 'VALUES_COUNT_EQUAL',
    VALUES_COUNT_GREATER_THAN = 'VALUES_COUNT_GREATER_THAN',
    VALUES_COUNT_LOWER_THAN = 'VALUES_COUNT_LOWER_THAN'
}

export enum TreeCondition {
    CLASSIFIED_IN = 'CLASSIFIED_IN',
    NOT_CLASSIFIED_IN = 'NOT_CLASSIFIED_IN'
}

export interface IDateFilterValue {
    from: number;
    to: number;
}

export interface IRecordFilterOption {
    attributes?: IAttributeWithRevLink[];
    value?: string | number | boolean;
    condition?: AttributeCondition | TreeCondition;
    operator?: Operator;
    treeId?: string;
}

export interface IRecordSort {
    attributes: IAttributeWithRevLink[];
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
    treeColorPreview?: string;
    nickname?: string;
}
