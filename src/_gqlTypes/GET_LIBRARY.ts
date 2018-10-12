/* tslint:disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_LIBRARY
// ====================================================

export interface GET_LIBRARY_libraries_label {
    fr: string | null;
    en: string | null;
}

export interface GET_LIBRARY_libraries {
    id: string;
    system: boolean | null;
    label: GET_LIBRARY_libraries_label | null;
}

export interface GET_LIBRARY {
    libraries: GET_LIBRARY_libraries[] | null;
}

export interface GET_LIBRARYVariables {
    id: string;
}
