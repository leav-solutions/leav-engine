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

export interface SAVE_APPLICATION_saveApplication_icon_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_APPLICATION_saveApplication_icon_whoAmI_preview {
    small: string | null;
    medium: string | null;
    pdf: string | null;
    big: string | null;
}

export interface SAVE_APPLICATION_saveApplication_icon_whoAmI {
    id: string;
    library: SAVE_APPLICATION_saveApplication_icon_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: SAVE_APPLICATION_saveApplication_icon_whoAmI_preview | null;
}

export interface SAVE_APPLICATION_saveApplication_icon {
    whoAmI: SAVE_APPLICATION_saveApplication_icon_whoAmI;
}

export interface SAVE_APPLICATION_saveApplication {
    id: string;
    color: string | null;
    module: string;
    description: SystemTranslation | null;
    endpoint: string;
    label: SystemTranslation;
    system: boolean;
    icon: SAVE_APPLICATION_saveApplication_icon | null;
}

export interface SAVE_APPLICATION {
    saveApplication: SAVE_APPLICATION_saveApplication;
}

export interface SAVE_APPLICATIONVariables {
    application: ApplicationInput;
}
