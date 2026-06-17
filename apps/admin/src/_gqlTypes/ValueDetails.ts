/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ValueDetails
// ====================================================

export interface ValueDetails_Value_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface ValueDetails_Value_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: ValueDetails_Value_version_treeNode_record_whoAmI_library;
}

export interface ValueDetails_Value_version_treeNode_record {
    id: string;
    whoAmI: ValueDetails_Value_version_treeNode_record_whoAmI;
}

export interface ValueDetails_Value_version_treeNode {
    id: string;
    record: ValueDetails_Value_version_treeNode_record | null;
}

export interface ValueDetails_Value_version {
    treeId: string;
    treeNode: ValueDetails_Value_version_treeNode | null;
}

export interface ValueDetails_Value_metadata_value {
    value: Any | null;
    raw_value: Any | null;
}

export interface ValueDetails_Value_metadata {
    name: string;
    value: ValueDetails_Value_metadata_value | null;
}

export interface ValueDetails_Value {
    id_value: string | null;
    created_at: number | null;
    modified_at: number | null;
    version: (ValueDetails_Value_version | null)[] | null;
    metadata: (ValueDetails_Value_metadata | null)[] | null;
    value: Any | null;
    raw_value: Any | null;
}

export interface ValueDetails_LinkValue_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface ValueDetails_LinkValue_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: ValueDetails_LinkValue_version_treeNode_record_whoAmI_library;
}

export interface ValueDetails_LinkValue_version_treeNode_record {
    id: string;
    whoAmI: ValueDetails_LinkValue_version_treeNode_record_whoAmI;
}

export interface ValueDetails_LinkValue_version_treeNode {
    id: string;
    record: ValueDetails_LinkValue_version_treeNode_record | null;
}

export interface ValueDetails_LinkValue_version {
    treeId: string;
    treeNode: ValueDetails_LinkValue_version_treeNode | null;
}

export interface ValueDetails_LinkValue_metadata_value {
    value: Any | null;
    raw_value: Any | null;
}

export interface ValueDetails_LinkValue_metadata {
    name: string;
    value: ValueDetails_LinkValue_metadata_value | null;
}

export interface ValueDetails_LinkValue_linkValue_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface ValueDetails_LinkValue_linkValue_whoAmI {
    id: string;
    library: ValueDetails_LinkValue_linkValue_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface ValueDetails_LinkValue_linkValue {
    whoAmI: ValueDetails_LinkValue_linkValue_whoAmI;
}

export interface ValueDetails_LinkValue {
    id_value: string | null;
    created_at: number | null;
    modified_at: number | null;
    version: (ValueDetails_LinkValue_version | null)[] | null;
    metadata: (ValueDetails_LinkValue_metadata | null)[] | null;
    linkValue: ValueDetails_LinkValue_linkValue | null;
}

export interface ValueDetails_TreeValue_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface ValueDetails_TreeValue_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: ValueDetails_TreeValue_version_treeNode_record_whoAmI_library;
}

export interface ValueDetails_TreeValue_version_treeNode_record {
    id: string;
    whoAmI: ValueDetails_TreeValue_version_treeNode_record_whoAmI;
}

export interface ValueDetails_TreeValue_version_treeNode {
    id: string;
    record: ValueDetails_TreeValue_version_treeNode_record | null;
}

export interface ValueDetails_TreeValue_version {
    treeId: string;
    treeNode: ValueDetails_TreeValue_version_treeNode | null;
}

export interface ValueDetails_TreeValue_metadata_value {
    value: Any | null;
    raw_value: Any | null;
}

export interface ValueDetails_TreeValue_metadata {
    name: string;
    value: ValueDetails_TreeValue_metadata_value | null;
}

export interface ValueDetails_TreeValue_treeValue_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface ValueDetails_TreeValue_treeValue_record_whoAmI {
    id: string;
    library: ValueDetails_TreeValue_treeValue_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface ValueDetails_TreeValue_treeValue_record {
    whoAmI: ValueDetails_TreeValue_treeValue_record_whoAmI;
}

export interface ValueDetails_TreeValue_treeValue_ancestors_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface ValueDetails_TreeValue_treeValue_ancestors_record_whoAmI {
    id: string;
    library: ValueDetails_TreeValue_treeValue_ancestors_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface ValueDetails_TreeValue_treeValue_ancestors_record {
    whoAmI: ValueDetails_TreeValue_treeValue_ancestors_record_whoAmI;
}

export interface ValueDetails_TreeValue_treeValue_ancestors {
    record: ValueDetails_TreeValue_treeValue_ancestors_record | null;
}

export interface ValueDetails_TreeValue_treeValue {
    record: ValueDetails_TreeValue_treeValue_record | null;
    ancestors: ValueDetails_TreeValue_treeValue_ancestors[] | null;
}

export interface ValueDetails_TreeValue {
    id_value: string | null;
    created_at: number | null;
    modified_at: number | null;
    version: (ValueDetails_TreeValue_version | null)[] | null;
    metadata: (ValueDetails_TreeValue_metadata | null)[] | null;
    treeValue: ValueDetails_TreeValue_treeValue | null;
}

export type ValueDetails = ValueDetails_Value | ValueDetails_LinkValue | ValueDetails_TreeValue;
