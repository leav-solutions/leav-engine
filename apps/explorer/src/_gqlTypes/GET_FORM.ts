// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {FormElementTypes, AttributeType, AttributeFormat} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_FORM
// ====================================================

export interface GET_FORM_forms_list_library {
    id: string;
}

export interface GET_FORM_forms_list_dependencyAttributes {
    id: string;
    label: any | null;
}

export interface GET_FORM_forms_list_elements_dependencyValue_value {
    id: string | null;
    library: string | null;
}

export interface GET_FORM_forms_list_elements_dependencyValue {
    attribute: string;
    value: GET_FORM_forms_list_elements_dependencyValue_value;
}

export interface GET_FORM_forms_list_elements_elements_attribute_StandardAttribute {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    multiple_values: boolean;
}

export interface GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linked_library_gqlNames {
    type: string;
}

export interface GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linked_library {
    id: string;
    gqlNames: GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linked_library_gqlNames;
}

export interface GET_FORM_forms_list_elements_elements_attribute_LinkAttribute {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    multiple_values: boolean;
    linked_library: GET_FORM_forms_list_elements_elements_attribute_LinkAttribute_linked_library | null;
}

export interface GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_linked_tree {
    id: string;
    label: any | null;
}

export interface GET_FORM_forms_list_elements_elements_attribute_TreeAttribute {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    multiple_values: boolean;
    linked_tree: GET_FORM_forms_list_elements_elements_attribute_TreeAttribute_linked_tree | null;
}

export type GET_FORM_forms_list_elements_elements_attribute =
    | GET_FORM_forms_list_elements_elements_attribute_StandardAttribute
    | GET_FORM_forms_list_elements_elements_attribute_LinkAttribute
    | GET_FORM_forms_list_elements_elements_attribute_TreeAttribute;

export interface GET_FORM_forms_list_elements_elements_settings {
    key: string;
    value: any;
}

export interface GET_FORM_forms_list_elements_elements {
    id: string;
    containerId: string;
    uiElementType: string;
    type: FormElementTypes;
    attribute: GET_FORM_forms_list_elements_elements_attribute | null;
    settings: GET_FORM_forms_list_elements_elements_settings[];
}

export interface GET_FORM_forms_list_elements {
    dependencyValue: GET_FORM_forms_list_elements_dependencyValue | null;
    elements: GET_FORM_forms_list_elements_elements[];
}

export interface GET_FORM_forms_list {
    id: string;
    library: GET_FORM_forms_list_library;
    dependencyAttributes: GET_FORM_forms_list_dependencyAttributes[] | null;
    elements: GET_FORM_forms_list_elements[];
}

export interface GET_FORM_forms {
    list: GET_FORM_forms_list[];
}

export interface GET_FORM {
    forms: GET_FORM_forms | null;
}

export interface GET_FORMVariables {
    library: string;
    formId: string;
}
