/* tslint:disable */
// This file was automatically generated and should not be edited.

import {AttributeInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_ATTRIBUTE
// ====================================================

export interface SAVE_ATTRIBUTE_saveAttribute_label {
    fr: string | null;
    en: string | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute {
    id: string;
    label: SAVE_ATTRIBUTE_saveAttribute_label | null;
}

export interface SAVE_ATTRIBUTE {
    saveAttribute: SAVE_ATTRIBUTE_saveAttribute;
}

export interface SAVE_ATTRIBUTEVariables {
    attrData: AttributeInput;
}
