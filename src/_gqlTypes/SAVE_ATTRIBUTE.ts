/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {AttributeInput, AttributeFormat, AttributeType} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_ATTRIBUTE
// ====================================================

export interface SAVE_ATTRIBUTE_saveAttribute {
    id: string;
    label: any | null;
    format: AttributeFormat | null;
    type: AttributeType;
    system: boolean;
    multipleValues: boolean;
}

export interface SAVE_ATTRIBUTE {
    saveAttribute: SAVE_ATTRIBUTE_saveAttribute;
}

export interface SAVE_ATTRIBUTEVariables {
    attrData: AttributeInput;
}
