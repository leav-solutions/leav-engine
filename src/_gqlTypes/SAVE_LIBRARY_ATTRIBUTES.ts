/* tslint:disable */
// This file was automatically generated and should not be edited.

import {AvailableLanguage, AttributeType, AttributeFormat} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_LIBRARY_ATTRIBUTES
// ====================================================

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: any | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary {
    id: string;
    attributes: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes[] | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES {
    saveLibrary: SAVE_LIBRARY_ATTRIBUTES_saveLibrary;
}

export interface SAVE_LIBRARY_ATTRIBUTESVariables {
    libId: string;
    attributes: string[];
    lang?: AvailableLanguage[] | null;
}
