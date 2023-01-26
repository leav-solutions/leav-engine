// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {FileInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: UPLOAD
// ====================================================

export interface UPLOAD_upload {
    uid: string;
    recordId: string;
}

export interface UPLOAD {
    upload: UPLOAD_upload[];
}

export interface UPLOADVariables {
    library: string;
    nodeId: string;
    files: FileInput[];
}
