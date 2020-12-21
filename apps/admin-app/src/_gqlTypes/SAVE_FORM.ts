// Copyright LEAV Solutions 2017
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

export interface SAVE_FORM_saveForm_elements_dependencyValue_value {
    id: string | null;
    library: string | null;
}

export interface SAVE_FORM_saveForm_elements_dependencyValue {
    attribute: string;
    value: SAVE_FORM_saveForm_elements_dependencyValue_value;
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

export interface SAVE_FORM_saveForm_dependencyAttributes {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_FORM_saveForm {
    id: string;
    label: SystemTranslation | null;
    system: boolean;
    elements: SAVE_FORM_saveForm_elements[];
    dependencyAttributes: SAVE_FORM_saveForm_dependencyAttributes[] | null;
}

export interface SAVE_FORM {
    saveForm: SAVE_FORM_saveForm | null;
}

export interface SAVE_FORMVariables {
    formData: FormInput;
}
