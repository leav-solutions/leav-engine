// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ApplicationType, ApplicationInstallStatus} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_APPLICATIONS
// ====================================================

export interface GET_APPLICATIONS_applications_list_icon_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_APPLICATIONS_applications_list_icon_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
}

export interface GET_APPLICATIONS_applications_list_icon_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: GET_APPLICATIONS_applications_list_icon_whoAmI_library;
    preview: GET_APPLICATIONS_applications_list_icon_whoAmI_preview | null;
}

export interface GET_APPLICATIONS_applications_list_icon {
    id: string;
    whoAmI: GET_APPLICATIONS_applications_list_icon_whoAmI;
}

export interface GET_APPLICATIONS_applications_list_permissions {
    access_application: boolean;
}

export interface GET_APPLICATIONS_applications_list_install {
    status: ApplicationInstallStatus;
    lastCallResult: string | null;
}

export interface GET_APPLICATIONS_applications_list {
    id: string;
    label: SystemTranslation;
    type: ApplicationType;
    description: SystemTranslation | null;
    endpoint: string;
    url: string;
    color: string | null;
    icon: GET_APPLICATIONS_applications_list_icon | null;
    permissions: GET_APPLICATIONS_applications_list_permissions;
    install: GET_APPLICATIONS_applications_list_install | null;
}

export interface GET_APPLICATIONS_applications {
    list: GET_APPLICATIONS_applications_list[];
}

export interface GET_APPLICATIONS {
    applications: GET_APPLICATIONS_applications | null;
}
