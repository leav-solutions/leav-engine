// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL fragment: AttributeValuesListDetails
// ====================================================

export interface AttributeValuesListDetails_StandardAttribute_values_list_StandardStringValuesListConf {
    enable: boolean;
    allowFreeEntry: boolean | null;
    values: string[] | null;
}

export interface AttributeValuesListDetails_StandardAttribute_values_list_StandardDateRangeValuesListConf_dateRangeValues {
    from: string | null;
    to: string | null;
}

export interface AttributeValuesListDetails_StandardAttribute_values_list_StandardDateRangeValuesListConf {
    enable: boolean;
    allowFreeEntry: boolean | null;
    dateRangeValues:
        | AttributeValuesListDetails_StandardAttribute_values_list_StandardDateRangeValuesListConf_dateRangeValues[]
        | null;
}

export type AttributeValuesListDetails_StandardAttribute_values_list =
    | AttributeValuesListDetails_StandardAttribute_values_list_StandardStringValuesListConf
    | AttributeValuesListDetails_StandardAttribute_values_list_StandardDateRangeValuesListConf;

export interface AttributeValuesListDetails_StandardAttribute {
    values_list: AttributeValuesListDetails_StandardAttribute_values_list | null;
}

export interface AttributeValuesListDetails_LinkAttribute_values_list_linkValues_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface AttributeValuesListDetails_LinkAttribute_values_list_linkValues_whoAmI_preview {
    small: string | null;
    medium: string | null;
    pdf: string | null;
    big: string | null;
}

export interface AttributeValuesListDetails_LinkAttribute_values_list_linkValues_whoAmI {
    id: string;
    library: AttributeValuesListDetails_LinkAttribute_values_list_linkValues_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: AttributeValuesListDetails_LinkAttribute_values_list_linkValues_whoAmI_preview | null;
}

export interface AttributeValuesListDetails_LinkAttribute_values_list_linkValues {
    whoAmI: AttributeValuesListDetails_LinkAttribute_values_list_linkValues_whoAmI;
}

export interface AttributeValuesListDetails_LinkAttribute_values_list {
    enable: boolean;
    allowFreeEntry: boolean | null;
    linkValues: AttributeValuesListDetails_LinkAttribute_values_list_linkValues[] | null;
}

export interface AttributeValuesListDetails_LinkAttribute {
    values_list: AttributeValuesListDetails_LinkAttribute_values_list | null;
}

export interface AttributeValuesListDetails_TreeAttribute_values_list_treeValues_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface AttributeValuesListDetails_TreeAttribute_values_list_treeValues_record_whoAmI_preview {
    small: string | null;
    medium: string | null;
    pdf: string | null;
    big: string | null;
}

export interface AttributeValuesListDetails_TreeAttribute_values_list_treeValues_record_whoAmI {
    id: string;
    library: AttributeValuesListDetails_TreeAttribute_values_list_treeValues_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: AttributeValuesListDetails_TreeAttribute_values_list_treeValues_record_whoAmI_preview | null;
}

export interface AttributeValuesListDetails_TreeAttribute_values_list_treeValues_record {
    whoAmI: AttributeValuesListDetails_TreeAttribute_values_list_treeValues_record_whoAmI;
}

export interface AttributeValuesListDetails_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface AttributeValuesListDetails_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI_preview {
    small: string | null;
    medium: string | null;
    pdf: string | null;
    big: string | null;
}

export interface AttributeValuesListDetails_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI {
    id: string;
    library: AttributeValuesListDetails_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: AttributeValuesListDetails_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI_preview | null;
}

export interface AttributeValuesListDetails_TreeAttribute_values_list_treeValues_ancestors_record {
    whoAmI: AttributeValuesListDetails_TreeAttribute_values_list_treeValues_ancestors_record_whoAmI;
}

export interface AttributeValuesListDetails_TreeAttribute_values_list_treeValues_ancestors {
    record: AttributeValuesListDetails_TreeAttribute_values_list_treeValues_ancestors_record;
}

export interface AttributeValuesListDetails_TreeAttribute_values_list_treeValues {
    record: AttributeValuesListDetails_TreeAttribute_values_list_treeValues_record;
    ancestors: AttributeValuesListDetails_TreeAttribute_values_list_treeValues_ancestors[] | null;
}

export interface AttributeValuesListDetails_TreeAttribute_values_list {
    enable: boolean;
    allowFreeEntry: boolean | null;
    treeValues: AttributeValuesListDetails_TreeAttribute_values_list_treeValues[] | null;
}

export interface AttributeValuesListDetails_TreeAttribute {
    values_list: AttributeValuesListDetails_TreeAttribute_values_list | null;
}

export type AttributeValuesListDetails =
    | AttributeValuesListDetails_StandardAttribute
    | AttributeValuesListDetails_LinkAttribute
    | AttributeValuesListDetails_TreeAttribute;
