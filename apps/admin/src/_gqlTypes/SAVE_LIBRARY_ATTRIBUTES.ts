// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {AttributeType, AttributeFormat, PermissionsRelation, ValueVersionMode} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_LIBRARY_ATTRIBUTES
// ====================================================

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes =
    | SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_permissions_conf {
    permissionTreeAttributes: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_versions_conf_profile_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_versions_conf_profile {
    id: string;
    label: SystemTranslation;
    trees: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_versions_conf_profile_trees[];
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    profile: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_versions_conf_profile | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_libraries {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    required: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    metadata_fields: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_metadata_fields[] | null;
    permissions_conf: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_permissions_conf | null;
    versions_conf: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_versions_conf | null;
    libraries: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute_libraries[] | null;
    unique: boolean | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes =
    | SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_permissions_conf {
    permissionTreeAttributes: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_versions_conf_profile_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_versions_conf_profile {
    id: string;
    label: SystemTranslation;
    trees: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_versions_conf_profile_trees[];
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    profile: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_versions_conf_profile | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_libraries {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_linked_library {
    id: string;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    required: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    metadata_fields: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_metadata_fields[] | null;
    permissions_conf: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_permissions_conf | null;
    versions_conf: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_versions_conf | null;
    libraries: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_libraries[] | null;
    linked_library: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute_linked_library | null;
    reverse_link: string | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes =
    | SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_permissions_conf {
    permissionTreeAttributes: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_versions_conf_profile_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_versions_conf_profile {
    id: string;
    label: SystemTranslation;
    trees: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_versions_conf_profile_trees[];
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    profile: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_versions_conf_profile | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_libraries {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_linked_tree {
    id: string;
}

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    required: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    metadata_fields: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_metadata_fields[] | null;
    permissions_conf: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_permissions_conf | null;
    versions_conf: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_versions_conf | null;
    libraries: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_libraries[] | null;
    linked_tree: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute_linked_tree | null;
}

export type SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes =
    | SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_StandardAttribute
    | SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_LinkAttribute
    | SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes_TreeAttribute;

export interface SAVE_LIBRARY_ATTRIBUTES_saveLibrary {
    id: string;
    attributes: SAVE_LIBRARY_ATTRIBUTES_saveLibrary_attributes[] | null;
}

export interface SAVE_LIBRARY_ATTRIBUTES {
    saveLibrary: SAVE_LIBRARY_ATTRIBUTES_saveLibrary;
}

export interface SAVE_LIBRARY_ATTRIBUTESVariables {
    libId: string;
    attributes: string[];
}
