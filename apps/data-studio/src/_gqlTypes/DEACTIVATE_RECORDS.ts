/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {RecordFilterInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: DEACTIVATE_RECORDS
// ====================================================

export interface DEACTIVATE_RECORDS_deactivateRecords {
    id: string;
}

export interface DEACTIVATE_RECORDS {
    deactivateRecords: DEACTIVATE_RECORDS_deactivateRecords[];
}

export interface DEACTIVATE_RECORDSVariables {
    libraryId: string;
    recordsIds?: string[] | null;
    filters?: RecordFilterInput[] | null;
}
