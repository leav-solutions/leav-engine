/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ValueVersionInput, ValueBatchInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_VALUE_BATCH
// ====================================================

export interface SAVE_VALUE_BATCH_saveValueBatch_values_Value_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_Value_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: SAVE_VALUE_BATCH_saveValueBatch_values_Value_version_treeNode_record_whoAmI_library;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_Value_version_treeNode_record {
    id: string;
    whoAmI: SAVE_VALUE_BATCH_saveValueBatch_values_Value_version_treeNode_record_whoAmI;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_Value_version_treeNode {
    id: string;
    record: SAVE_VALUE_BATCH_saveValueBatch_values_Value_version_treeNode_record | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_Value_version {
    treeId: string;
    treeNode: SAVE_VALUE_BATCH_saveValueBatch_values_Value_version_treeNode | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_Value_attribute {
    id: string;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_Value {
    id_value: string | null;
    modified_at: number | null;
    created_at: number | null;
    version: (SAVE_VALUE_BATCH_saveValueBatch_values_Value_version | null)[] | null;
    attribute: SAVE_VALUE_BATCH_saveValueBatch_values_Value_attribute | null;
    value: Any | null;
    raw_value: Any | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_version_treeNode_record_whoAmI_library;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_version_treeNode_record {
    id: string;
    whoAmI: SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_version_treeNode_record_whoAmI;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_version_treeNode {
    id: string;
    record: SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_version_treeNode_record | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_version {
    treeId: string;
    treeNode: SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_version_treeNode | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_attribute {
    id: string;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_linkValue_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_linkValue_whoAmI {
    id: string;
    library: SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_linkValue_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_linkValue {
    whoAmI: SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_linkValue_whoAmI;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue {
    id_value: string | null;
    modified_at: number | null;
    created_at: number | null;
    version: (SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_version | null)[] | null;
    attribute: SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_attribute | null;
    linkValue: SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue_linkValue | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_version_treeNode_record_whoAmI_library;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_version_treeNode_record {
    id: string;
    whoAmI: SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_version_treeNode_record_whoAmI;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_version_treeNode {
    id: string;
    record: SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_version_treeNode_record | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_version {
    treeId: string;
    treeNode: SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_version_treeNode | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_attribute {
    id: string;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_treeValue_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_treeValue_record_whoAmI {
    id: string;
    library: SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_treeValue_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_treeValue_record {
    whoAmI: SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_treeValue_record_whoAmI;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_treeValue_ancestors_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_treeValue_ancestors_record_whoAmI {
    id: string;
    library: SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_treeValue_ancestors_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_treeValue_ancestors_record {
    whoAmI: SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_treeValue_ancestors_record_whoAmI;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_treeValue_ancestors {
    record: SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_treeValue_ancestors_record | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_treeValue {
    record: SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_treeValue_record | null;
    ancestors: SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_treeValue_ancestors[] | null;
}

export interface SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue {
    id_value: string | null;
    modified_at: number | null;
    created_at: number | null;
    version: (SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_version | null)[] | null;
    attribute: SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_attribute | null;
    treeValue: SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue_treeValue | null;
}

export type SAVE_VALUE_BATCH_saveValueBatch_values =
    | SAVE_VALUE_BATCH_saveValueBatch_values_Value
    | SAVE_VALUE_BATCH_saveValueBatch_values_LinkValue
    | SAVE_VALUE_BATCH_saveValueBatch_values_TreeValue;

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
