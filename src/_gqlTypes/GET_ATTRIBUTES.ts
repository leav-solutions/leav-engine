/* tslint:disable */
// This file was automatically generated and should not be edited.

import {AttributeType, AttributeFormat} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_ATTRIBUTES
// ====================================================

export interface GET_ATTRIBUTES_attributes_label {
    fr: string | null;
    en: string | null;
}

export interface GET_ATTRIBUTES_attributes {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: GET_ATTRIBUTES_attributes_label | null;
}

export interface GET_ATTRIBUTES {
    attributes: GET_ATTRIBUTES_attributes[] | null;
}

export interface GET_ATTRIBUTESVariables {
    id?: string | null;
    label?: string | null;
    type?: AttributeType | null;
    format?: AttributeFormat | null;
    system?: boolean | null;
}
