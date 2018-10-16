/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_LIBRARIES
// ====================================================

export interface GET_LIBRARIES_libraries_label {
    fr: string | null;
    en: string | null;
}

export interface GET_LIBRARIES_libraries_attributes_label {
    fr: string | null;
    en: string | null;
}

export interface GET_LIBRARIES_libraries_attributes {
    id: string;
    label: GET_LIBRARIES_libraries_attributes_label | null;
}

export interface GET_LIBRARIES_libraries {
    id: string;
    system: boolean | null;
    label: GET_LIBRARIES_libraries_label | null;
    attributes: GET_LIBRARIES_libraries_attributes[] | null;
}

export interface GET_LIBRARIES {
    libraries: GET_LIBRARIES_libraries[] | null;
}

export interface GET_LIBRARIESVariables {
    id?: string | null;
}
