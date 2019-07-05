/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {AvailableLanguage, AttributeType, AttributeFormat, PermissionsRelation, ValueVersionMode} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_ATTRIBUTES
// ====================================================

export interface GET_ATTRIBUTES_attributes_permissions_conf_permissionTreeAttributes {
    id: string;
    linked_tree: string | null;
    label: any | null;
}

export interface GET_ATTRIBUTES_attributes_permissions_conf {
    permissionTreeAttributes: GET_ATTRIBUTES_attributes_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface GET_ATTRIBUTES_attributes_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface GET_ATTRIBUTES_attributes {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: any | null;
    linked_library: string | null;
    linked_tree: string | null;
    multiple_values: boolean;
    permissions_conf: GET_ATTRIBUTES_attributes_permissions_conf | null;
    versions_conf: GET_ATTRIBUTES_attributes_versions_conf | null;
}

export interface GET_ATTRIBUTES {
    attributes: GET_ATTRIBUTES_attributes[] | null;
}

export interface GET_ATTRIBUTESVariables {
    lang?: AvailableLanguage[] | null;
    id?: string | null;
    label?: string | null;
    type?: (AttributeType | null)[] | null;
    format?: (AttributeFormat | null)[] | null;
    system?: boolean | null;
    multiple_values?: boolean | null;
    versionable?: boolean | null;
}
