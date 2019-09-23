/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {ValueVersionInput, ValueBatchInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_VALUE_BATCH
// ====================================================

export interface SAVE_VALUE_BATCH_saveValueBatch_values {
    id_value: string | null;
    value: string | null;
    raw_value: string | null;
    modified_at: number | null;
    created_at: number | null;
    version: any | null;
    attribute: string | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_errors {
    type: string;
    attribute: string;
    input: string | null;
    message: string;
}

export interface SAVE_VALUE_BATCH_saveValueBatch {
    values: SAVE_VALUE_BATCH_saveValueBatch_values[] | null;
    errors: SAVE_VALUE_BATCH_saveValueBatch_errors[] | null;
}

export interface SAVE_VALUE_BATCH {
    /**
     * Save values for several attributes at once
     */
    saveValueBatch: SAVE_VALUE_BATCH_saveValueBatch;
}

export interface SAVE_VALUE_BATCHVariables {
    library: string;
    recordId: string;
    version?: ValueVersionInput[] | null;
    values: ValueBatchInput[];
}
