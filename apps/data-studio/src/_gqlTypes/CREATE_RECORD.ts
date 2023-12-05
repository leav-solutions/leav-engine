// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {CreateRecordDataInput, LibraryBehavior} from './globalTypes';

// ====================================================
// GraphQL mutation operation: CREATE_RECORD
// ====================================================

export interface CREATE_RECORD_createRecord_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface CREATE_RECORD_createRecord_record_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
}

export interface CREATE_RECORD_createRecord_record_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: CREATE_RECORD_createRecord_record_whoAmI_library;
    preview: Preview | null;
}

export interface CREATE_RECORD_createRecord_record {
    id: string;
    whoAmI: CREATE_RECORD_createRecord_record_whoAmI;
}

export interface CREATE_RECORD_createRecord_valuesErrors {
    attributeId: string;
    id_value: string | null;
    input: string | null;
    message: string | null;
    type: string;
}

export interface CREATE_RECORD_createRecord {
    record: CREATE_RECORD_createRecord_record | null;
    valuesErrors: CREATE_RECORD_createRecord_valuesErrors[] | null;
}

export interface CREATE_RECORD {
    createRecord: CREATE_RECORD_createRecord;
}

export interface CREATE_RECORDVariables {
    library: string;
    data?: CreateRecordDataInput | null;
}
