// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ValueInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_VALUE
// ====================================================

export interface SAVE_VALUE_saveValue_TreeValue_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SAVE_VALUE_saveValue_TreeValue_created_by_whoAmI_library {
    id: string;
    label: any | null;
    gqlNames: SAVE_VALUE_saveValue_TreeValue_created_by_whoAmI_library_gqlNames;
}

export interface SAVE_VALUE_saveValue_TreeValue_created_by_whoAmI_preview {
    small: string | null;
    medium: string | null;
    big: string | null;
    pages: string | null;
}

export interface SAVE_VALUE_saveValue_TreeValue_created_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: SAVE_VALUE_saveValue_TreeValue_created_by_whoAmI_library;
    preview: SAVE_VALUE_saveValue_TreeValue_created_by_whoAmI_preview | null;
}

export interface SAVE_VALUE_saveValue_TreeValue_created_by {
    id: string;
    whoAmI: SAVE_VALUE_saveValue_TreeValue_created_by_whoAmI;
}

export interface SAVE_VALUE_saveValue_TreeValue_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SAVE_VALUE_saveValue_TreeValue_modified_by_whoAmI_library {
    id: string;
    label: any | null;
    gqlNames: SAVE_VALUE_saveValue_TreeValue_modified_by_whoAmI_library_gqlNames;
}

export interface SAVE_VALUE_saveValue_TreeValue_modified_by_whoAmI_preview {
    small: string | null;
    medium: string | null;
    big: string | null;
    pages: string | null;
}

export interface SAVE_VALUE_saveValue_TreeValue_modified_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: SAVE_VALUE_saveValue_TreeValue_modified_by_whoAmI_library;
    preview: SAVE_VALUE_saveValue_TreeValue_modified_by_whoAmI_preview | null;
}

export interface SAVE_VALUE_saveValue_TreeValue_modified_by {
    id: string;
    whoAmI: SAVE_VALUE_saveValue_TreeValue_modified_by_whoAmI;
}

export interface SAVE_VALUE_saveValue_TreeValue {
    id_value: string | null;
    created_at: number | null;
    created_by: SAVE_VALUE_saveValue_TreeValue_created_by | null;
    modified_at: number | null;
    modified_by: SAVE_VALUE_saveValue_TreeValue_modified_by | null;
}

export interface SAVE_VALUE_saveValue_Value_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SAVE_VALUE_saveValue_Value_created_by_whoAmI_library {
    id: string;
    label: any | null;
    gqlNames: SAVE_VALUE_saveValue_Value_created_by_whoAmI_library_gqlNames;
}

export interface SAVE_VALUE_saveValue_Value_created_by_whoAmI_preview {
    small: string | null;
    medium: string | null;
    big: string | null;
    pages: string | null;
}

export interface SAVE_VALUE_saveValue_Value_created_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: SAVE_VALUE_saveValue_Value_created_by_whoAmI_library;
    preview: SAVE_VALUE_saveValue_Value_created_by_whoAmI_preview | null;
}

export interface SAVE_VALUE_saveValue_Value_created_by {
    id: string;
    whoAmI: SAVE_VALUE_saveValue_Value_created_by_whoAmI;
}

export interface SAVE_VALUE_saveValue_Value_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SAVE_VALUE_saveValue_Value_modified_by_whoAmI_library {
    id: string;
    label: any | null;
    gqlNames: SAVE_VALUE_saveValue_Value_modified_by_whoAmI_library_gqlNames;
}

export interface SAVE_VALUE_saveValue_Value_modified_by_whoAmI_preview {
    small: string | null;
    medium: string | null;
    big: string | null;
    pages: string | null;
}

export interface SAVE_VALUE_saveValue_Value_modified_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: SAVE_VALUE_saveValue_Value_modified_by_whoAmI_library;
    preview: SAVE_VALUE_saveValue_Value_modified_by_whoAmI_preview | null;
}

export interface SAVE_VALUE_saveValue_Value_modified_by {
    id: string;
    whoAmI: SAVE_VALUE_saveValue_Value_modified_by_whoAmI;
}

export interface SAVE_VALUE_saveValue_Value {
    id_value: string | null;
    created_at: number | null;
    created_by: SAVE_VALUE_saveValue_Value_created_by | null;
    modified_at: number | null;
    modified_by: SAVE_VALUE_saveValue_Value_modified_by | null;
    value: any | null;
    raw_value: any | null;
}

export interface SAVE_VALUE_saveValue_LinkValue_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SAVE_VALUE_saveValue_LinkValue_created_by_whoAmI_library {
    id: string;
    label: any | null;
    gqlNames: SAVE_VALUE_saveValue_LinkValue_created_by_whoAmI_library_gqlNames;
}

export interface SAVE_VALUE_saveValue_LinkValue_created_by_whoAmI_preview {
    small: string | null;
    medium: string | null;
    big: string | null;
    pages: string | null;
}

export interface SAVE_VALUE_saveValue_LinkValue_created_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: SAVE_VALUE_saveValue_LinkValue_created_by_whoAmI_library;
    preview: SAVE_VALUE_saveValue_LinkValue_created_by_whoAmI_preview | null;
}

export interface SAVE_VALUE_saveValue_LinkValue_created_by {
    id: string;
    whoAmI: SAVE_VALUE_saveValue_LinkValue_created_by_whoAmI;
}

export interface SAVE_VALUE_saveValue_LinkValue_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SAVE_VALUE_saveValue_LinkValue_modified_by_whoAmI_library {
    id: string;
    label: any | null;
    gqlNames: SAVE_VALUE_saveValue_LinkValue_modified_by_whoAmI_library_gqlNames;
}

export interface SAVE_VALUE_saveValue_LinkValue_modified_by_whoAmI_preview {
    small: string | null;
    medium: string | null;
    big: string | null;
    pages: string | null;
}

export interface SAVE_VALUE_saveValue_LinkValue_modified_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: SAVE_VALUE_saveValue_LinkValue_modified_by_whoAmI_library;
    preview: SAVE_VALUE_saveValue_LinkValue_modified_by_whoAmI_preview | null;
}

export interface SAVE_VALUE_saveValue_LinkValue_modified_by {
    id: string;
    whoAmI: SAVE_VALUE_saveValue_LinkValue_modified_by_whoAmI;
}

export interface SAVE_VALUE_saveValue_LinkValue_linkValue_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SAVE_VALUE_saveValue_LinkValue_linkValue_whoAmI_library {
    id: string;
    label: any | null;
    gqlNames: SAVE_VALUE_saveValue_LinkValue_linkValue_whoAmI_library_gqlNames;
}

export interface SAVE_VALUE_saveValue_LinkValue_linkValue_whoAmI_preview {
    small: string | null;
    medium: string | null;
    big: string | null;
    pages: string | null;
}

export interface SAVE_VALUE_saveValue_LinkValue_linkValue_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: SAVE_VALUE_saveValue_LinkValue_linkValue_whoAmI_library;
    preview: SAVE_VALUE_saveValue_LinkValue_linkValue_whoAmI_preview | null;
}

export interface SAVE_VALUE_saveValue_LinkValue_linkValue {
    id: string;
    whoAmI: SAVE_VALUE_saveValue_LinkValue_linkValue_whoAmI;
}

export interface SAVE_VALUE_saveValue_LinkValue {
    id_value: string | null;
    created_at: number | null;
    created_by: SAVE_VALUE_saveValue_LinkValue_created_by | null;
    modified_at: number | null;
    modified_by: SAVE_VALUE_saveValue_LinkValue_modified_by | null;
    linkValue: SAVE_VALUE_saveValue_LinkValue_linkValue;
}

export type SAVE_VALUE_saveValue =
    | SAVE_VALUE_saveValue_TreeValue
    | SAVE_VALUE_saveValue_Value
    | SAVE_VALUE_saveValue_LinkValue;

export interface SAVE_VALUE {
    /**
     * Save one value
     */
    saveValue: SAVE_VALUE_saveValue;
}

export interface SAVE_VALUEVariables {
    library: string;
    recordId: string;
    attribute: string;
    value: ValueInput;
}
