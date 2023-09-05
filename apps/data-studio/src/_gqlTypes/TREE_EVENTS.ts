/* tslint:disable */
/* eslint-disable */
// @generated
// This file was automatically generated and should not be edited.

import {TreeEventFiltersInput, TreeEventTypes, LibraryBehavior} from './globalTypes';

// ====================================================
// GraphQL subscription operation: TREE_EVENTS
// ====================================================

export interface TREE_EVENTS_treeEvent_element_record_whoAmI_library_gqlNames {
    query: string;
    type: string;
}

export interface TREE_EVENTS_treeEvent_element_record_whoAmI_library {
    id: string;
    behavior: LibraryBehavior;
    label: SystemTranslation | null;
    gqlNames: TREE_EVENTS_treeEvent_element_record_whoAmI_library_gqlNames;
}

export interface TREE_EVENTS_treeEvent_element_record_whoAmI {
    id: string;
    label: string | null;
    subLabel: string | null;
    color: string | null;
    library: TREE_EVENTS_treeEvent_element_record_whoAmI_library;
    preview: Preview | null;
}

export interface TREE_EVENTS_treeEvent_element_record {
    id: string;
    whoAmI: TREE_EVENTS_treeEvent_element_record_whoAmI;
}

export interface TREE_EVENTS_treeEvent_element_permissions {
    access_tree: boolean;
    detach: boolean;
    edit_children: boolean;
}

export interface TREE_EVENTS_treeEvent_element {
    id: string;
    childrenCount: number | null;
    record: TREE_EVENTS_treeEvent_element_record | null;
    permissions: TREE_EVENTS_treeEvent_element_permissions;
}

export interface TREE_EVENTS_treeEvent_parentNode {
    id: string;
}

export interface TREE_EVENTS_treeEvent_parentNodeBefore {
    id: string;
}

export interface TREE_EVENTS_treeEvent {
    type: TreeEventTypes;
    treeId: string;
    element: TREE_EVENTS_treeEvent_element;
    parentNode: TREE_EVENTS_treeEvent_parentNode | null;
    parentNodeBefore: TREE_EVENTS_treeEvent_parentNodeBefore | null;
}

export interface TREE_EVENTS {
    treeEvent: TREE_EVENTS_treeEvent;
}

export interface TREE_EVENTSVariables {
    filters?: TreeEventFiltersInput | null;
}
