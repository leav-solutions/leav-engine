/* tslint:disable */
// This file was automatically generated and should not be edited.

import {AvailableLanguage, AttributeType, AttributeFormat, PermissionsRelation} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_LIBRARIES
// ====================================================

export interface GET_LIBRARIES_libraries_attributes {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: any | null;
}

export interface GET_LIBRARIES_libraries_permissionsConf {
    permissionTreeAttributes: string[];
    relation: PermissionsRelation;
}

export interface GET_LIBRARIES_libraries_recordIdentityConf {
    label: string | null;
    color: string | null;
    preview: string | null;
}

export interface GET_LIBRARIES_libraries {
    id: string;
    system: boolean | null;
    label: any | null;
    attributes: GET_LIBRARIES_libraries_attributes[] | null;
    permissionsConf: GET_LIBRARIES_libraries_permissionsConf | null;
    recordIdentityConf: GET_LIBRARIES_libraries_recordIdentityConf | null;
}

export interface GET_LIBRARIES {
    libraries: GET_LIBRARIES_libraries[] | null;
}

export interface GET_LIBRARIESVariables {
    id?: string | null;
    label?: string | null;
    system?: boolean | null;
    lang?: AvailableLanguage[] | null;
}
