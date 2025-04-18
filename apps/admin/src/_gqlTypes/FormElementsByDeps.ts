// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {FormElementTypes} from './globalTypes';

// ====================================================
// GraphQL fragment: FormElementsByDeps
// ====================================================

export interface FormElementsByDeps_dependencyValue {
    attribute: string;
    value: string;
}

export interface FormElementsByDeps_elements_settings {
    key: string;
    value: Any;
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
