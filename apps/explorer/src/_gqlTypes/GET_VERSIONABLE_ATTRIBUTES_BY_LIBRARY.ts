// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY
// ====================================================

export interface GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY_attributes_list_versions_conf_profile_trees {
    id: string;
    label: any | null;
}

export interface GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY_attributes_list_versions_conf_profile {
    id: string;
    trees: GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY_attributes_list_versions_conf_profile_trees[];
}

export interface GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY_attributes_list_versions_conf {
    versionable: boolean;
    profile: GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY_attributes_list_versions_conf_profile | null;
}

export interface GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY_attributes_list {
    id: string;
    versions_conf: GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY_attributes_list_versions_conf | null;
}

export interface GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY_attributes {
    list: GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY_attributes_list[];
}

export interface GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY {
    attributes: GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARY_attributes | null;
}

export interface GET_VERSIONABLE_ATTRIBUTES_BY_LIBRARYVariables {
    libraryId: string;
}
