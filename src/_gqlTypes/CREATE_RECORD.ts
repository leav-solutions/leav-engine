/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {AvailableLanguage} from './globalTypes';

// ====================================================
// GraphQL mutation operation: CREATE_RECORD
// ====================================================

export interface CREATE_RECORD_createRecord_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface CREATE_RECORD_createRecord_whoAmI_preview {
    small: string | null;
    medium: string | null;
    pages: string | null;
    big: string | null;
}

export interface CREATE_RECORD_createRecord_whoAmI {
    id: string;
    library: CREATE_RECORD_createRecord_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: CREATE_RECORD_createRecord_whoAmI_preview | null;
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
