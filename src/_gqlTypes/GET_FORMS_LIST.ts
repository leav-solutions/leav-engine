/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_FORMS_LIST
// ====================================================

export interface GET_FORMS_LIST_forms_list {
    id: string;
    label: any | null;
    system: boolean;
}

export interface GET_FORMS_LIST_forms {
    totalCount: number;
    list: GET_FORMS_LIST_forms_list[];
}

export interface GET_FORMS_LIST {
    forms: GET_FORMS_LIST_forms | null;
}

export interface GET_FORMS_LISTVariables {
    library: string;
    id?: string | null;
    label?: string | null;
    system?: boolean | null;
}
