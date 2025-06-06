// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {FormInput, FormElementTypes} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_FORM
// ====================================================

export interface SAVE_FORM_saveForm_elements_dependencyValue {
    attribute: string;
    value: string;
}

export interface SAVE_FORM_saveForm_elements_elements_settings {
    key: string;
    value: Any;
}

export interface SAVE_FORM_saveForm_elements_elements {
    id: string;
    containerId: string;
    order: number;
    type: FormElementTypes;
    uiElementType: string;
    settings: SAVE_FORM_saveForm_elements_elements_settings[];
}

export interface SAVE_FORM_saveForm_elements {
    dependencyValue: SAVE_FORM_saveForm_elements_dependencyValue | null;
    elements: SAVE_FORM_saveForm_elements_elements[];
}

export interface SAVE_FORM_saveForm_dependencyAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_FORM_saveForm_dependencyAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface SAVE_FORM_saveForm_dependencyAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: SAVE_FORM_saveForm_dependencyAttributes_TreeAttribute_linked_tree | null;
}

export type SAVE_FORM_saveForm_dependencyAttributes =
    | SAVE_FORM_saveForm_dependencyAttributes_StandardAttribute
    | SAVE_FORM_saveForm_dependencyAttributes_TreeAttribute;

export type SAVE_FORM_saveForm_sidePanelAttributes ={
    enable: boolean;
    isOpenByDefault: boolean;
}

export interface SAVE_FORM_saveForm {
    id: string;
    label: SystemTranslation | null;
    system: boolean;
    elements: SAVE_FORM_saveForm_elements[];
    dependencyAttributes: SAVE_FORM_saveForm_dependencyAttributes[] | null;
    sidePanel: SAVE_FORM_saveForm_sidePanelAttributes | null;

}

export interface SAVE_FORM {
    saveForm: SAVE_FORM_saveForm | null;
}

export interface SAVE_FORMVariables {
    formData: FormInput;
}
