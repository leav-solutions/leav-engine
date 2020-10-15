/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: ValueDetailsExtended
// ====================================================

export interface ValueDetailsExtended_Value {
    id_value: string | null;
    created_at: number | null;
    modified_at: number | null;
    version: ValueVersion | null;
    metadata: ValueMetadata | null;
}

export interface ValueDetailsExtended_LinkValue_linkValue_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface ValueDetailsExtended_LinkValue_linkValue_whoAmI_preview {
    small: string | null;
    medium: string | null;
    pages: string | null;
    big: string | null;
}

export interface ValueDetailsExtended_LinkValue_linkValue_whoAmI {
    id: string;
    library: ValueDetailsExtended_LinkValue_linkValue_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: ValueDetailsExtended_LinkValue_linkValue_whoAmI_preview | null;
}

export interface ValueDetailsExtended_LinkValue_linkValue {
    whoAmI: ValueDetailsExtended_LinkValue_linkValue_whoAmI;
}

export interface ValueDetailsExtended_LinkValue {
    id_value: string | null;
    created_at: number | null;
    modified_at: number | null;
    version: ValueVersion | null;
    metadata: ValueMetadata | null;
    linkValue: ValueDetailsExtended_LinkValue_linkValue;
}

export interface ValueDetailsExtended_TreeValue_treeValue_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface ValueDetailsExtended_TreeValue_treeValue_record_whoAmI_preview {
    small: string | null;
    medium: string | null;
    pages: string | null;
    big: string | null;
}

export interface ValueDetailsExtended_TreeValue_treeValue_record_whoAmI {
    id: string;
    library: ValueDetailsExtended_TreeValue_treeValue_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: ValueDetailsExtended_TreeValue_treeValue_record_whoAmI_preview | null;
}

export interface ValueDetailsExtended_TreeValue_treeValue_record {
    whoAmI: ValueDetailsExtended_TreeValue_treeValue_record_whoAmI;
}

export interface ValueDetailsExtended_TreeValue_treeValue_ancestors_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface ValueDetailsExtended_TreeValue_treeValue_ancestors_record_whoAmI_preview {
    small: string | null;
    medium: string | null;
    pages: string | null;
    big: string | null;
}

export interface ValueDetailsExtended_TreeValue_treeValue_ancestors_record_whoAmI {
    id: string;
    library: ValueDetailsExtended_TreeValue_treeValue_ancestors_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: ValueDetailsExtended_TreeValue_treeValue_ancestors_record_whoAmI_preview | null;
}

export interface ValueDetailsExtended_TreeValue_treeValue_ancestors_record {
    whoAmI: ValueDetailsExtended_TreeValue_treeValue_ancestors_record_whoAmI;
}

export interface ValueDetailsExtended_TreeValue_treeValue_ancestors {
    record: ValueDetailsExtended_TreeValue_treeValue_ancestors_record;
}

export interface ValueDetailsExtended_TreeValue_treeValue {
    record: ValueDetailsExtended_TreeValue_treeValue_record;
    ancestors: ValueDetailsExtended_TreeValue_treeValue_ancestors[] | null;
}

export interface ValueDetailsExtended_TreeValue {
    id_value: string | null;
    created_at: number | null;
    modified_at: number | null;
    version: ValueVersion | null;
    metadata: ValueMetadata | null;
    treeValue: ValueDetailsExtended_TreeValue_treeValue;
}

export type ValueDetailsExtended =
    | ValueDetailsExtended_Value
    | ValueDetailsExtended_LinkValue
    | ValueDetailsExtended_TreeValue;
