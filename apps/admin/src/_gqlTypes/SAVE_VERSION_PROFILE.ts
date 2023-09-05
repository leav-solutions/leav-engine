// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {VersionProfileInput} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_VERSION_PROFILE
// ====================================================

export interface SAVE_VERSION_PROFILE_saveVersionProfile_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_VERSION_PROFILE_saveVersionProfile {
    id: string;
    label: SystemTranslation;
    description: SystemTranslation | null;
    trees: SAVE_VERSION_PROFILE_saveVersionProfile_trees[];
}

export interface SAVE_VERSION_PROFILE {
    saveVersionProfile: SAVE_VERSION_PROFILE_saveVersionProfile;
}

export interface SAVE_VERSION_PROFILEVariables {
    versionProfile: VersionProfileInput;
}
