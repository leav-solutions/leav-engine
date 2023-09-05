// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {FormElementTypes} from './globalTypes';

// ====================================================
// GraphQL fragment: FormDetails
// ====================================================

export interface FormDetails_elements_dependencyValue {
    attribute: string;
    value: string;
}

export interface FormDetails_elements_elements_settings {
    key: string;
    value: Any;
}

export interface FormDetails_elements_elements {
    id: string;
    containerId: string;
    order: number;
    type: FormElementTypes;
    uiElementType: string;
    settings: FormDetails_elements_elements_settings[];
}

export interface FormDetails_elements {
    dependencyValue: FormDetails_elements_dependencyValue | null;
    elements: FormDetails_elements_elements[];
}

export interface FormDetails_dependencyAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface FormDetails_dependencyAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface FormDetails_dependencyAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: FormDetails_dependencyAttributes_TreeAttribute_linked_tree | null;
}

export type FormDetails_dependencyAttributes =
    | FormDetails_dependencyAttributes_StandardAttribute
    | FormDetails_dependencyAttributes_TreeAttribute;

export interface FormDetails {
    id: string;
    label: SystemTranslation | null;
    system: boolean;
    elements: FormDetails_elements[];
    dependencyAttributes: FormDetails_dependencyAttributes[] | null;
}
