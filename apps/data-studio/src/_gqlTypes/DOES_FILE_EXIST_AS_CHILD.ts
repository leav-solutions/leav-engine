/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: DOES_FILE_EXIST_AS_CHILD
// ====================================================

export interface DOES_FILE_EXIST_AS_CHILD {
    doesFileExistAsChild: boolean | null;
}

export interface DOES_FILE_EXIST_AS_CHILDVariables {
    parentNode?: string | null;
    treeId: string;
    filename: string;
}
