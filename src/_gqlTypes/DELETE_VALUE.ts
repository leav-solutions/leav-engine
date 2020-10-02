/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {ValueInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: DELETE_VALUE
// ====================================================

export interface DELETE_VALUE_deleteValue {
    attribute: string | null;
    id_value: string | null;
    value: any | null;
}

export interface DELETE_VALUE {
    deleteValue: DELETE_VALUE_deleteValue;
}

export interface DELETE_VALUEVariables {
    library?: string | null;
    recordId?: string | null;
    attribute?: string | null;
    value?: ValueInput | null;
}
