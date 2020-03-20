/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {AttributeType, AttributeFormat, PermissionsRelation, ValueVersionMode} from './globalTypes';

// ====================================================
// GraphQL fragment: AttributeDetails
// ====================================================

export interface AttributeDetails_StandardAttribute_metadata_fields {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface AttributeDetails_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: any | null;
}

export interface AttributeDetails_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: any | null;
    linked_tree: string | null;
}

export type AttributeDetails_StandardAttribute_permissions_conf_permissionTreeAttributes =
    | AttributeDetails_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | AttributeDetails_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface AttributeDetails_StandardAttribute_permissions_conf {
    permissionTreeAttributes: AttributeDetails_StandardAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface AttributeDetails_StandardAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface AttributeDetails_StandardAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: any | null;
    multiple_values: boolean;
    metadata_fields: AttributeDetails_StandardAttribute_metadata_fields[] | null;
    permissions_conf: AttributeDetails_StandardAttribute_permissions_conf | null;
    versions_conf: AttributeDetails_StandardAttribute_versions_conf | null;
}

export interface AttributeDetails_LinkAttribute_metadata_fields {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface AttributeDetails_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: any | null;
}

export interface AttributeDetails_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: any | null;
    linked_tree: string | null;
}

export type AttributeDetails_LinkAttribute_permissions_conf_permissionTreeAttributes =
    | AttributeDetails_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | AttributeDetails_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface AttributeDetails_LinkAttribute_permissions_conf {
    permissionTreeAttributes: AttributeDetails_LinkAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface AttributeDetails_LinkAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface AttributeDetails_LinkAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: any | null;
    multiple_values: boolean;
    metadata_fields: AttributeDetails_LinkAttribute_metadata_fields[] | null;
    permissions_conf: AttributeDetails_LinkAttribute_permissions_conf | null;
    versions_conf: AttributeDetails_LinkAttribute_versions_conf | null;
    linked_library: string | null;
}

export interface AttributeDetails_TreeAttribute_metadata_fields {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface AttributeDetails_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: any | null;
}

export interface AttributeDetails_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: any | null;
    linked_tree: string | null;
}

export type AttributeDetails_TreeAttribute_permissions_conf_permissionTreeAttributes =
    | AttributeDetails_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | AttributeDetails_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface AttributeDetails_TreeAttribute_permissions_conf {
    permissionTreeAttributes: AttributeDetails_TreeAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface AttributeDetails_TreeAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface AttributeDetails_TreeAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: any | null;
    multiple_values: boolean;
    metadata_fields: AttributeDetails_TreeAttribute_metadata_fields[] | null;
    permissions_conf: AttributeDetails_TreeAttribute_permissions_conf | null;
    versions_conf: AttributeDetails_TreeAttribute_versions_conf | null;
    linked_tree: string | null;
}

export type AttributeDetails =
    | AttributeDetails_StandardAttribute
    | AttributeDetails_LinkAttribute
    | AttributeDetails_TreeAttribute;
