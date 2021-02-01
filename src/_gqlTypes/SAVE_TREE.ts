// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {TreeInput, TreeBehavior, AttributeType, PermissionsRelation} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_TREE
// ====================================================

export interface SAVE_TREE_saveTree_libraries_library_attributes_StandardAttribute {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
}

export interface SAVE_TREE_saveTree_libraries_library_attributes_TreeAttribute_linked_tree {
    id: string;
}

export interface SAVE_TREE_saveTree_libraries_library_attributes_TreeAttribute {
    id: string;
    label: SystemTranslation | null;
    type: AttributeType;
    linked_tree: SAVE_TREE_saveTree_libraries_library_attributes_TreeAttribute_linked_tree | null;
}

export type SAVE_TREE_saveTree_libraries_library_attributes =
    | SAVE_TREE_saveTree_libraries_library_attributes_StandardAttribute
    | SAVE_TREE_saveTree_libraries_library_attributes_TreeAttribute;

export interface SAVE_TREE_saveTree_libraries_library {
    id: string;
    label: SystemTranslation | null;
    attributes: SAVE_TREE_saveTree_libraries_library_attributes[] | null;
}

export interface SAVE_TREE_saveTree_libraries_settings {
    allowMultiplePositions: boolean;
}

export interface SAVE_TREE_saveTree_libraries {
    library: SAVE_TREE_saveTree_libraries_library;
    settings: SAVE_TREE_saveTree_libraries_settings;
}

export interface SAVE_TREE_saveTree_permissions_conf_permissionsConf_permissionTreeAttributes {
    id: string;
    label: SystemTranslation | null;
}

export interface SAVE_TREE_saveTree_permissions_conf_permissionsConf {
    permissionTreeAttributes: SAVE_TREE_saveTree_permissions_conf_permissionsConf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface SAVE_TREE_saveTree_permissions_conf {
    libraryId: string;
    permissionsConf: SAVE_TREE_saveTree_permissions_conf_permissionsConf;
}

export interface SAVE_TREE_saveTree {
    id: string;
    system: boolean;
    label: SystemTranslation | null;
    behavior: TreeBehavior;
    libraries: SAVE_TREE_saveTree_libraries[];
    permissions_conf: SAVE_TREE_saveTree_permissions_conf[] | null;
}

export interface SAVE_TREE {
    saveTree: SAVE_TREE_saveTree;
}

export interface SAVE_TREEVariables {
    treeData: TreeInput;
}
