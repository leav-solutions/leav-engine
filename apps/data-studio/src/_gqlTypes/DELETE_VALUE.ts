// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {ValueInput, LibraryBehavior, AttributeFormat, AttributeType} from './globalTypes';

// ====================================================
// GraphQL mutation operation: DELETE_VALUE
// ====================================================

export interface DELETE_VALUE_deleteValue_Value_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface DELETE_VALUE_deleteValue_Value_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: DELETE_VALUE_deleteValue_Value_modified_by_whoAmI_library_gqlNames;
}

export interface DELETE_VALUE_deleteValue_Value_modified_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: DELETE_VALUE_deleteValue_Value_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface DELETE_VALUE_deleteValue_Value_modified_by {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_Value_modified_by_whoAmI;
}

export interface DELETE_VALUE_deleteValue_Value_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface DELETE_VALUE_deleteValue_Value_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: DELETE_VALUE_deleteValue_Value_created_by_whoAmI_library_gqlNames;
}

export interface DELETE_VALUE_deleteValue_Value_created_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: DELETE_VALUE_deleteValue_Value_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface DELETE_VALUE_deleteValue_Value_created_by {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_Value_created_by_whoAmI;
}

export interface DELETE_VALUE_deleteValue_Value_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface DELETE_VALUE_deleteValue_Value_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: DELETE_VALUE_deleteValue_Value_version_treeNode_record_whoAmI_library;
}

export interface DELETE_VALUE_deleteValue_Value_version_treeNode_record {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_Value_version_treeNode_record_whoAmI;
}

export interface DELETE_VALUE_deleteValue_Value_version_treeNode {
    id: string;
    record: DELETE_VALUE_deleteValue_Value_version_treeNode_record | null;
}

export interface DELETE_VALUE_deleteValue_Value_version {
    treeId: string;
    treeNode: DELETE_VALUE_deleteValue_Value_version_treeNode | null;
}

export interface DELETE_VALUE_deleteValue_Value_attribute {
    id: string;
    format: AttributeFormat | null;
    type: AttributeType;
    system: boolean;
}

export interface DELETE_VALUE_deleteValue_Value_metadata_value_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface DELETE_VALUE_deleteValue_Value_metadata_value_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: DELETE_VALUE_deleteValue_Value_metadata_value_modified_by_whoAmI_library_gqlNames;
}

export interface DELETE_VALUE_deleteValue_Value_metadata_value_modified_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: DELETE_VALUE_deleteValue_Value_metadata_value_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface DELETE_VALUE_deleteValue_Value_metadata_value_modified_by {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_Value_metadata_value_modified_by_whoAmI;
}

export interface DELETE_VALUE_deleteValue_Value_metadata_value_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface DELETE_VALUE_deleteValue_Value_metadata_value_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: DELETE_VALUE_deleteValue_Value_metadata_value_created_by_whoAmI_library_gqlNames;
}

export interface DELETE_VALUE_deleteValue_Value_metadata_value_created_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: DELETE_VALUE_deleteValue_Value_metadata_value_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface DELETE_VALUE_deleteValue_Value_metadata_value_created_by {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_Value_metadata_value_created_by_whoAmI;
}

export interface DELETE_VALUE_deleteValue_Value_metadata_value_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface DELETE_VALUE_deleteValue_Value_metadata_value_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: DELETE_VALUE_deleteValue_Value_metadata_value_version_treeNode_record_whoAmI_library;
}

export interface DELETE_VALUE_deleteValue_Value_metadata_value_version_treeNode_record {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_Value_metadata_value_version_treeNode_record_whoAmI;
}

export interface DELETE_VALUE_deleteValue_Value_metadata_value_version_treeNode {
    id: string;
    record: DELETE_VALUE_deleteValue_Value_metadata_value_version_treeNode_record | null;
}

export interface DELETE_VALUE_deleteValue_Value_metadata_value_version {
    treeId: string;
    treeNode: DELETE_VALUE_deleteValue_Value_metadata_value_version_treeNode | null;
}

export interface DELETE_VALUE_deleteValue_Value_metadata_value {
    id_value: string | null;
    modified_at: number | null;
    modified_by: DELETE_VALUE_deleteValue_Value_metadata_value_modified_by | null;
    created_at: number | null;
    created_by: DELETE_VALUE_deleteValue_Value_metadata_value_created_by | null;
    version: (DELETE_VALUE_deleteValue_Value_metadata_value_version | null)[] | null;
    value: Any | null;
    raw_value: Any | null;
}

export interface DELETE_VALUE_deleteValue_Value_metadata {
    name: string;
    value: DELETE_VALUE_deleteValue_Value_metadata_value | null;
}

export interface DELETE_VALUE_deleteValue_Value {
    id_value: string | null;
    modified_at: number | null;
    modified_by: DELETE_VALUE_deleteValue_Value_modified_by | null;
    created_at: number | null;
    created_by: DELETE_VALUE_deleteValue_Value_created_by | null;
    version: (DELETE_VALUE_deleteValue_Value_version | null)[] | null;
    attribute: DELETE_VALUE_deleteValue_Value_attribute | null;
    metadata: (DELETE_VALUE_deleteValue_Value_metadata | null)[] | null;
    value: Any | null;
    raw_value: Any | null;
}

export interface DELETE_VALUE_deleteValue_LinkValue_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface DELETE_VALUE_deleteValue_LinkValue_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: DELETE_VALUE_deleteValue_LinkValue_modified_by_whoAmI_library_gqlNames;
}

export interface DELETE_VALUE_deleteValue_LinkValue_modified_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: DELETE_VALUE_deleteValue_LinkValue_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface DELETE_VALUE_deleteValue_LinkValue_modified_by {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_LinkValue_modified_by_whoAmI;
}

export interface DELETE_VALUE_deleteValue_LinkValue_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface DELETE_VALUE_deleteValue_LinkValue_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: DELETE_VALUE_deleteValue_LinkValue_created_by_whoAmI_library_gqlNames;
}

export interface DELETE_VALUE_deleteValue_LinkValue_created_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: DELETE_VALUE_deleteValue_LinkValue_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface DELETE_VALUE_deleteValue_LinkValue_created_by {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_LinkValue_created_by_whoAmI;
}

export interface DELETE_VALUE_deleteValue_LinkValue_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface DELETE_VALUE_deleteValue_LinkValue_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: DELETE_VALUE_deleteValue_LinkValue_version_treeNode_record_whoAmI_library;
}

export interface DELETE_VALUE_deleteValue_LinkValue_version_treeNode_record {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_LinkValue_version_treeNode_record_whoAmI;
}

export interface DELETE_VALUE_deleteValue_LinkValue_version_treeNode {
    id: string;
    record: DELETE_VALUE_deleteValue_LinkValue_version_treeNode_record | null;
}

export interface DELETE_VALUE_deleteValue_LinkValue_version {
    treeId: string;
    treeNode: DELETE_VALUE_deleteValue_LinkValue_version_treeNode | null;
}

export interface DELETE_VALUE_deleteValue_LinkValue_attribute {
    id: string;
    format: AttributeFormat | null;
    type: AttributeType;
    system: boolean;
}

export interface DELETE_VALUE_deleteValue_LinkValue_metadata_value_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface DELETE_VALUE_deleteValue_LinkValue_metadata_value_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: DELETE_VALUE_deleteValue_LinkValue_metadata_value_modified_by_whoAmI_library_gqlNames;
}

export interface DELETE_VALUE_deleteValue_LinkValue_metadata_value_modified_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: DELETE_VALUE_deleteValue_LinkValue_metadata_value_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface DELETE_VALUE_deleteValue_LinkValue_metadata_value_modified_by {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_LinkValue_metadata_value_modified_by_whoAmI;
}

export interface DELETE_VALUE_deleteValue_LinkValue_metadata_value_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface DELETE_VALUE_deleteValue_LinkValue_metadata_value_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: DELETE_VALUE_deleteValue_LinkValue_metadata_value_created_by_whoAmI_library_gqlNames;
}

export interface DELETE_VALUE_deleteValue_LinkValue_metadata_value_created_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: DELETE_VALUE_deleteValue_LinkValue_metadata_value_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface DELETE_VALUE_deleteValue_LinkValue_metadata_value_created_by {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_LinkValue_metadata_value_created_by_whoAmI;
}

export interface DELETE_VALUE_deleteValue_LinkValue_metadata_value_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface DELETE_VALUE_deleteValue_LinkValue_metadata_value_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: DELETE_VALUE_deleteValue_LinkValue_metadata_value_version_treeNode_record_whoAmI_library;
}

export interface DELETE_VALUE_deleteValue_LinkValue_metadata_value_version_treeNode_record {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_LinkValue_metadata_value_version_treeNode_record_whoAmI;
}

export interface DELETE_VALUE_deleteValue_LinkValue_metadata_value_version_treeNode {
    id: string;
    record: DELETE_VALUE_deleteValue_LinkValue_metadata_value_version_treeNode_record | null;
}

export interface DELETE_VALUE_deleteValue_LinkValue_metadata_value_version {
    treeId: string;
    treeNode: DELETE_VALUE_deleteValue_LinkValue_metadata_value_version_treeNode | null;
}

export interface DELETE_VALUE_deleteValue_LinkValue_metadata_value {
    id_value: string | null;
    modified_at: number | null;
    modified_by: DELETE_VALUE_deleteValue_LinkValue_metadata_value_modified_by | null;
    created_at: number | null;
    created_by: DELETE_VALUE_deleteValue_LinkValue_metadata_value_created_by | null;
    version: (DELETE_VALUE_deleteValue_LinkValue_metadata_value_version | null)[] | null;
    value: Any | null;
    raw_value: Any | null;
}

export interface DELETE_VALUE_deleteValue_LinkValue_metadata {
    name: string;
    value: DELETE_VALUE_deleteValue_LinkValue_metadata_value | null;
}

export interface DELETE_VALUE_deleteValue_LinkValue_linkValue_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface DELETE_VALUE_deleteValue_LinkValue_linkValue_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: DELETE_VALUE_deleteValue_LinkValue_linkValue_whoAmI_library_gqlNames;
}

export interface DELETE_VALUE_deleteValue_LinkValue_linkValue_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: DELETE_VALUE_deleteValue_LinkValue_linkValue_whoAmI_library;
    preview: Preview | null;
}

export interface DELETE_VALUE_deleteValue_LinkValue_linkValue {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_LinkValue_linkValue_whoAmI;
}

export interface DELETE_VALUE_deleteValue_LinkValue {
    id_value: string | null;
    modified_at: number | null;
    modified_by: DELETE_VALUE_deleteValue_LinkValue_modified_by | null;
    created_at: number | null;
    created_by: DELETE_VALUE_deleteValue_LinkValue_created_by | null;
    version: (DELETE_VALUE_deleteValue_LinkValue_version | null)[] | null;
    attribute: DELETE_VALUE_deleteValue_LinkValue_attribute | null;
    metadata: (DELETE_VALUE_deleteValue_LinkValue_metadata | null)[] | null;
    linkValue: DELETE_VALUE_deleteValue_LinkValue_linkValue | null;
}

export interface DELETE_VALUE_deleteValue_TreeValue_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface DELETE_VALUE_deleteValue_TreeValue_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: DELETE_VALUE_deleteValue_TreeValue_modified_by_whoAmI_library_gqlNames;
}

export interface DELETE_VALUE_deleteValue_TreeValue_modified_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: DELETE_VALUE_deleteValue_TreeValue_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface DELETE_VALUE_deleteValue_TreeValue_modified_by {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_TreeValue_modified_by_whoAmI;
}

export interface DELETE_VALUE_deleteValue_TreeValue_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface DELETE_VALUE_deleteValue_TreeValue_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: DELETE_VALUE_deleteValue_TreeValue_created_by_whoAmI_library_gqlNames;
}

export interface DELETE_VALUE_deleteValue_TreeValue_created_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: DELETE_VALUE_deleteValue_TreeValue_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface DELETE_VALUE_deleteValue_TreeValue_created_by {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_TreeValue_created_by_whoAmI;
}

export interface DELETE_VALUE_deleteValue_TreeValue_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface DELETE_VALUE_deleteValue_TreeValue_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: DELETE_VALUE_deleteValue_TreeValue_version_treeNode_record_whoAmI_library;
}

export interface DELETE_VALUE_deleteValue_TreeValue_version_treeNode_record {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_TreeValue_version_treeNode_record_whoAmI;
}

export interface DELETE_VALUE_deleteValue_TreeValue_version_treeNode {
    id: string;
    record: DELETE_VALUE_deleteValue_TreeValue_version_treeNode_record | null;
}

export interface DELETE_VALUE_deleteValue_TreeValue_version {
    treeId: string;
    treeNode: DELETE_VALUE_deleteValue_TreeValue_version_treeNode | null;
}

export interface DELETE_VALUE_deleteValue_TreeValue_attribute {
    id: string;
    format: AttributeFormat | null;
    type: AttributeType;
    system: boolean;
}

export interface DELETE_VALUE_deleteValue_TreeValue_metadata_value_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface DELETE_VALUE_deleteValue_TreeValue_metadata_value_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: DELETE_VALUE_deleteValue_TreeValue_metadata_value_modified_by_whoAmI_library_gqlNames;
}

export interface DELETE_VALUE_deleteValue_TreeValue_metadata_value_modified_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: DELETE_VALUE_deleteValue_TreeValue_metadata_value_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface DELETE_VALUE_deleteValue_TreeValue_metadata_value_modified_by {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_TreeValue_metadata_value_modified_by_whoAmI;
}

export interface DELETE_VALUE_deleteValue_TreeValue_metadata_value_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface DELETE_VALUE_deleteValue_TreeValue_metadata_value_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: DELETE_VALUE_deleteValue_TreeValue_metadata_value_created_by_whoAmI_library_gqlNames;
}

export interface DELETE_VALUE_deleteValue_TreeValue_metadata_value_created_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: DELETE_VALUE_deleteValue_TreeValue_metadata_value_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface DELETE_VALUE_deleteValue_TreeValue_metadata_value_created_by {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_TreeValue_metadata_value_created_by_whoAmI;
}

export interface DELETE_VALUE_deleteValue_TreeValue_metadata_value_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface DELETE_VALUE_deleteValue_TreeValue_metadata_value_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: DELETE_VALUE_deleteValue_TreeValue_metadata_value_version_treeNode_record_whoAmI_library;
}

export interface DELETE_VALUE_deleteValue_TreeValue_metadata_value_version_treeNode_record {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_TreeValue_metadata_value_version_treeNode_record_whoAmI;
}

export interface DELETE_VALUE_deleteValue_TreeValue_metadata_value_version_treeNode {
    id: string;
    record: DELETE_VALUE_deleteValue_TreeValue_metadata_value_version_treeNode_record | null;
}

export interface DELETE_VALUE_deleteValue_TreeValue_metadata_value_version {
    treeId: string;
    treeNode: DELETE_VALUE_deleteValue_TreeValue_metadata_value_version_treeNode | null;
}

export interface DELETE_VALUE_deleteValue_TreeValue_metadata_value {
    id_value: string | null;
    modified_at: number | null;
    modified_by: DELETE_VALUE_deleteValue_TreeValue_metadata_value_modified_by | null;
    created_at: number | null;
    created_by: DELETE_VALUE_deleteValue_TreeValue_metadata_value_created_by | null;
    version: (DELETE_VALUE_deleteValue_TreeValue_metadata_value_version | null)[] | null;
    value: Any | null;
    raw_value: Any | null;
}

export interface DELETE_VALUE_deleteValue_TreeValue_metadata {
    name: string;
    value: DELETE_VALUE_deleteValue_TreeValue_metadata_value | null;
}

export interface DELETE_VALUE_deleteValue_TreeValue_treeValue_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface DELETE_VALUE_deleteValue_TreeValue_treeValue_record_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: DELETE_VALUE_deleteValue_TreeValue_treeValue_record_whoAmI_library_gqlNames;
}

export interface DELETE_VALUE_deleteValue_TreeValue_treeValue_record_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: DELETE_VALUE_deleteValue_TreeValue_treeValue_record_whoAmI_library;
    preview: Preview | null;
}

export interface DELETE_VALUE_deleteValue_TreeValue_treeValue_record {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_TreeValue_treeValue_record_whoAmI;
}

export interface DELETE_VALUE_deleteValue_TreeValue_treeValue_ancestors_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface DELETE_VALUE_deleteValue_TreeValue_treeValue_ancestors_record_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: DELETE_VALUE_deleteValue_TreeValue_treeValue_ancestors_record_whoAmI_library_gqlNames;
}

export interface DELETE_VALUE_deleteValue_TreeValue_treeValue_ancestors_record_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: DELETE_VALUE_deleteValue_TreeValue_treeValue_ancestors_record_whoAmI_library;
    preview: Preview | null;
}

export interface DELETE_VALUE_deleteValue_TreeValue_treeValue_ancestors_record {
    id: string;
    whoAmI: DELETE_VALUE_deleteValue_TreeValue_treeValue_ancestors_record_whoAmI;
}

export interface DELETE_VALUE_deleteValue_TreeValue_treeValue_ancestors {
    record: DELETE_VALUE_deleteValue_TreeValue_treeValue_ancestors_record | null;
}

export interface DELETE_VALUE_deleteValue_TreeValue_treeValue {
    id: string;
    record: DELETE_VALUE_deleteValue_TreeValue_treeValue_record | null;
    ancestors: DELETE_VALUE_deleteValue_TreeValue_treeValue_ancestors[] | null;
}

export interface DELETE_VALUE_deleteValue_TreeValue {
    id_value: string | null;
    modified_at: number | null;
    modified_by: DELETE_VALUE_deleteValue_TreeValue_modified_by | null;
    created_at: number | null;
    created_by: DELETE_VALUE_deleteValue_TreeValue_created_by | null;
    version: (DELETE_VALUE_deleteValue_TreeValue_version | null)[] | null;
    attribute: DELETE_VALUE_deleteValue_TreeValue_attribute | null;
    metadata: (DELETE_VALUE_deleteValue_TreeValue_metadata | null)[] | null;
    treeValue: DELETE_VALUE_deleteValue_TreeValue_treeValue | null;
}

export type DELETE_VALUE_deleteValue =
    | DELETE_VALUE_deleteValue_Value
    | DELETE_VALUE_deleteValue_LinkValue
    | DELETE_VALUE_deleteValue_TreeValue;

export interface DELETE_VALUE {
    deleteValue: DELETE_VALUE_deleteValue;
}

export interface DELETE_VALUEVariables {
    library: string;
    recordId: string;
    attribute: string;
    value?: ValueInput | null;
}
