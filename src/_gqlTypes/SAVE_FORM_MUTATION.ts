// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {FormInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_FORM_MUTATION
// ====================================================

export interface SAVE_FORM_MUTATION_saveForm_dependencyAttributes {
    id: string;
    label: any | null;
}

export interface SAVE_FORM_MUTATION_saveForm {
    id: string;
    label: any | null;
    system: boolean;
    layout: any | null;
    fields: any | null;
    dependencyAttributes: (SAVE_FORM_MUTATION_saveForm_dependencyAttributes | null)[] | null;
}

export interface SAVE_FORM_MUTATION {
    saveForm: SAVE_FORM_MUTATION_saveForm | null;
}

export interface SAVE_FORM_MUTATIONVariables {
    formData: FormInput;
}
