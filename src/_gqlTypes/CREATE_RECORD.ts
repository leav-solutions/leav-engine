/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {AvailableLanguage} from './globalTypes';

// ====================================================
// GraphQL mutation operation: CREATE_RECORD
// ====================================================

export interface CREATE_RECORD_createRecord_whoAmI_library {
    id: string;
    label: any | null;
}

export interface CREATE_RECORD_createRecord_whoAmI {
    id: string;
    library: CREATE_RECORD_createRecord_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: string | null;
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
    lang?: AvailableLanguage[] | null;
}
