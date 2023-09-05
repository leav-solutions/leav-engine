/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ValueInput, AttributeFormat, AttributeType} from './globalTypes';

// ====================================================
// GraphQL mutation operation: DELETE_VALUE
// ====================================================

export interface DELETE_VALUE_deleteValue_attribute {
    id: string;
    format: AttributeFormat | null;
    type: AttributeType;
    system: boolean;
}

export interface DELETE_VALUE_deleteValue {
    id_value: string | null;
    attribute: DELETE_VALUE_deleteValue_attribute | null;
}

export interface DELETE_VALUE {
    deleteValue: DELETE_VALUE_deleteValue;
}

export interface DELETE_VALUEVariables {
    library: string;
    recordId: string;
    attribute: string;
    value?: ValueInput | null;
}
