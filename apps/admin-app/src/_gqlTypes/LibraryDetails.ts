// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {LibraryBehavior, AttributeType, AttributeFormat, PermissionsRelation, ValueVersionMode} from './globalTypes';

// ====================================================
// GraphQL fragment: LibraryDetails
// ====================================================

export interface LibraryDetails_attributes_StandardAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface LibraryDetails_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface LibraryDetails_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface LibraryDetails_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: LibraryDetails_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type LibraryDetails_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes =
    | LibraryDetails_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | LibraryDetails_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface LibraryDetails_attributes_StandardAttribute_permissions_conf {
    permissionTreeAttributes: LibraryDetails_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface LibraryDetails_attributes_StandardAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface LibraryDetails_attributes_StandardAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    metadata_fields: LibraryDetails_attributes_StandardAttribute_metadata_fields[] | null;
    permissions_conf: LibraryDetails_attributes_StandardAttribute_permissions_conf | null;
    versions_conf: LibraryDetails_attributes_StandardAttribute_versions_conf | null;
}

export interface LibraryDetails_attributes_LinkAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface LibraryDetails_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface LibraryDetails_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface LibraryDetails_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: LibraryDetails_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type LibraryDetails_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes =
    | LibraryDetails_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | LibraryDetails_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface LibraryDetails_attributes_LinkAttribute_permissions_conf {
    permissionTreeAttributes: LibraryDetails_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface LibraryDetails_attributes_LinkAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface LibraryDetails_attributes_LinkAttribute_linked_library {
    id: string;
}

export interface LibraryDetails_attributes_LinkAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    metadata_fields: LibraryDetails_attributes_LinkAttribute_metadata_fields[] | null;
    permissions_conf: LibraryDetails_attributes_LinkAttribute_permissions_conf | null;
    versions_conf: LibraryDetails_attributes_LinkAttribute_versions_conf | null;
    linked_library: LibraryDetails_attributes_LinkAttribute_linked_library | null;
}

export interface LibraryDetails_attributes_TreeAttribute_metadata_fields {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface LibraryDetails_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface LibraryDetails_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface LibraryDetails_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: LibraryDetails_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type LibraryDetails_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes =
    | LibraryDetails_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | LibraryDetails_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface LibraryDetails_attributes_TreeAttribute_permissions_conf {
    permissionTreeAttributes: LibraryDetails_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface LibraryDetails_attributes_TreeAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface LibraryDetails_attributes_TreeAttribute_linked_tree {
    id: string;
}

export interface LibraryDetails_attributes_TreeAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    metadata_fields: LibraryDetails_attributes_TreeAttribute_metadata_fields[] | null;
    permissions_conf: LibraryDetails_attributes_TreeAttribute_permissions_conf | null;
    versions_conf: LibraryDetails_attributes_TreeAttribute_versions_conf | null;
    linked_tree: LibraryDetails_attributes_TreeAttribute_linked_tree | null;
}

export type LibraryDetails_attributes =
    | LibraryDetails_attributes_StandardAttribute
    | LibraryDetails_attributes_LinkAttribute
    | LibraryDetails_attributes_TreeAttribute;

export interface LibraryDetails_fullTextAttributes {
    id: string;
    label: SystemTranslation | null;
}

export interface LibraryDetails_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface LibraryDetails_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface LibraryDetails_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    linked_tree: LibraryDetails_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
    label: SystemTranslation | null;
}

export type LibraryDetails_permissions_conf_permissionTreeAttributes =
    | LibraryDetails_permissions_conf_permissionTreeAttributes_StandardAttribute
    | LibraryDetails_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface LibraryDetails_permissions_conf {
    permissionTreeAttributes: LibraryDetails_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface LibraryDetails_recordIdentityConf {
    label: string | null;
    color: string | null;
    preview: string | null;
}

export interface LibraryDetails_defaultView {
    id: string;
}

export interface LibraryDetails_gqlNames {
    query: string;
    type: string;
    list: string;
    filter: string;
    searchableFields: string;
}

export interface LibraryDetails_permissions {
    admin_library: boolean;
    access_library: boolean;
    access_record: boolean;
    create_record: boolean;
    edit_record: boolean;
    delete_record: boolean;
}

export interface LibraryDetails {
    id: string;
    system: boolean | null;
    label: SystemTranslation | null;
    behavior: LibraryBehavior;
    attributes: LibraryDetails_attributes[] | null;
    fullTextAttributes: LibraryDetails_fullTextAttributes[] | null;
    permissions_conf: LibraryDetails_permissions_conf | null;
    recordIdentityConf: LibraryDetails_recordIdentityConf | null;
    defaultView: LibraryDetails_defaultView | null;
    gqlNames: LibraryDetails_gqlNames;
    permissions: LibraryDetails_permissions | null;
}
