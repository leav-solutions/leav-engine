// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
// Copyright LEAV Solutions 2017

import {gql} from '@apollo/client';

export interface IGetRecordsListQueryElement {
    whoAmI: {
        id: string;
        label: string;
        color: string;
        preview: {
            small: string;
            medium: string;
            pdf: string;
            big: string;
        };
        library: {
            id: string;
            label: SystemTranslation;
        };
    };
}

export interface IGetRecordsListQuery {
    records: {
        list: IGetRecordsListQueryElement[];
        totalCount: number;
    };
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

export interface IRecordFilterInput {
    field?: string | null;
    value?: string | null;
    condition?: RecordFilterCondition | null;
    operator?: RecordFilterOperator | null;
    treeId?: string | null;
}

export interface IRecordsPagination {
    limit: number;
    offset?: number;
    cursor?: string;
}

export interface IGetRecordsListQueryVariables {
    library: string;
    filters: IRecordFilterInput[];
    pagination: IRecordsPagination;
}

export const getRecordsListQuery = gql`
    query RECORDS_LIST($library: ID!, $filters: [RecordFilterInput], $pagination: RecordsPagination) {
        records(library: $library, filters: $filters, pagination: $pagination) {
            totalCount
            list {
                whoAmI {
                    id
                    label
                    color
                    preview
                    library {
                        id
                        label
                    }
                }
            }
        }
    }
`;
