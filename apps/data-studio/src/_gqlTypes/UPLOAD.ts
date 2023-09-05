// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {FileInput, LibraryBehavior} from './globalTypes';

// ====================================================
// GraphQL mutation operation: UPLOAD
// ====================================================

export interface UPLOAD_upload_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface UPLOAD_upload_record_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: UPLOAD_upload_record_whoAmI_library_gqlNames;
}

export interface UPLOAD_upload_record_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: UPLOAD_upload_record_whoAmI_library;
    preview: Preview | null;
}

export interface UPLOAD_upload_record {
    id: string;
    whoAmI: UPLOAD_upload_record_whoAmI;
}

export interface UPLOAD_upload {
    uid: string;
    record: UPLOAD_upload_record;
}

export interface UPLOAD {
    upload: UPLOAD_upload[];
}

export interface UPLOADVariables {
    library: string;
    nodeId: string;
    files: FileInput[];
}
