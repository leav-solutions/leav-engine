/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {AttributeType, AttributeFormat, PermissionsRelation, ValueVersionMode} from './globalTypes';

// ====================================================
// GraphQL fragment: AttributeDetails
// ====================================================

export interface AttributeDetails_metadata_fields {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface AttributeDetails_permissions_conf_permissionTreeAttributes {
    id: string;
    linked_tree: string | null;
    label: any | null;
}

export interface AttributeDetails_permissions_conf {
    permissionTreeAttributes: AttributeDetails_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface AttributeDetails_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface AttributeDetails {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: any | null;
    linked_library: string | null;
    linked_tree: string | null;
    multiple_values: boolean;
    metadata_fields: AttributeDetails_metadata_fields[] | null;
    permissions_conf: AttributeDetails_permissions_conf | null;
    versions_conf: AttributeDetails_versions_conf | null;
}
