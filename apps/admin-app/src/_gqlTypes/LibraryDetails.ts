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
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface LibraryDetails_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: any | null;
}

export interface LibraryDetails_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface LibraryDetails_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: any | null;
    linked_tree: LibraryDetails_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type LibraryDetails_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes =
    | LibraryDetails_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | LibraryDetails_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface LibraryDetails_attributes_StandardAttribute_permissions_conf {
    permissionTreeAttributes: LibraryDetails_attributes_StandardAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface LibraryDetails_attributes_StandardAttribute_versions_conf_profile_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface LibraryDetails_attributes_StandardAttribute_versions_conf_profile {
    id: string;
    label: SystemTranslation;
    trees: LibraryDetails_attributes_StandardAttribute_versions_conf_profile_trees[];
}

export interface LibraryDetails_attributes_StandardAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    profile: LibraryDetails_attributes_StandardAttribute_versions_conf_profile | null;
}

export interface LibraryDetails_attributes_StandardAttribute_libraries {
    id: string;
    label: any | null;
}

export interface LibraryDetails_attributes_StandardAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    metadata_fields: LibraryDetails_attributes_StandardAttribute_metadata_fields[] | null;
    permissions_conf: LibraryDetails_attributes_StandardAttribute_permissions_conf | null;
    versions_conf: LibraryDetails_attributes_StandardAttribute_versions_conf | null;
    libraries: LibraryDetails_attributes_StandardAttribute_libraries[] | null;
}

export interface LibraryDetails_attributes_LinkAttribute_metadata_fields {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface LibraryDetails_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: any | null;
}

export interface LibraryDetails_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface LibraryDetails_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: any | null;
    linked_tree: LibraryDetails_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type LibraryDetails_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes =
    | LibraryDetails_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | LibraryDetails_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface LibraryDetails_attributes_LinkAttribute_permissions_conf {
    permissionTreeAttributes: LibraryDetails_attributes_LinkAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface LibraryDetails_attributes_LinkAttribute_versions_conf_profile_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface LibraryDetails_attributes_LinkAttribute_versions_conf_profile {
    id: string;
    label: SystemTranslation;
    trees: LibraryDetails_attributes_LinkAttribute_versions_conf_profile_trees[];
}

export interface LibraryDetails_attributes_LinkAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    profile: LibraryDetails_attributes_LinkAttribute_versions_conf_profile | null;
}

export interface LibraryDetails_attributes_LinkAttribute_libraries {
    id: string;
    label: any | null;
}

export interface LibraryDetails_attributes_LinkAttribute_linked_library {
    id: string;
}

export interface LibraryDetails_attributes_LinkAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    metadata_fields: LibraryDetails_attributes_LinkAttribute_metadata_fields[] | null;
    permissions_conf: LibraryDetails_attributes_LinkAttribute_permissions_conf | null;
    versions_conf: LibraryDetails_attributes_LinkAttribute_versions_conf | null;
    libraries: LibraryDetails_attributes_LinkAttribute_libraries[] | null;
    linked_library: LibraryDetails_attributes_LinkAttribute_linked_library | null;
    reverse_link: string | null;
}

export interface LibraryDetails_attributes_TreeAttribute_metadata_fields {
    id: string;
    label: any | null;
    type: AttributeType;
    format: AttributeFormat | null;
}

export interface LibraryDetails_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: any | null;
}

export interface LibraryDetails_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface LibraryDetails_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: any | null;
    linked_tree: LibraryDetails_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type LibraryDetails_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes =
    | LibraryDetails_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_StandardAttribute
    | LibraryDetails_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes_TreeAttribute;

export interface LibraryDetails_attributes_TreeAttribute_permissions_conf {
    permissionTreeAttributes: LibraryDetails_attributes_TreeAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface LibraryDetails_attributes_TreeAttribute_versions_conf_profile_trees {
    id: string;
    label: SystemTranslation | null;
}

export interface LibraryDetails_attributes_TreeAttribute_versions_conf_profile {
    id: string;
    label: SystemTranslation;
    trees: LibraryDetails_attributes_TreeAttribute_versions_conf_profile_trees[];
}

export interface LibraryDetails_attributes_TreeAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    profile: LibraryDetails_attributes_TreeAttribute_versions_conf_profile | null;
}

export interface LibraryDetails_attributes_TreeAttribute_libraries {
    id: string;
    label: any | null;
}

export interface LibraryDetails_attributes_TreeAttribute_linked_tree {
    id: string;
}

export interface LibraryDetails_attributes_TreeAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    readonly: boolean;
    label: SystemTranslation | null;
    description: SystemTranslation | null;
    multiple_values: boolean;
    metadata_fields: LibraryDetails_attributes_TreeAttribute_metadata_fields[] | null;
    permissions_conf: LibraryDetails_attributes_TreeAttribute_permissions_conf | null;
    versions_conf: LibraryDetails_attributes_TreeAttribute_versions_conf | null;
    libraries: LibraryDetails_attributes_TreeAttribute_libraries[] | null;
    linked_tree: LibraryDetails_attributes_TreeAttribute_linked_tree | null;
}

export type LibraryDetails_attributes =
    | LibraryDetails_attributes_StandardAttribute
    | LibraryDetails_attributes_LinkAttribute
    | LibraryDetails_attributes_TreeAttribute;

export interface LibraryDetails_fullTextAttributes {
    id: string;
    label: any | null;
}

export interface LibraryDetails_permissions_conf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: any | null;
}

export interface LibraryDetails_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface LibraryDetails_permissions_conf_permissionTreeAttributes_TreeAttribute {
    id: string;
    linked_tree: LibraryDetails_permissions_conf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
    label: any | null;
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
    treeColorPreview: string | null;
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

export interface LibraryDetails_icon_whoAmI_library {
    id: string;
    label: any | null;
}

export interface LibraryDetails_icon_whoAmI_preview {
    tiny: string | null;
    small: string | null;
    medium: string | null;
    big: string | null;
    huge: string | null;
    pdf: string | null;
}

export interface LibraryDetails_icon_whoAmI {
    id: string;
    library: LibraryDetails_icon_whoAmI_library;
    label: string | null;
    color: string | null;
    preview: LibraryDetails_icon_whoAmI_preview | null;
}

export interface LibraryDetails_icon {
    whoAmI: LibraryDetails_icon_whoAmI;
}

export interface LibraryDetails {
    id: string;
    system: boolean | null;
    label: any | null;
    behavior: LibraryBehavior;
    attributes: LibraryDetails_attributes[] | null;
    fullTextAttributes: LibraryDetails_fullTextAttributes[] | null;
    permissions_conf: LibraryDetails_permissions_conf | null;
    recordIdentityConf: LibraryDetails_recordIdentityConf | null;
    defaultView: LibraryDetails_defaultView | null;
    gqlNames: LibraryDetails_gqlNames;
    permissions: LibraryDetails_permissions | null;
    icon: LibraryDetails_icon | null;
}
