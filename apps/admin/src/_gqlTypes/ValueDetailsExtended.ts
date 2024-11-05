// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ValueDetailsExtended
// ====================================================

export interface ValueDetailsExtended_Value_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface ValueDetailsExtended_Value_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: ValueDetailsExtended_Value_version_treeNode_record_whoAmI_library;
}

export interface ValueDetailsExtended_Value_version_treeNode_record {
    id: string;
    whoAmI: ValueDetailsExtended_Value_version_treeNode_record_whoAmI;
}

export interface ValueDetailsExtended_Value_version_treeNode {
    id: string;
    record: ValueDetailsExtended_Value_version_treeNode_record | null;
}

export interface ValueDetailsExtended_Value_version {
    treeId: string;
    treeNode: ValueDetailsExtended_Value_version_treeNode | null;
}

export interface ValueDetailsExtended_Value_metadata_value {
    value: Any | null;
    raw_value: Any | null;
}

export interface ValueDetailsExtended_Value_metadata {
    name: string;
    value: ValueDetailsExtended_Value_metadata_value | null;
}

export interface ValueDetailsExtended_Value {
    id_value: string | null;
    created_at: number | null;
    modified_at: number | null;
    version: (ValueDetailsExtended_Value_version | null)[] | null;
    metadata: (ValueDetailsExtended_Value_metadata | null)[] | null;
}

export interface ValueDetailsExtended_LinkValue_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface ValueDetailsExtended_LinkValue_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: ValueDetailsExtended_LinkValue_version_treeNode_record_whoAmI_library;
}

export interface ValueDetailsExtended_LinkValue_version_treeNode_record {
    id: string;
    whoAmI: ValueDetailsExtended_LinkValue_version_treeNode_record_whoAmI;
}

export interface ValueDetailsExtended_LinkValue_version_treeNode {
    id: string;
    record: ValueDetailsExtended_LinkValue_version_treeNode_record | null;
}

export interface ValueDetailsExtended_LinkValue_version {
    treeId: string;
    treeNode: ValueDetailsExtended_LinkValue_version_treeNode | null;
}

export interface ValueDetailsExtended_LinkValue_metadata_value {
    value: Any | null;
    raw_value: Any | null;
}

export interface ValueDetailsExtended_LinkValue_metadata {
    name: string;
    value: ValueDetailsExtended_LinkValue_metadata_value | null;
}

export interface ValueDetailsExtended_LinkValue_linkValue_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface ValueDetailsExtended_LinkValue_linkValue_whoAmI {
    id: string;
    library: ValueDetailsExtended_LinkValue_linkValue_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface ValueDetailsExtended_LinkValue_linkValue {
    whoAmI: ValueDetailsExtended_LinkValue_linkValue_whoAmI;
}

export interface ValueDetailsExtended_LinkValue {
    id_value: string | null;
    created_at: number | null;
    modified_at: number | null;
    version: (ValueDetailsExtended_LinkValue_version | null)[] | null;
    metadata: (ValueDetailsExtended_LinkValue_metadata | null)[] | null;
    linkValue: ValueDetailsExtended_LinkValue_linkValue | null;
}

export interface ValueDetailsExtended_TreeValue_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface ValueDetailsExtended_TreeValue_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: ValueDetailsExtended_TreeValue_version_treeNode_record_whoAmI_library;
}

export interface ValueDetailsExtended_TreeValue_version_treeNode_record {
    id: string;
    whoAmI: ValueDetailsExtended_TreeValue_version_treeNode_record_whoAmI;
}

export interface ValueDetailsExtended_TreeValue_version_treeNode {
    id: string;
    record: ValueDetailsExtended_TreeValue_version_treeNode_record | null;
}

export interface ValueDetailsExtended_TreeValue_version {
    treeId: string;
    treeNode: ValueDetailsExtended_TreeValue_version_treeNode | null;
}

export interface ValueDetailsExtended_TreeValue_metadata_value {
    value: Any | null;
    raw_value: Any | null;
}

export interface ValueDetailsExtended_TreeValue_metadata {
    name: string;
    value: ValueDetailsExtended_TreeValue_metadata_value | null;
}

export interface ValueDetailsExtended_TreeValue_treeValue_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface ValueDetailsExtended_TreeValue_treeValue_record_whoAmI {
    id: string;
    library: ValueDetailsExtended_TreeValue_treeValue_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface ValueDetailsExtended_TreeValue_treeValue_record {
    whoAmI: ValueDetailsExtended_TreeValue_treeValue_record_whoAmI;
}

export interface ValueDetailsExtended_TreeValue_treeValue_ancestors_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface ValueDetailsExtended_TreeValue_treeValue_ancestors_record_whoAmI {
    id: string;
    library: ValueDetailsExtended_TreeValue_treeValue_ancestors_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface ValueDetailsExtended_TreeValue_treeValue_ancestors_record {
    whoAmI: ValueDetailsExtended_TreeValue_treeValue_ancestors_record_whoAmI;
}

export interface ValueDetailsExtended_TreeValue_treeValue_ancestors {
    record: ValueDetailsExtended_TreeValue_treeValue_ancestors_record | null;
}

export interface ValueDetailsExtended_TreeValue_treeValue {
    record: ValueDetailsExtended_TreeValue_treeValue_record | null;
    ancestors: ValueDetailsExtended_TreeValue_treeValue_ancestors[] | null;
}

export interface ValueDetailsExtended_TreeValue {
    id_value: string | null;
    created_at: number | null;
    modified_at: number | null;
    version: (ValueDetailsExtended_TreeValue_version | null)[] | null;
    metadata: (ValueDetailsExtended_TreeValue_metadata | null)[] | null;
    treeValue: ValueDetailsExtended_TreeValue_treeValue | null;
}

export type ValueDetailsExtended =
    | ValueDetailsExtended_Value
    | ValueDetailsExtended_LinkValue
    | ValueDetailsExtended_TreeValue;
