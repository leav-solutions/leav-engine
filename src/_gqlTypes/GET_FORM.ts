/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {FormElementTypes} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_FORM
// ====================================================

export interface GET_FORM_forms_list_elements_dependencyValue_value {
    id: string | null;
    library: string | null;
}

export interface GET_FORM_forms_list_elements_dependencyValue {
    attribute: string;
    value: GET_FORM_forms_list_elements_dependencyValue_value;
}

export interface GET_FORM_forms_list_elements_elements_settings {
    key: string;
    value: any;
}

export interface GET_FORM_forms_list_elements_elements {
    id: string;
    containerId: string;
    order: number;
    type: FormElementTypes;
    uiElementType: string;
    settings: GET_FORM_forms_list_elements_elements_settings[];
}

export interface GET_FORM_forms_list_elements {
    dependencyValue: GET_FORM_forms_list_elements_dependencyValue | null;
    elements: GET_FORM_forms_list_elements_elements[];
}

export interface GET_FORM_forms_list_dependencyAttributes_StandardAttribute {
    id: string;
    label: any | null;
}

export interface GET_FORM_forms_list_dependencyAttributes_TreeAttribute {
    id: string;
    label: any | null;
    linked_tree: string | null;
}

export type GET_FORM_forms_list_dependencyAttributes =
    | GET_FORM_forms_list_dependencyAttributes_StandardAttribute
    | GET_FORM_forms_list_dependencyAttributes_TreeAttribute;

export interface GET_FORM_forms_list {
    id: string;
    label: any | null;
    system: boolean;
    elements: GET_FORM_forms_list_elements[];
    dependencyAttributes: GET_FORM_forms_list_dependencyAttributes[] | null;
}

export interface GET_FORM_forms {
    totalCount: number;
    list: GET_FORM_forms_list[];
}

export interface GET_FORM {
    forms: GET_FORM_forms | null;
}

export interface GET_FORMVariables {
    library: string;
    id: string;
}
