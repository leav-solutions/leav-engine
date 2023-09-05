// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {RecordUpdateFilterInput, LibraryBehavior} from './globalTypes';

// ====================================================
// GraphQL subscription operation: SUB_RECORD_UPDATE
// ====================================================

export interface SUB_RECORD_UPDATE_recordUpdate_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: SUB_RECORD_UPDATE_recordUpdate_whoAmI_library_gqlNames;
}

export interface SUB_RECORD_UPDATE_recordUpdate_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_whoAmI_library;
    preview: Preview | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_whoAmI;
}

export interface SUB_RECORD_UPDATE {
    recordUpdate: SUB_RECORD_UPDATE_recordUpdate;
}

export interface SUB_RECORD_UPDATEVariables {
    filters?: RecordUpdateFilterInput | null;
}
