// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ApplicationInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_APPLICATION
// ====================================================

export interface SAVE_APPLICATION_saveApplication {
    id: string;
    color: string | null;
    component: string | null;
    description: SystemTranslation | null;
    endpoint: string | null;
    label: SystemTranslation | null;
    system: boolean | null;
    icon: string | null;
}

export interface SAVE_APPLICATION {
    saveApplication: SAVE_APPLICATION_saveApplication;
}

export interface SAVE_APPLICATIONVariables {
    application: ApplicationInput;
}
