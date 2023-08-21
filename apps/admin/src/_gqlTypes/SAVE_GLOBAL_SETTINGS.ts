// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {GlobalSettingsInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_GLOBAL_SETTINGS
// ====================================================

export interface SAVE_GLOBAL_SETTINGS_saveGlobalSettings_icon_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_GLOBAL_SETTINGS_saveGlobalSettings_icon_whoAmI {
    id: string;
    library: SAVE_GLOBAL_SETTINGS_saveGlobalSettings_icon_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface SAVE_GLOBAL_SETTINGS_saveGlobalSettings_icon {
    id: string;
    whoAmI: SAVE_GLOBAL_SETTINGS_saveGlobalSettings_icon_whoAmI;
}

export interface SAVE_GLOBAL_SETTINGS_saveGlobalSettings {
    name: string;
    icon: SAVE_GLOBAL_SETTINGS_saveGlobalSettings_icon | null;
}

export interface SAVE_GLOBAL_SETTINGS {
    saveGlobalSettings: SAVE_GLOBAL_SETTINGS_saveGlobalSettings;
}

export interface SAVE_GLOBAL_SETTINGSVariables {
    settings: GlobalSettingsInput;
}
