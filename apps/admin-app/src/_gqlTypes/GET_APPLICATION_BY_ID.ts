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

export interface GET_APPLICATION_BY_ID_applications_list_libraries {
    id: string;
}

export interface GET_APPLICATION_BY_ID_applications_list_trees {
    id: string;
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
    endpoint: string;
    url: string;
    color: string | null;
    icon: string | null;
    module: string;
    libraries: GET_APPLICATION_BY_ID_applications_list_libraries[];
    trees: GET_APPLICATION_BY_ID_applications_list_trees[];
    permissions: GET_APPLICATION_BY_ID_applications_list_permissions;
    install: GET_APPLICATION_BY_ID_applications_list_install | null;
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
