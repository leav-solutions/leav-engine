/* tslint:disable */
// This file was automatically generated and should not be edited.

import {AvailableLanguage, AttributeType, AttributeFormat} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_ATTRIBUTES
// ====================================================

export interface GET_ATTRIBUTES_attributes {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: any | null;
}

export interface GET_ATTRIBUTES {
    attributes: GET_ATTRIBUTES_attributes[] | null;
}

export interface GET_ATTRIBUTESVariables {
    lang?: AvailableLanguage[] | null;
    id?: string | null;
    label?: string | null;
    type?: (AttributeType | null)[] | null;
    format?: (AttributeFormat | null)[] | null;
    system?: boolean | null;
}
