// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {TreeBehavior, PermissionsRelation, AttributeType} from './globalTypes';

// ====================================================
// GraphQL query operation: GET_TREE_BY_ID
// ====================================================

export interface GET_TREE_BY_ID_trees_list_permissions_conf_permissionsConf_permissionTreeAttributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
}

export interface GET_TREE_BY_ID_trees_list_permissions_conf_permissionsConf_permissionTreeAttributes_TreeAttribute_linked_tree {
    id: string;
}

export interface GET_TREE_BY_ID_trees_list_permissions_conf_permissionsConf_permissionTreeAttributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    linked_tree: GET_TREE_BY_ID_trees_list_permissions_conf_permissionsConf_permissionTreeAttributes_TreeAttribute_linked_tree | null;
}

export type GET_TREE_BY_ID_trees_list_permissions_conf_permissionsConf_permissionTreeAttributes =
    | GET_TREE_BY_ID_trees_list_permissions_conf_permissionsConf_permissionTreeAttributes_StandardAttribute
    | GET_TREE_BY_ID_trees_list_permissions_conf_permissionsConf_permissionTreeAttributes_TreeAttribute;

export interface GET_TREE_BY_ID_trees_list_permissions_conf_permissionsConf {
    permissionTreeAttributes: GET_TREE_BY_ID_trees_list_permissions_conf_permissionsConf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface GET_TREE_BY_ID_trees_list_permissions_conf {
    libraryId: string;
    permissionsConf: GET_TREE_BY_ID_trees_list_permissions_conf_permissionsConf;
}

export interface GET_TREE_BY_ID_trees_list_libraries_library_attributes {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
}

export interface GET_TREE_BY_ID_trees_list_libraries_library {
    id: string;
    label: SystemTranslation | null;
    attributes: GET_TREE_BY_ID_trees_list_libraries_library_attributes[] | null;
}

export interface GET_TREE_BY_ID_trees_list_libraries_settings {
    allowMultiplePositions: boolean;
    allowedAtRoot: boolean;
    allowedChildren: string[];
}

export interface GET_TREE_BY_ID_trees_list_libraries {
    library: GET_TREE_BY_ID_trees_list_libraries_library;
    settings: GET_TREE_BY_ID_trees_list_libraries_settings;
}

export interface GET_TREE_BY_ID_trees_list {
    id: string;
    label: SystemTranslation | null;
    system: boolean;
    behavior: TreeBehavior;
    permissions_conf: GET_TREE_BY_ID_trees_list_permissions_conf[] | null;
    libraries: GET_TREE_BY_ID_trees_list_libraries[];
}

export interface GET_TREE_BY_ID_trees {
    totalCount: number;
    list: GET_TREE_BY_ID_trees_list[];
}

export interface GET_TREE_BY_ID {
    trees: GET_TREE_BY_ID_trees | null;
}

export interface GET_TREE_BY_IDVariables {
    id?: string[] | null;
}
