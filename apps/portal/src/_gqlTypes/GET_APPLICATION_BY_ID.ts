// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

// ====================================================
// GraphQL query operation: GET_APPLICATION_BY_ID
// ====================================================

export interface GET_APPLICATION_BY_ID_applications_list {
    id: string;
    label: SystemTranslation;
    description: SystemTranslation | null;
    endpoint: string;
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
