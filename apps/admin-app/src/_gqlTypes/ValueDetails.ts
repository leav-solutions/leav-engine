// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ValueDetails
// ====================================================

export interface ValueDetails_Value_metadata_value {
    value: any | null;
    raw_value: any | null;
}

export interface ValueDetails_Value_metadata {
    name: string;
    value: ValueDetails_Value_metadata_value | null;
}

export interface ValueDetails_Value {
    id_value: string | null;
    created_at: number | null;
    modified_at: number | null;
    version: any | null;
    metadata: (ValueDetails_Value_metadata | null)[] | null;
    value: any | null;
    raw_value: any | null;
}

export interface ValueDetails_LinkValue_metadata_value {
    value: any | null;
    raw_value: any | null;
}

export interface ValueDetails_LinkValue_metadata {
    name: string;
    value: ValueDetails_LinkValue_metadata_value | null;
}

export interface ValueDetails_LinkValue_linkValue_whoAmI_library {
    id: string;
    label: any | null;
}

export interface ValueDetails_LinkValue_linkValue_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
}

export interface ValueDetails_LinkValue_linkValue_whoAmI {
    id: string;
    library: ValueDetails_LinkValue_linkValue_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: ValueDetails_LinkValue_linkValue_whoAmI_preview | null;
}

export interface ValueDetails_LinkValue_linkValue {
    whoAmI: ValueDetails_LinkValue_linkValue_whoAmI;
}

export interface ValueDetails_LinkValue {
    id_value: string | null;
    created_at: number | null;
    modified_at: number | null;
    version: any | null;
    metadata: (ValueDetails_LinkValue_metadata | null)[] | null;
    linkValue: ValueDetails_LinkValue_linkValue;
}

export interface ValueDetails_TreeValue_metadata_value {
    value: any | null;
    raw_value: any | null;
}

export interface ValueDetails_TreeValue_metadata {
    name: string;
    value: ValueDetails_TreeValue_metadata_value | null;
}

export interface ValueDetails_TreeValue_treeValue_record_whoAmI_library {
    id: string;
    label: any | null;
}

export interface ValueDetails_TreeValue_treeValue_record_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
}

export interface ValueDetails_TreeValue_treeValue_record_whoAmI {
    id: string;
    library: ValueDetails_TreeValue_treeValue_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: ValueDetails_TreeValue_treeValue_record_whoAmI_preview | null;
}

export interface ValueDetails_TreeValue_treeValue_record {
    whoAmI: ValueDetails_TreeValue_treeValue_record_whoAmI;
}

export interface ValueDetails_TreeValue_treeValue_ancestors_record_whoAmI_library {
    id: string;
    label: any | null;
}

export interface ValueDetails_TreeValue_treeValue_ancestors_record_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
}

export interface ValueDetails_TreeValue_treeValue_ancestors_record_whoAmI {
    id: string;
    library: ValueDetails_TreeValue_treeValue_ancestors_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: ValueDetails_TreeValue_treeValue_ancestors_record_whoAmI_preview | null;
}

export interface ValueDetails_TreeValue_treeValue_ancestors_record {
    whoAmI: ValueDetails_TreeValue_treeValue_ancestors_record_whoAmI;
}

export interface ValueDetails_TreeValue_treeValue_ancestors {
    record: ValueDetails_TreeValue_treeValue_ancestors_record;
}

export interface ValueDetails_TreeValue_treeValue {
    record: ValueDetails_TreeValue_treeValue_record;
    ancestors: ValueDetails_TreeValue_treeValue_ancestors[] | null;
}

export interface ValueDetails_TreeValue {
    id_value: string | null;
    created_at: number | null;
    modified_at: number | null;
    version: any | null;
    metadata: (ValueDetails_TreeValue_metadata | null)[] | null;
    treeValue: ValueDetails_TreeValue_treeValue;
}

export type ValueDetails = ValueDetails_Value | ValueDetails_LinkValue | ValueDetails_TreeValue;
