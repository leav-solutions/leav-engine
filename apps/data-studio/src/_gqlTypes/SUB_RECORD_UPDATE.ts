// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {RecordUpdateFilterInput, LibraryBehavior, AttributeFormat, AttributeType} from './globalTypes';

// ====================================================
// GraphQL subscription operation: SUB_RECORD_UPDATE
// ====================================================

export interface SUB_RECORD_UPDATE_recordUpdate_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_record_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: SUB_RECORD_UPDATE_recordUpdate_record_whoAmI_library_gqlNames;
}

export interface SUB_RECORD_UPDATE_recordUpdate_record_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_record_whoAmI_library;
    preview: Preview | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_record_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_record_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: SUB_RECORD_UPDATE_recordUpdate_record_modified_by_whoAmI_library_gqlNames;
}

export interface SUB_RECORD_UPDATE_recordUpdate_record_modified_by_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_record_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_record_modified_by {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_record_modified_by_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_record {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_record_whoAmI;
    modified_by: SUB_RECORD_UPDATE_recordUpdate_record_modified_by | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_modified_by_whoAmI_library_gqlNames;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_modified_by_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_modified_by {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_modified_by_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_created_by_whoAmI_library_gqlNames;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_created_by_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_created_by {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_created_by_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_version_treeNode_record_whoAmI_library;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_version_treeNode_record {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_version_treeNode_record_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_version_treeNode {
    id: string;
    record: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_version_treeNode_record | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_version {
    treeId: string;
    treeNode: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_version_treeNode | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_attribute {
    id: string;
    format: AttributeFormat | null;
    type: AttributeType;
    system: boolean;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_modified_by_whoAmI_library_gqlNames;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_modified_by_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_modified_by {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_modified_by_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_created_by_whoAmI_library_gqlNames;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_created_by_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_created_by {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_created_by_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_version_treeNode_record_whoAmI_library;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_version_treeNode_record {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_version_treeNode_record_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_version_treeNode {
    id: string;
    record: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_version_treeNode_record | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_version {
    treeId: string;
    treeNode: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_version_treeNode | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value {
    id_value: string | null;
    modified_at: number | null;
    modified_by: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_modified_by | null;
    created_at: number | null;
    created_by: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_created_by | null;
    version: (SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value_version | null)[] | null;
    value: Any | null;
    raw_value: Any | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata {
    name: string;
    value: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata_value | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value {
    id_value: string | null;
    modified_at: number | null;
    modified_by: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_modified_by | null;
    created_at: number | null;
    created_by: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_created_by | null;
    version: (SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_version | null)[] | null;
    attribute: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_attribute | null;
    metadata: (SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value_metadata | null)[] | null;
    value: Any | null;
    raw_value: Any | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_modified_by_whoAmI_library_gqlNames;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_modified_by_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_modified_by {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_modified_by_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_created_by_whoAmI_library_gqlNames;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_created_by_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_created_by {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_created_by_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_version_treeNode_record_whoAmI_library;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_version_treeNode_record {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_version_treeNode_record_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_version_treeNode {
    id: string;
    record: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_version_treeNode_record | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_version {
    treeId: string;
    treeNode: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_version_treeNode | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_attribute {
    id: string;
    format: AttributeFormat | null;
    type: AttributeType;
    system: boolean;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_modified_by_whoAmI_library_gqlNames;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_modified_by_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_modified_by {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_modified_by_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_created_by_whoAmI_library_gqlNames;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_created_by_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_created_by {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_created_by_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_version_treeNode_record_whoAmI_library;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_version_treeNode_record {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_version_treeNode_record_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_version_treeNode {
    id: string;
    record: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_version_treeNode_record | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_version {
    treeId: string;
    treeNode: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_version_treeNode | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value {
    id_value: string | null;
    modified_at: number | null;
    modified_by: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_modified_by | null;
    created_at: number | null;
    created_by: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_created_by | null;
    version: (SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value_version | null)[] | null;
    value: Any | null;
    raw_value: Any | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata {
    name: string;
    value: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata_value | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_linkValue_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_linkValue_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_linkValue_whoAmI_library_gqlNames;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_linkValue_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_linkValue_whoAmI_library;
    preview: Preview | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_linkValue {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_linkValue_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue {
    id_value: string | null;
    modified_at: number | null;
    modified_by: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_modified_by | null;
    created_at: number | null;
    created_by: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_created_by | null;
    version: (SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_version | null)[] | null;
    attribute: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_attribute | null;
    metadata: (SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_metadata | null)[] | null;
    linkValue: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue_linkValue | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_modified_by_whoAmI_library_gqlNames;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_modified_by_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_modified_by {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_modified_by_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_created_by_whoAmI_library_gqlNames;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_created_by_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_created_by {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_created_by_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_version_treeNode_record_whoAmI_library;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_version_treeNode_record {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_version_treeNode_record_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_version_treeNode {
    id: string;
    record: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_version_treeNode_record | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_version {
    treeId: string;
    treeNode: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_version_treeNode | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_attribute {
    id: string;
    format: AttributeFormat | null;
    type: AttributeType;
    system: boolean;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_modified_by_whoAmI_library_gqlNames;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_modified_by_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_modified_by {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_modified_by_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_created_by_whoAmI_library_gqlNames;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_created_by_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_created_by {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_created_by_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_version_treeNode_record_whoAmI_library;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_version_treeNode_record {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_version_treeNode_record_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_version_treeNode {
    id: string;
    record: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_version_treeNode_record | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_version {
    treeId: string;
    treeNode: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_version_treeNode | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value {
    id_value: string | null;
    modified_at: number | null;
    modified_by: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_modified_by | null;
    created_at: number | null;
    created_by: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_created_by | null;
    version: (SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value_version | null)[] | null;
    value: Any | null;
    raw_value: Any | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata {
    name: string;
    value: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata_value | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue_record_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue_record_whoAmI_library_gqlNames;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue_record_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue_record_whoAmI_library;
    preview: Preview | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue_record {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue_record_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue_ancestors_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue_ancestors_record_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue_ancestors_record_whoAmI_library_gqlNames;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue_ancestors_record_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue_ancestors_record_whoAmI_library;
    preview: Preview | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue_ancestors_record {
    id: string;
    whoAmI: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue_ancestors_record_whoAmI;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue_ancestors {
    record: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue_ancestors_record | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue {
    id: string;
    record: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue_record | null;
    ancestors: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue_ancestors[] | null;
}

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue {
    id_value: string | null;
    modified_at: number | null;
    modified_by: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_modified_by | null;
    created_at: number | null;
    created_by: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_created_by | null;
    version: (SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_version | null)[] | null;
    attribute: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_attribute | null;
    metadata: (SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_metadata | null)[] | null;
    treeValue: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue_treeValue | null;
}

export type SUB_RECORD_UPDATE_recordUpdate_updatedValues_value =
    | SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_Value
    | SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_LinkValue
    | SUB_RECORD_UPDATE_recordUpdate_updatedValues_value_TreeValue;

export interface SUB_RECORD_UPDATE_recordUpdate_updatedValues {
    attribute: string;
    value: SUB_RECORD_UPDATE_recordUpdate_updatedValues_value;
}

export interface SUB_RECORD_UPDATE_recordUpdate {
    record: SUB_RECORD_UPDATE_recordUpdate_record;
    updatedValues: SUB_RECORD_UPDATE_recordUpdate_updatedValues[];
}

export interface SUB_RECORD_UPDATE {
    recordUpdate: SUB_RECORD_UPDATE_recordUpdate;
}

export interface SUB_RECORD_UPDATEVariables {
    filters?: RecordUpdateFilterInput | null;
}
