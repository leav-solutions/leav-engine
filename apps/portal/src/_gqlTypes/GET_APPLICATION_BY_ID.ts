// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ApplicationType} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_APPLICATION_BY_ID
// ====================================================

export interface GET_APPLICATION_BY_ID_applications_list_icon_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_APPLICATION_BY_ID_applications_list_icon_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: GET_APPLICATION_BY_ID_applications_list_icon_whoAmI_library;
    preview: Preview | null;
}

export interface GET_APPLICATION_BY_ID_applications_list_icon {
    id: string;
    whoAmI: GET_APPLICATION_BY_ID_applications_list_icon_whoAmI;
}

export interface GET_APPLICATION_BY_ID_applications_list_permissions {
    access_application: boolean;
}

export interface GET_APPLICATION_BY_ID_applications_list {
    id: string;
    label: SystemTranslation;
    type: ApplicationType;
    description: SystemTranslation | null;
    endpoint: string | null;
    url: string | null;
    color: string | null;
    icon: GET_APPLICATION_BY_ID_applications_list_icon | null;
    permissions: GET_APPLICATION_BY_ID_applications_list_permissions;
}

export interface GET_APPLICATION_BY_ID_applications {
    list: GET_APPLICATION_BY_ID_applications_list[];
}

export interface GET_APPLICATION_BY_ID {
    applications: GET_APPLICATION_BY_ID_applications | null;
}

export interface GET_APPLICATION_BY_IDVariables {
    id: string;
}
