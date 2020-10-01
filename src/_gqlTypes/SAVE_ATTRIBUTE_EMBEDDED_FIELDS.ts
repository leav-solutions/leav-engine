/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {AttributeInput, AttributeFormat} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_ATTRIBUTE_EMBEDDED_FIELDS
// ====================================================

export interface SAVE_ATTRIBUTE_EMBEDDED_FIELDS_saveAttribute {
    id: string;
    label: any | null;
    format: AttributeFormat | null;
}

export interface SAVE_ATTRIBUTE_EMBEDDED_FIELDS {
    saveAttribute: SAVE_ATTRIBUTE_EMBEDDED_FIELDS_saveAttribute;
}

export interface SAVE_ATTRIBUTE_EMBEDDED_FIELDSVariables {
    attribute?: AttributeInput | null;
}
