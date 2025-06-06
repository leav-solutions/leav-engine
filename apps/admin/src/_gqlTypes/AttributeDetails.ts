// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {AttributeType, AttributeFormat, PermissionsRelation, ValueVersionMode, MultiLinkDisplayOption} from './globalTypes';

// ====================================================
// GraphQL fragment: AttributeDetails
// ====================================================

export interface AttributeDetails_StandardAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface AttributeDetails_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface AttributeDetails_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface AttributeDetails_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: AttributeDetails_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type AttributeDetails_StandardAttribute_permissions_conf_permissionTreeAttributes =
    | AttributeDetails_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | AttributeDetails_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface AttributeDetails_StandardAttribute_permissions_conf {
    permissionTreeAttributes: AttributeDetails_StandardAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface AttributeDetails_StandardAttribute_versions_conf_profile_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface AttributeDetails_StandardAttribute_versions_conf_profile {
    id: string;
    label: SystemTranslation;
    trees: AttributeDetails_StandardAttribute_versions_conf_profile_trees[];
}

export interface AttributeDetails_StandardAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    profile: AttributeDetails_StandardAttribute_versions_conf_profile | null;
}

export interface AttributeDetails_StandardAttribute_libraries {
    id: string;
    label: SystemTranslation | null;
}

export interface AttributeDetails_StandardAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    required: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    multi_link_display_option: MultiLinkDisplayOption | null;
    metadata_fields: AttributeDetails_StandardAttribute_metadata_fields[] | null;
    permissions_conf: AttributeDetails_StandardAttribute_permissions_conf | null;
    versions_conf: AttributeDetails_StandardAttribute_versions_conf | null;
    libraries: AttributeDetails_StandardAttribute_libraries[] | null;
    unique: boolean | null;
}

export interface AttributeDetails_LinkAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface AttributeDetails_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface AttributeDetails_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface AttributeDetails_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: AttributeDetails_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type AttributeDetails_LinkAttribute_permissions_conf_permissionTreeAttributes =
    | AttributeDetails_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | AttributeDetails_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface AttributeDetails_LinkAttribute_permissions_conf {
    permissionTreeAttributes: AttributeDetails_LinkAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface AttributeDetails_LinkAttribute_versions_conf_profile_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface AttributeDetails_LinkAttribute_versions_conf_profile {
    id: string;
    label: SystemTranslation;
    trees: AttributeDetails_LinkAttribute_versions_conf_profile_trees[];
}

export interface AttributeDetails_LinkAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    profile: AttributeDetails_LinkAttribute_versions_conf_profile | null;
}

export interface AttributeDetails_LinkAttribute_libraries {
    id: string;
    label: SystemTranslation | null;
}

export interface AttributeDetails_LinkAttribute_linked_library {
    id: string;
}

export interface AttributeDetails_LinkAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    required: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    multi_link_display_option: MultiLinkDisplayOption | null;
    metadata_fields: AttributeDetails_LinkAttribute_metadata_fields[] | null;
    permissions_conf: AttributeDetails_LinkAttribute_permissions_conf | null;
    versions_conf: AttributeDetails_LinkAttribute_versions_conf | null;
    libraries: AttributeDetails_LinkAttribute_libraries[] | null;
    linked_library: AttributeDetails_LinkAttribute_linked_library | null;
    reverse_link: string | null;
}

export interface AttributeDetails_TreeAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface AttributeDetails_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface AttributeDetails_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface AttributeDetails_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: AttributeDetails_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type AttributeDetails_TreeAttribute_permissions_conf_permissionTreeAttributes =
    | AttributeDetails_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | AttributeDetails_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface AttributeDetails_TreeAttribute_permissions_conf {
    permissionTreeAttributes: AttributeDetails_TreeAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface AttributeDetails_TreeAttribute_versions_conf_profile_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface AttributeDetails_TreeAttribute_versions_conf_profile {
    id: string;
    label: SystemTranslation;
    trees: AttributeDetails_TreeAttribute_versions_conf_profile_trees[];
}

export interface AttributeDetails_TreeAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    profile: AttributeDetails_TreeAttribute_versions_conf_profile | null;
}

export interface AttributeDetails_TreeAttribute_libraries {
    id: string;
    label: SystemTranslation | null;
}

export interface AttributeDetails_TreeAttribute_linked_tree {
    id: string;
}

export interface AttributeDetails_TreeAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    required: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    multi_link_display_option: MultiLinkDisplayOption | null;
    metadata_fields: AttributeDetails_TreeAttribute_metadata_fields[] | null;
    permissions_conf: AttributeDetails_TreeAttribute_permissions_conf | null;
    versions_conf: AttributeDetails_TreeAttribute_versions_conf | null;
    libraries: AttributeDetails_TreeAttribute_libraries[] | null;
    linked_tree: AttributeDetails_TreeAttribute_linked_tree | null;
}

export type AttributeDetails =
    | AttributeDetails_StandardAttribute
    | AttributeDetails_LinkAttribute
    | AttributeDetails_TreeAttribute;
