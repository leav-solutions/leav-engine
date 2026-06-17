/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: DELETE_FORM
// ====================================================

export interface DELETE_FORM_deleteForm_library {
    id: string;
}

export interface DELETE_FORM_deleteForm {
    library: DELETE_FORM_deleteForm_library;
    id: string;
}

export interface DELETE_FORM {
    deleteForm: DELETE_FORM_deleteForm | null;
}

export interface DELETE_FORMVariables {
    library: string;
    formId: string;
}
