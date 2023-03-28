// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ApplicationType, ApplicationInstallStatus} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_APPLICATION_BY_ID
// ====================================================

export interface GET_APPLICATION_BY_ID_applications_list_icon_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_APPLICATION_BY_ID_applications_list_icon_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
}

export interface GET_APPLICATION_BY_ID_applications_list_icon_whoAmI {
    id: string;
    library: GET_APPLICATION_BY_ID_applications_list_icon_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: GET_APPLICATION_BY_ID_applications_list_icon_whoAmI_preview | null;
}

export interface GET_APPLICATION_BY_ID_applications_list_icon {
    whoAmI: GET_APPLICATION_BY_ID_applications_list_icon_whoAmI;
}

export interface GET_APPLICATION_BY_ID_applications_list_permissions {
    access_application: boolean;
    admin_application: boolean;
}

export interface GET_APPLICATION_BY_ID_applications_list_install {
    status: ApplicationInstallStatus;
    lastCallResult: string | null;
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
    module: string | null;
    permissions: GET_APPLICATION_BY_ID_applications_list_permissions;
    install: GET_APPLICATION_BY_ID_applications_list_install | null;
    settings: JSONObject | null;
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
