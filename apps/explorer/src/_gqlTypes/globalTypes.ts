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

export enum RecordFilterCondition {
    BEGIN_WITH = 'BEGIN_WITH',
    CONTAINS = 'CONTAINS',
    END_WITH = 'END_WITH',
    EQUAL = 'EQUAL',
    GREATER_THAN = 'GREATER_THAN',
    LESS_THAN = 'LESS_THAN',
    NOT_CONTAINS = 'NOT_CONTAINS',
    NOT_EQUAL = 'NOT_EQUAL'
}

export enum RecordFilterOperator {
    AND = 'AND',
    CLOSE_BRACKET = 'CLOSE_BRACKET',
    OPEN_BRACKET = 'OPEN_BRACKET',
    OR = 'OR'
}

export interface RecordFilterInput {
    field?: string | null;
    value?: string | null;
    condition?: RecordFilterCondition | null;
    operator?: RecordFilterOperator | null;
}

//==============================================================
// END Enums and Input Objects
//==============================================================
