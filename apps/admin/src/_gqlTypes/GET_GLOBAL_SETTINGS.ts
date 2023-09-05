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
