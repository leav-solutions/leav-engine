// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL mutation operation: CREATE_RECORD
// ====================================================

export interface CREATE_RECORD_createRecord_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface CREATE_RECORD_createRecord_record_whoAmI {
    id: string;
    library: CREATE_RECORD_createRecord_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface CREATE_RECORD_createRecord_record {
    id: string;
    whoAmI: CREATE_RECORD_createRecord_record_whoAmI;
}

export interface CREATE_RECORD_createRecord {
    record: CREATE_RECORD_createRecord_record | null;
}

export interface CREATE_RECORD {
    createRecord: CREATE_RECORD_createRecord;
}

export interface CREATE_RECORDVariables {
    library: string;
}
