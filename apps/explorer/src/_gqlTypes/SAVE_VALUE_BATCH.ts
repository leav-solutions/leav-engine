// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ValueVersionInput, ValueBatchInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_VALUE_BATCH
// ====================================================

export interface SAVE_VALUE_BATCH_saveValueBatch_values {
    id_value: string | null;
    value: any | null;
    raw_value: any | null;
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
     * Save values for several attributes at once.
     * If deleteEmpty is true, empty values will be deleted
     */
    saveValueBatch: SAVE_VALUE_BATCH_saveValueBatch;
}

export interface SAVE_VALUE_BATCHVariables {
    library: string;
    recordId: string;
    version?: ValueVersionInput[] | null;
    values: ValueBatchInput[];
}
