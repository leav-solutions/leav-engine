/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DELETE_VALUE
// ====================================================

export interface DELETE_VALUE_deleteValue_attribute {
    id: string;
}

export interface DELETE_VALUE_deleteValue {
    attribute: DELETE_VALUE_deleteValue_attribute | null;
    id_value: string | null;
}

export interface DELETE_VALUE {
    deleteValue: DELETE_VALUE_deleteValue;
}

export interface DELETE_VALUEVariables {
    library: string;
    recordId: string;
    attribute: string;
    valueId?: string | null;
}
