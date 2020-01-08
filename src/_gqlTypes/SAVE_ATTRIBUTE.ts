/* tslint:disable */
/* eslint-disable */
// This file was automatically generated and should not be edited.

import {AttributeInput, AttributeType, AttributeFormat, PermissionsRelation, ValueVersionMode} from './globalTypes';

// ====================================================
// GraphQL mutation operation: SAVE_ATTRIBUTE
// ====================================================

export interface SAVE_ATTRIBUTE_saveAttribute_permissions_conf_permissionTreeAttributes {
    id: string;
    linked_tree: string | null;
    label: any | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute_permissions_conf {
    permissionTreeAttributes: SAVE_ATTRIBUTE_saveAttribute_permissions_conf_permissionTreeAttributes[];
    relation: PermissionsRelation;
}

export interface SAVE_ATTRIBUTE_saveAttribute_versions_conf {
    versionable: boolean;
    mode: ValueVersionMode | null;
    trees: string[] | null;
}

export interface SAVE_ATTRIBUTE_saveAttribute {
    id: string;
    type: AttributeType;
    format: AttributeFormat | null;
    system: boolean;
    label: any | null;
    linked_library: string | null;
    linked_tree: string | null;
    multiple_values: boolean;
    permissions_conf: SAVE_ATTRIBUTE_saveAttribute_permissions_conf | null;
    versions_conf: SAVE_ATTRIBUTE_saveAttribute_versions_conf | null;
}

export interface SAVE_ATTRIBUTE {
    saveAttribute: SAVE_ATTRIBUTE_saveAttribute;
}

export interface SAVE_ATTRIBUTEVariables {
    attrData: AttributeInput;
}
