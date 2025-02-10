// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_GLOBAL_SETTINGS
// ====================================================

export interface GET_GLOBAL_SETTINGS_globalSettings_icon_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_GLOBAL_SETTINGS_globalSettings_icon_whoAmI {
    id: string;
    library: GET_GLOBAL_SETTINGS_globalSettings_icon_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}
export interface GET_GLOBAL_SETTINGS_globalSettings_favicon_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_GLOBAL_SETTINGS_globalSettings_favicon_whoAmI {
    id: string;
    library: GET_GLOBAL_SETTINGS_globalSettings_favicon_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface GET_GLOBAL_SETTINGS_globalSettings_icon {
    id: string;
    whoAmI: GET_GLOBAL_SETTINGS_globalSettings_icon_whoAmI;
}

export interface GET_GLOBAL_SETTINGS_globalSettings_favicon {
    id: string;
    whoAmI: GET_GLOBAL_SETTINGS_globalSettings_favicon_whoAmI;
}

export interface GET_GLOBAL_SETTINGS_globalSettings {
    defaultApp: string;
    name: string;
    icon: GET_GLOBAL_SETTINGS_globalSettings_icon | null;
    favicon: GET_GLOBAL_SETTINGS_globalSettings_favicon | null;
}

export interface GET_GLOBAL_SETTINGS {
    globalSettings: GET_GLOBAL_SETTINGS_globalSettings;
}
