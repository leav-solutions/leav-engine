/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {AttributeType, AttributeFormat, PermissionsRelation, ValueVersionMode} from './globalTypes';

// ====================================================
// GraphQL fragment: AttributeDetails
// ====================================================

export interface AttributeDetails_permissionsConf_permissionTreeAttributes {
    id: string;
    linked_tree: string | null;
    label: any | null;
}

export interface AttributeDetails_permissionsConf {
    permissionTreeAttributes: AttributeDetails_permissionsConf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface AttributeDetails_versionsConf {
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
    multipleValues: boolean;
    permissionsConf: AttributeDetails_permissionsConf | null;
    versionsConf: AttributeDetails_versionsConf | null;
}
