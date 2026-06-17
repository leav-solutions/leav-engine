/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_VERSION_PROFILE_BY_ID
// ====================================================

export interface GET_VERSION_PROFILE_BY_ID_versionProfiles_list_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_VERSION_PROFILE_BY_ID_versionProfiles_list_linkedAttributes {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_VERSION_PROFILE_BY_ID_versionProfiles_list {
    id: string;
    label: SystemTranslation;
    description: SystemTranslation | null;
    trees: GET_VERSION_PROFILE_BY_ID_versionProfiles_list_trees[];
    linkedAttributes: GET_VERSION_PROFILE_BY_ID_versionProfiles_list_linkedAttributes[];
}

export interface GET_VERSION_PROFILE_BY_ID_versionProfiles {
    list: GET_VERSION_PROFILE_BY_ID_versionProfiles_list[];
}

export interface GET_VERSION_PROFILE_BY_ID {
    versionProfiles: GET_VERSION_PROFILE_BY_ID_versionProfiles;
}

export interface GET_VERSION_PROFILE_BY_IDVariables {
    id: string;
}
