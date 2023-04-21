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

export interface SAVE_VALUE_saveValue_Value_attribute {
    id: string;
}

export interface SAVE_VALUE_saveValue_Value {
    id_value: string | null;
    attribute: SAVE_VALUE_saveValue_Value_attribute | null;
    value: Any | null;
    raw_value: Any | null;
}

export interface SAVE_VALUE_saveValue_LinkValue_attribute {
    id: string;
}

export interface SAVE_VALUE_saveValue_LinkValue_linkValue_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_VALUE_saveValue_LinkValue_linkValue_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
}

export interface SAVE_VALUE_saveValue_LinkValue_linkValue_whoAmI {
    id: string;
    library: SAVE_VALUE_saveValue_LinkValue_linkValue_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: SAVE_VALUE_saveValue_LinkValue_linkValue_whoAmI_preview | null;
}

export interface SAVE_VALUE_saveValue_LinkValue_linkValue {
    whoAmI: SAVE_VALUE_saveValue_LinkValue_linkValue_whoAmI;
}

export interface SAVE_VALUE_saveValue_LinkValue {
    id_value: string | null;
    attribute: SAVE_VALUE_saveValue_LinkValue_attribute | null;
    linkValue: SAVE_VALUE_saveValue_LinkValue_linkValue | null;
}

export interface SAVE_VALUE_saveValue_TreeValue_attribute {
    id: string;
}

export interface SAVE_VALUE_saveValue_TreeValue_treeValue_record_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_VALUE_saveValue_TreeValue_treeValue_record_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
}

export interface SAVE_VALUE_saveValue_TreeValue_treeValue_record_whoAmI {
    id: string;
    library: SAVE_VALUE_saveValue_TreeValue_treeValue_record_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: SAVE_VALUE_saveValue_TreeValue_treeValue_record_whoAmI_preview | null;
}

export interface SAVE_VALUE_saveValue_TreeValue_treeValue_record {
    whoAmI: SAVE_VALUE_saveValue_TreeValue_treeValue_record_whoAmI;
}

export interface SAVE_VALUE_saveValue_TreeValue_treeValue {
    record: SAVE_VALUE_saveValue_TreeValue_treeValue_record | null;
}

export interface SAVE_VALUE_saveValue_TreeValue {
    id_value: string | null;
    attribute: SAVE_VALUE_saveValue_TreeValue_attribute | null;
    treeValue: SAVE_VALUE_saveValue_TreeValue_treeValue | null;
}

export type SAVE_VALUE_saveValue =
    | SAVE_VALUE_saveValue_Value
    | SAVE_VALUE_saveValue_LinkValue
    | SAVE_VALUE_saveValue_TreeValue;

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
