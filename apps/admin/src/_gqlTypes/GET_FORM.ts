// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {FormElementTypes} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_FORM
// ====================================================

export interface GET_FORM_forms_list_elements_dependencyValue {
    attribute: string;
    value: string;
}

export interface GET_FORM_forms_list_elements_elements_settings {
    key: string;
    value: Any;
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
    label: SystemTranslation | null;
}

export interface GET_FORM_forms_list_dependencyAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface GET_FORM_forms_list_dependencyAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: GET_FORM_forms_list_dependencyAttributes_TreeAttribute_linked_tree | null;
}

export type GET_FORM_forms_list_dependencyAttributes =
    | GET_FORM_forms_list_dependencyAttributes_StandardAttribute
    | GET_FORM_forms_list_dependencyAttributes_TreeAttribute;

export interface GET_FORM_forms_list {
    id: string;
    label: SystemTranslation | null;
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
