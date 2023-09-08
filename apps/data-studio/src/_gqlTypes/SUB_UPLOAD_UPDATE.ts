// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {UploadFiltersInput} from './globalTypes';

// ====================================================
// GraphQL subscription operation: SUB_UPLOAD_UPDATE
// ====================================================

export interface SUB_UPLOAD_UPDATE_upload_progress {
    length: number | null;
    transferred: number | null;
    speed: number | null;
    runtime: number | null;
    remaining: number | null;
    percentage: number | null;
    eta: number | null;
    delta: number | null;
}

export interface SUB_UPLOAD_UPDATE_upload {
    userId: string;
    progress: SUB_UPLOAD_UPDATE_upload_progress;
    uid: string;
}

export interface SUB_UPLOAD_UPDATE {
    upload: SUB_UPLOAD_UPDATE_upload;
}

export interface SUB_UPLOAD_UPDATEVariables {
    filters?: UploadFiltersInput | null;
}
