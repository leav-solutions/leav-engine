/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ValueDetails
// ====================================================

export interface ValueDetails_Value {
    id_value: string | null;
    created_at: number | null;
    modified_at: number | null;
    version: any | null;
    metadata: any | null;
    value: string | null;
    raw_value: string | null;
}

export interface ValueDetails_LinkValue_linkValue_whoAmI_library {
    id: string;
    label: any | null;
}

export interface ValueDetails_LinkValue_linkValue_whoAmI {
    id: string;
    library: ValueDetails_LinkValue_linkValue_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: string | null;
}

export interface ValueDetails_LinkValue_linkValue {
    whoAmI: ValueDetails_LinkValue_linkValue_whoAmI;
}

export interface ValueDetails_LinkValue {
    id_value: string | null;
    created_at: number | null;
    modified_at: number | null;
    version: any | null;
    metadata: any | null;
    linkValue: ValueDetails_LinkValue_linkValue;
}

export interface ValueDetails_TreeValue_treeValue_record_whoAmI_library {
    id: string;
    label: any | null;
}

export interface ValueDetails_TreeValue_treeValue_record_whoAmI {
    id: string;
    library: ValueDetails_TreeValue_treeValue_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: string | null;
}

export interface ValueDetails_TreeValue_treeValue_record {
    whoAmI: ValueDetails_TreeValue_treeValue_record_whoAmI;
}

export interface ValueDetails_TreeValue_treeValue_ancestors_record_whoAmI_library {
    id: string;
    label: any | null;
}

export interface ValueDetails_TreeValue_treeValue_ancestors_record_whoAmI {
    id: string;
    library: ValueDetails_TreeValue_treeValue_ancestors_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: string | null;
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
    metadata: any | null;
    treeValue: ValueDetails_TreeValue_treeValue;
}

export type ValueDetails = ValueDetails_Value | ValueDetails_LinkValue | ValueDetails_TreeValue;
