// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ApplicationsFiltersInput, SortApplications, ApplicationType} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_APPLICATIONS
// ====================================================

export interface GET_APPLICATIONS_applications_list_icon_whoAmI_library {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_APPLICATIONS_applications_list_icon_whoAmI {
    id: string;
    library: GET_APPLICATIONS_applications_list_icon_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: Preview | null;
}

export interface GET_APPLICATIONS_applications_list_icon {
    whoAmI: GET_APPLICATIONS_applications_list_icon_whoAmI;
}

export interface GET_APPLICATIONS_applications_list {
    id: string;
    label: SystemTranslation;
    type: ApplicationType;
    description: SystemTranslation | null;
    endpoint: string | null;
    color: string | null;
    icon: GET_APPLICATIONS_applications_list_icon | null;
    url: string | null;
}

export interface GET_APPLICATIONS_applications {
    list: GET_APPLICATIONS_applications_list[];
}

export interface GET_APPLICATIONS {
    applications: GET_APPLICATIONS_applications | null;
}

export interface GET_APPLICATIONSVariables {
    filters?: ApplicationsFiltersInput | null;
    sort?: SortApplications | null;
}
