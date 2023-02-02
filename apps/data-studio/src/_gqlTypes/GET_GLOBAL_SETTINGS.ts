// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {LibraryBehavior} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_GLOBAL_SETTINGS
// ====================================================

export interface GET_GLOBAL_SETTINGS_globalSettings_icon_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface GET_GLOBAL_SETTINGS_globalSettings_icon_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: any | null;
    gqlNames: GET_GLOBAL_SETTINGS_globalSettings_icon_whoAmI_library_gqlNames;
}

export interface GET_GLOBAL_SETTINGS_globalSettings_icon_whoAmI_preview_file_library {
    id: string;
}

export interface GET_GLOBAL_SETTINGS_globalSettings_icon_whoAmI_preview_file {
    id: string;
    library: GET_GLOBAL_SETTINGS_globalSettings_icon_whoAmI_preview_file_library;
}

export interface GET_GLOBAL_SETTINGS_globalSettings_icon_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
    original: string;
    file: GET_GLOBAL_SETTINGS_globalSettings_icon_whoAmI_preview_file | null;
}

export interface GET_GLOBAL_SETTINGS_globalSettings_icon_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: GET_GLOBAL_SETTINGS_globalSettings_icon_whoAmI_library;
    preview: GET_GLOBAL_SETTINGS_globalSettings_icon_whoAmI_preview | null;
}

export interface GET_GLOBAL_SETTINGS_globalSettings_icon {
    id: string;
    whoAmI: GET_GLOBAL_SETTINGS_globalSettings_icon_whoAmI;
}

export interface GET_GLOBAL_SETTINGS_globalSettings {
    name: string;
    icon: GET_GLOBAL_SETTINGS_globalSettings_icon | null;
}

export interface GET_GLOBAL_SETTINGS {
    globalSettings: GET_GLOBAL_SETTINGS_globalSettings;
}
