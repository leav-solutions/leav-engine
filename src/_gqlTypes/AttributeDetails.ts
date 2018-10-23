/* tslint:disable */
// This file was automatically generated and should not be edited.

import {AttributeType, AttributeFormat} from './globalTypes';

// ====================================================
// GraphQL fragment: AttributeDetails
// ====================================================

export interface AttributeDetails_label {
    fr: string | null;
    en: string | null;
}

export interface AttributeDetails {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: AttributeDetails_label | null;
}
