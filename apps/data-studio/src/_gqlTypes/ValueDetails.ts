// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {LibraryBehavior, AttributeFormat, AttributeType} from './globalTypes';

// ====================================================
// GraphQL fragment: ValueDetails
// ====================================================

export interface ValueDetails_Value_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ValueDetails_Value_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: ValueDetails_Value_modified_by_whoAmI_library_gqlNames;
}

export interface ValueDetails_Value_modified_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: ValueDetails_Value_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface ValueDetails_Value_modified_by {
    id: string;
    whoAmI: ValueDetails_Value_modified_by_whoAmI;
}

export interface ValueDetails_Value_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ValueDetails_Value_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: ValueDetails_Value_created_by_whoAmI_library_gqlNames;
}

export interface ValueDetails_Value_created_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: ValueDetails_Value_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface ValueDetails_Value_created_by {
    id: string;
    whoAmI: ValueDetails_Value_created_by_whoAmI;
}

export interface ValueDetails_Value_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface ValueDetails_Value_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: ValueDetails_Value_version_treeNode_record_whoAmI_library;
}

export interface ValueDetails_Value_version_treeNode_record {
    id: string;
    whoAmI: ValueDetails_Value_version_treeNode_record_whoAmI;
}

export interface ValueDetails_Value_version_treeNode {
    id: string;
    record: ValueDetails_Value_version_treeNode_record | null;
}

export interface ValueDetails_Value_version {
    treeId: string;
    treeNode: ValueDetails_Value_version_treeNode | null;
}

export interface ValueDetails_Value_attribute {
    id: string;
    format: AttributeFormat | null;
    type: AttributeType;
    system: boolean;
}

export interface ValueDetails_Value_metadata_value_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ValueDetails_Value_metadata_value_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: ValueDetails_Value_metadata_value_modified_by_whoAmI_library_gqlNames;
}

export interface ValueDetails_Value_metadata_value_modified_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: ValueDetails_Value_metadata_value_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface ValueDetails_Value_metadata_value_modified_by {
    id: string;
    whoAmI: ValueDetails_Value_metadata_value_modified_by_whoAmI;
}

export interface ValueDetails_Value_metadata_value_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ValueDetails_Value_metadata_value_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: ValueDetails_Value_metadata_value_created_by_whoAmI_library_gqlNames;
}

export interface ValueDetails_Value_metadata_value_created_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: ValueDetails_Value_metadata_value_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface ValueDetails_Value_metadata_value_created_by {
    id: string;
    whoAmI: ValueDetails_Value_metadata_value_created_by_whoAmI;
}

export interface ValueDetails_Value_metadata_value_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface ValueDetails_Value_metadata_value_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: ValueDetails_Value_metadata_value_version_treeNode_record_whoAmI_library;
}

export interface ValueDetails_Value_metadata_value_version_treeNode_record {
    id: string;
    whoAmI: ValueDetails_Value_metadata_value_version_treeNode_record_whoAmI;
}

export interface ValueDetails_Value_metadata_value_version_treeNode {
    id: string;
    record: ValueDetails_Value_metadata_value_version_treeNode_record | null;
}

export interface ValueDetails_Value_metadata_value_version {
    treeId: string;
    treeNode: ValueDetails_Value_metadata_value_version_treeNode | null;
}

export interface ValueDetails_Value_metadata_value {
    id_value: string | null;
    modified_at: number | null;
    modified_by: ValueDetails_Value_metadata_value_modified_by | null;
    created_at: number | null;
    created_by: ValueDetails_Value_metadata_value_created_by | null;
    version: (ValueDetails_Value_metadata_value_version | null)[] | null;
    value: Any | null;
    raw_value: Any | null;
}

export interface ValueDetails_Value_metadata {
    name: string;
    value: ValueDetails_Value_metadata_value | null;
}

export interface ValueDetails_Value {
    id_value: string | null;
    modified_at: number | null;
    modified_by: ValueDetails_Value_modified_by | null;
    created_at: number | null;
    created_by: ValueDetails_Value_created_by | null;
    version: (ValueDetails_Value_version | null)[] | null;
    attribute: ValueDetails_Value_attribute | null;
    metadata: (ValueDetails_Value_metadata | null)[] | null;
    value: Any | null;
    raw_value: Any | null;
}

export interface ValueDetails_LinkValue_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ValueDetails_LinkValue_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: ValueDetails_LinkValue_modified_by_whoAmI_library_gqlNames;
}

export interface ValueDetails_LinkValue_modified_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: ValueDetails_LinkValue_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface ValueDetails_LinkValue_modified_by {
    id: string;
    whoAmI: ValueDetails_LinkValue_modified_by_whoAmI;
}

export interface ValueDetails_LinkValue_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ValueDetails_LinkValue_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: ValueDetails_LinkValue_created_by_whoAmI_library_gqlNames;
}

export interface ValueDetails_LinkValue_created_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: ValueDetails_LinkValue_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface ValueDetails_LinkValue_created_by {
    id: string;
    whoAmI: ValueDetails_LinkValue_created_by_whoAmI;
}

export interface ValueDetails_LinkValue_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface ValueDetails_LinkValue_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: ValueDetails_LinkValue_version_treeNode_record_whoAmI_library;
}

export interface ValueDetails_LinkValue_version_treeNode_record {
    id: string;
    whoAmI: ValueDetails_LinkValue_version_treeNode_record_whoAmI;
}

export interface ValueDetails_LinkValue_version_treeNode {
    id: string;
    record: ValueDetails_LinkValue_version_treeNode_record | null;
}

export interface ValueDetails_LinkValue_version {
    treeId: string;
    treeNode: ValueDetails_LinkValue_version_treeNode | null;
}

export interface ValueDetails_LinkValue_attribute {
    id: string;
    format: AttributeFormat | null;
    type: AttributeType;
    system: boolean;
}

export interface ValueDetails_LinkValue_metadata_value_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ValueDetails_LinkValue_metadata_value_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: ValueDetails_LinkValue_metadata_value_modified_by_whoAmI_library_gqlNames;
}

export interface ValueDetails_LinkValue_metadata_value_modified_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: ValueDetails_LinkValue_metadata_value_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface ValueDetails_LinkValue_metadata_value_modified_by {
    id: string;
    whoAmI: ValueDetails_LinkValue_metadata_value_modified_by_whoAmI;
}

export interface ValueDetails_LinkValue_metadata_value_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ValueDetails_LinkValue_metadata_value_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: ValueDetails_LinkValue_metadata_value_created_by_whoAmI_library_gqlNames;
}

export interface ValueDetails_LinkValue_metadata_value_created_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: ValueDetails_LinkValue_metadata_value_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface ValueDetails_LinkValue_metadata_value_created_by {
    id: string;
    whoAmI: ValueDetails_LinkValue_metadata_value_created_by_whoAmI;
}

export interface ValueDetails_LinkValue_metadata_value_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface ValueDetails_LinkValue_metadata_value_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: ValueDetails_LinkValue_metadata_value_version_treeNode_record_whoAmI_library;
}

export interface ValueDetails_LinkValue_metadata_value_version_treeNode_record {
    id: string;
    whoAmI: ValueDetails_LinkValue_metadata_value_version_treeNode_record_whoAmI;
}

export interface ValueDetails_LinkValue_metadata_value_version_treeNode {
    id: string;
    record: ValueDetails_LinkValue_metadata_value_version_treeNode_record | null;
}

export interface ValueDetails_LinkValue_metadata_value_version {
    treeId: string;
    treeNode: ValueDetails_LinkValue_metadata_value_version_treeNode | null;
}

export interface ValueDetails_LinkValue_metadata_value {
    id_value: string | null;
    modified_at: number | null;
    modified_by: ValueDetails_LinkValue_metadata_value_modified_by | null;
    created_at: number | null;
    created_by: ValueDetails_LinkValue_metadata_value_created_by | null;
    version: (ValueDetails_LinkValue_metadata_value_version | null)[] | null;
    value: Any | null;
    raw_value: Any | null;
}

export interface ValueDetails_LinkValue_metadata {
    name: string;
    value: ValueDetails_LinkValue_metadata_value | null;
}

export interface ValueDetails_LinkValue_linkValue_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ValueDetails_LinkValue_linkValue_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: ValueDetails_LinkValue_linkValue_whoAmI_library_gqlNames;
}

export interface ValueDetails_LinkValue_linkValue_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: ValueDetails_LinkValue_linkValue_whoAmI_library;
    preview: Preview | null;
}

export interface ValueDetails_LinkValue_linkValue {
    id: string;
    whoAmI: ValueDetails_LinkValue_linkValue_whoAmI;
}

export interface ValueDetails_LinkValue {
    id_value: string | null;
    modified_at: number | null;
    modified_by: ValueDetails_LinkValue_modified_by | null;
    created_at: number | null;
    created_by: ValueDetails_LinkValue_created_by | null;
    version: (ValueDetails_LinkValue_version | null)[] | null;
    attribute: ValueDetails_LinkValue_attribute | null;
    metadata: (ValueDetails_LinkValue_metadata | null)[] | null;
    linkValue: ValueDetails_LinkValue_linkValue | null;
}

export interface ValueDetails_TreeValue_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ValueDetails_TreeValue_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: ValueDetails_TreeValue_modified_by_whoAmI_library_gqlNames;
}

export interface ValueDetails_TreeValue_modified_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: ValueDetails_TreeValue_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface ValueDetails_TreeValue_modified_by {
    id: string;
    whoAmI: ValueDetails_TreeValue_modified_by_whoAmI;
}

export interface ValueDetails_TreeValue_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ValueDetails_TreeValue_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: ValueDetails_TreeValue_created_by_whoAmI_library_gqlNames;
}

export interface ValueDetails_TreeValue_created_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: ValueDetails_TreeValue_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface ValueDetails_TreeValue_created_by {
    id: string;
    whoAmI: ValueDetails_TreeValue_created_by_whoAmI;
}

export interface ValueDetails_TreeValue_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface ValueDetails_TreeValue_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: ValueDetails_TreeValue_version_treeNode_record_whoAmI_library;
}

export interface ValueDetails_TreeValue_version_treeNode_record {
    id: string;
    whoAmI: ValueDetails_TreeValue_version_treeNode_record_whoAmI;
}

export interface ValueDetails_TreeValue_version_treeNode {
    id: string;
    record: ValueDetails_TreeValue_version_treeNode_record | null;
}

export interface ValueDetails_TreeValue_version {
    treeId: string;
    treeNode: ValueDetails_TreeValue_version_treeNode | null;
}

export interface ValueDetails_TreeValue_attribute {
    id: string;
    format: AttributeFormat | null;
    type: AttributeType;
    system: boolean;
}

export interface ValueDetails_TreeValue_metadata_value_modified_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ValueDetails_TreeValue_metadata_value_modified_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: ValueDetails_TreeValue_metadata_value_modified_by_whoAmI_library_gqlNames;
}

export interface ValueDetails_TreeValue_metadata_value_modified_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: ValueDetails_TreeValue_metadata_value_modified_by_whoAmI_library;
    preview: Preview | null;
}

export interface ValueDetails_TreeValue_metadata_value_modified_by {
    id: string;
    whoAmI: ValueDetails_TreeValue_metadata_value_modified_by_whoAmI;
}

export interface ValueDetails_TreeValue_metadata_value_created_by_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ValueDetails_TreeValue_metadata_value_created_by_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: ValueDetails_TreeValue_metadata_value_created_by_whoAmI_library_gqlNames;
}

export interface ValueDetails_TreeValue_metadata_value_created_by_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: ValueDetails_TreeValue_metadata_value_created_by_whoAmI_library;
    preview: Preview | null;
}

export interface ValueDetails_TreeValue_metadata_value_created_by {
    id: string;
    whoAmI: ValueDetails_TreeValue_metadata_value_created_by_whoAmI;
}

export interface ValueDetails_TreeValue_metadata_value_version_treeNode_record_whoAmI_library {
    id: string;
}

export interface ValueDetails_TreeValue_metadata_value_version_treeNode_record_whoAmI {
    id: string;
    label: string | null;
    library: ValueDetails_TreeValue_metadata_value_version_treeNode_record_whoAmI_library;
}

export interface ValueDetails_TreeValue_metadata_value_version_treeNode_record {
    id: string;
    whoAmI: ValueDetails_TreeValue_metadata_value_version_treeNode_record_whoAmI;
}

export interface ValueDetails_TreeValue_metadata_value_version_treeNode {
    id: string;
    record: ValueDetails_TreeValue_metadata_value_version_treeNode_record | null;
}

export interface ValueDetails_TreeValue_metadata_value_version {
    treeId: string;
    treeNode: ValueDetails_TreeValue_metadata_value_version_treeNode | null;
}

export interface ValueDetails_TreeValue_metadata_value {
    id_value: string | null;
    modified_at: number | null;
    modified_by: ValueDetails_TreeValue_metadata_value_modified_by | null;
    created_at: number | null;
    created_by: ValueDetails_TreeValue_metadata_value_created_by | null;
    version: (ValueDetails_TreeValue_metadata_value_version | null)[] | null;
    value: Any | null;
    raw_value: Any | null;
}

export interface ValueDetails_TreeValue_metadata {
    name: string;
    value: ValueDetails_TreeValue_metadata_value | null;
}

export interface ValueDetails_TreeValue_treeValue_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ValueDetails_TreeValue_treeValue_record_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: ValueDetails_TreeValue_treeValue_record_whoAmI_library_gqlNames;
}

export interface ValueDetails_TreeValue_treeValue_record_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: ValueDetails_TreeValue_treeValue_record_whoAmI_library;
    preview: Preview | null;
}

export interface ValueDetails_TreeValue_treeValue_record {
    id: string;
    whoAmI: ValueDetails_TreeValue_treeValue_record_whoAmI;
}

export interface ValueDetails_TreeValue_treeValue_ancestors_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface ValueDetails_TreeValue_treeValue_ancestors_record_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: ValueDetails_TreeValue_treeValue_ancestors_record_whoAmI_library_gqlNames;
}

export interface ValueDetails_TreeValue_treeValue_ancestors_record_whoAmI {
    id: string;
    label: string | null;
    color: string | null;
    library: ValueDetails_TreeValue_treeValue_ancestors_record_whoAmI_library;
    preview: Preview | null;
}

export interface ValueDetails_TreeValue_treeValue_ancestors_record {
    id: string;
    whoAmI: ValueDetails_TreeValue_treeValue_ancestors_record_whoAmI;
}

export interface ValueDetails_TreeValue_treeValue_ancestors {
    record: ValueDetails_TreeValue_treeValue_ancestors_record | null;
}

export interface ValueDetails_TreeValue_treeValue {
    id: string;
    record: ValueDetails_TreeValue_treeValue_record | null;
    ancestors: ValueDetails_TreeValue_treeValue_ancestors[] | null;
}

export interface ValueDetails_TreeValue {
    id_value: string | null;
    modified_at: number | null;
    modified_by: ValueDetails_TreeValue_modified_by | null;
    created_at: number | null;
    created_by: ValueDetails_TreeValue_created_by | null;
    version: (ValueDetails_TreeValue_version | null)[] | null;
    attribute: ValueDetails_TreeValue_attribute | null;
    metadata: (ValueDetails_TreeValue_metadata | null)[] | null;
    treeValue: ValueDetails_TreeValue_treeValue | null;
}

export type ValueDetails = ValueDetails_Value | ValueDetails_LinkValue | ValueDetails_TreeValue;
