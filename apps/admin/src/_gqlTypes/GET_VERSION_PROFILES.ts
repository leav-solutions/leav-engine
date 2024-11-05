// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {VersionProfilesFiltersInput, SortVersionProfilesInput} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_VERSION_PROFILES
// ====================================================

export interface GET_VERSION_PROFILES_versionProfiles_list {
    id: string;
    label: SystemTranslation;
}

export interface GET_VERSION_PROFILES_versionProfiles {
    list: GET_VERSION_PROFILES_versionProfiles_list[];
}

export interface GET_VERSION_PROFILES {
    versionProfiles: GET_VERSION_PROFILES_versionProfiles;
}

export interface GET_VERSION_PROFILESVariables {
    filters?: VersionProfilesFiltersInput | null;
    sort?: SortVersionProfilesInput | null;
}
