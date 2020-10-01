/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {FormElementTypes} from './globalTypes';

// ====================================================
// GraphQL fragment: FormElementsByDeps
// ====================================================

export interface FormElementsByDeps_dependencyValue_value {
    id: string | null;
    library: string | null;
}

export interface FormElementsByDeps_dependencyValue {
    attribute: string;
    value: FormElementsByDeps_dependencyValue_value;
}

export interface FormElementsByDeps_elements_settings {
    key: string;
    value: any;
}

export interface FormElementsByDeps_elements {
    id: string;
    containerId: string;
    order: number;
    type: FormElementTypes;
    uiElementType: string;
    settings: FormElementsByDeps_elements_settings[];
}

export interface FormElementsByDeps {
    dependencyValue: FormElementsByDeps_dependencyValue | null;
    elements: FormElementsByDeps_elements[];
}
