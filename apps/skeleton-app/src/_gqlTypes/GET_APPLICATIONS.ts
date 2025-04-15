// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {LibraryBehavior} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_APPLICATIONS
// ====================================================

export interface GET_APPLICATIONS_applications_list_icon_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface GET_APPLICATIONS_applications_list_icon_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: GET_APPLICATIONS_applications_list_icon_whoAmI_library_gqlNames;
}

export interface GET_APPLICATIONS_applications_list_icon_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: GET_APPLICATIONS_applications_list_icon_whoAmI_library;
    preview: Preview | null;
}

export interface GET_APPLICATIONS_applications_list_icon {
    id: string;
    whoAmI: GET_APPLICATIONS_applications_list_icon_whoAmI;
}

export interface GET_APPLICATIONS_applications_list {
    id: string;
    label: SystemTranslation;
    description: SystemTranslation | null;
    endpoint: string | null;
    url: string | null;
    color: string | null;
    icon: GET_APPLICATIONS_applications_list_icon | null;
}

export interface GET_APPLICATIONS_applications {
    list: GET_APPLICATIONS_applications_list[];
}

export interface GET_APPLICATIONS {
    applications: GET_APPLICATIONS_applications | null;
}
