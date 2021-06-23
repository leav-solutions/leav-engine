// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ValueVersionInput, ValueBatchInput, AttributeFormat, AttributeType} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_VALUE_BATCH
// ====================================================

export interface SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_attribute {
    id: string;
    format: AttributeFormat | null;
    type: AttributeType;
    system: boolean;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue {
    id_value: string | null;
    modified_at: number | null;
    created_at: number | null;
    version: any | null;
    attribute: SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_attribute | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_Value_attribute {
    id: string;
    format: AttributeFormat | null;
    type: AttributeType;
    system: boolean;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_Value {
    id_value: string | null;
    modified_at: number | null;
    created_at: number | null;
    version: any | null;
    attribute: SAVE_VALUE_BATCH_saveValueBatch_values_Value_attribute | null;
    value: any | null;
    raw_value: any | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_attribute {
    id: string;
    format: AttributeFormat | null;
    type: AttributeType;
    system: boolean;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_linkValue_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_linkValue_whoAmI_library {
    id: string;
    label: any | null;
    gqlNames: SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_linkValue_whoAmI_library_gqlNames;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_linkValue_whoAmI_preview {
    small: string | null;
    medium: string | null;
    big: string | null;
    pages: string | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_linkValue_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_linkValue_whoAmI_library;
    preview: SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_linkValue_whoAmI_preview | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_linkValue {
    id: string;
    whoAmI: SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_linkValue_whoAmI;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue {
    id_value: string | null;
    modified_at: number | null;
    created_at: number | null;
    version: any | null;
    attribute: SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_attribute | null;
    linkValue: SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_linkValue;
}

export type SAVE_VALUE_BATCH_saveValueBatch_values =
    | SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue
    | SAVE_VALUE_BATCH_saveValueBatch_values_Value
    | SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue;

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
