/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {LibraryBehavior} from './globalTypes';

// ====================================================
// GraphQL mutation operation: CREATE_RECORD
// ====================================================

export interface CREATE_RECORD_createRecord_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface CREATE_RECORD_createRecord_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: CREATE_RECORD_createRecord_whoAmI_library_gqlNames;
}

export interface CREATE_RECORD_createRecord_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: CREATE_RECORD_createRecord_whoAmI_library;
    preview: Preview | null;
}

export interface CREATE_RECORD_createRecord {
    id: string;
    whoAmI: CREATE_RECORD_createRecord_whoAmI;
}

export interface CREATE_RECORD {
    createRecord: CREATE_RECORD_createRecord;
}

export interface CREATE_RECORDVariables {
    library: string;
}
