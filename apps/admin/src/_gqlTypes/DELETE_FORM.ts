// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
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
