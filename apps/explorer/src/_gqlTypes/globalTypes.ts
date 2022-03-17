// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

//==============================================================
// START Enums and Input Objects
//==============================================================

export enum AttributeFormat {
    boolean = 'boolean',
    date = 'date',
    date_range = 'date_range',
    encrypted = 'encrypted',
    extended = 'extended',
    numeric = 'numeric',
    text = 'text'
}

export enum AttributeType {
    advanced = 'advanced',
    advanced_link = 'advanced_link',
    simple = 'simple',
    simple_link = 'simple_link',
    tree = 'tree'
}

export enum FormElementTypes {
    field = 'field',
    layout = 'layout'
}

export enum RecordFilterCondition {
    BEGIN_WITH = 'BEGIN_WITH',
    BETWEEN = 'BETWEEN',
    CLASSIFIED_IN = 'CLASSIFIED_IN',
    CONTAINS = 'CONTAINS',
    END_AFTER = 'END_AFTER',
    END_BEFORE = 'END_BEFORE',
    END_ON = 'END_ON',
    END_WITH = 'END_WITH',
    EQUAL = 'EQUAL',
    GREATER_THAN = 'GREATER_THAN',
    IS_EMPTY = 'IS_EMPTY',
    IS_NOT_EMPTY = 'IS_NOT_EMPTY',
    LAST_MONTH = 'LAST_MONTH',
    LESS_THAN = 'LESS_THAN',
    NEXT_MONTH = 'NEXT_MONTH',
    NOT_CLASSIFIED_IN = 'NOT_CLASSIFIED_IN',
    NOT_CONTAINS = 'NOT_CONTAINS',
    NOT_EQUAL = 'NOT_EQUAL',
    START_AFTER = 'START_AFTER',
    START_BEFORE = 'START_BEFORE',
    START_ON = 'START_ON',
    TODAY = 'TODAY',
    TOMORROW = 'TOMORROW',
    VALUES_COUNT_EQUAL = 'VALUES_COUNT_EQUAL',
    VALUES_COUNT_GREATER_THAN = 'VALUES_COUNT_GREATER_THAN',
    VALUES_COUNT_LOWER_THAN = 'VALUES_COUNT_LOWER_THAN',
    YESTERDAY = 'YESTERDAY'
}

export enum RecordFilterOperator {
    AND = 'AND',
    CLOSE_BRACKET = 'CLOSE_BRACKET',
    OPEN_BRACKET = 'OPEN_BRACKET',
    OR = 'OR'
}

export enum SortOrder {
    asc = 'asc',
    desc = 'desc'
}

export enum ViewSizes {
    BIG = 'BIG',
    MEDIUM = 'MEDIUM',
    SMALL = 'SMALL'
}

export enum ViewTypes {
    cards = 'cards',
    list = 'list',
    timeline = 'timeline'
}

export interface RecordFilterInput {
    field?: string | null;
    value?: string | null;
    condition?: RecordFilterCondition | null;
    operator?: RecordFilterOperator | null;
    treeId?: string | null;
}

export interface RecordSortInput {
    field?: string | null;
    order: SortOrder;
}

export interface TreeElementInput {
    id: string;
    library: string;
}

export interface ValueBatchInput {
    attribute?: string | null;
    id_value?: string | null;
    value?: string | null;
    metadata?: any | null;
}

export interface ValueInput {
    id_value?: string | null;
    value?: string | null;
    metadata?: (ValueMetadataInput | null)[] | null;
    version?: (ValueVersionInput | null)[] | null;
}

export interface ValueMetadataInput {
    name: string;
    value?: string | null;
}

export interface ValueVersionInput {
    name: string;
    value: string;
}

export interface ViewDisplayInput {
    type: ViewTypes;
    size: ViewSizes;
}

export interface ViewInput {
    id?: string | null;
    library: string;
    display: ViewDisplayInput;
    shared: boolean;
    label?: any | null;
    description?: any | null;
    color?: string | null;
    filters?: RecordFilterInput[] | null;
    sort?: RecordSortInput | null;
    settings?: ViewSettingsInput[] | null;
}

export interface ViewSettingsInput {
    name: string;
    value?: any | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
