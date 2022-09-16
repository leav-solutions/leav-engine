// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SortOrder} from '_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {
    TREE_NODE_CHILDREN_treeNodeChildren_list,
    TREE_NODE_CHILDREN_treeNodeChildren_list_permissions
} from '_gqlTypes/TREE_NODE_CHILDREN';
import {
    IAttribute,
    IBaseInfo,
    IField,
    IItem,
    IInfo,
    IQueryFilter,
    ISharedStateSelectionSearch,
    SharedStateSelection,
    TypeSideItem
} from '_types/types';

export interface IItemsSort {
    field: string;
    order: SortOrder;
    active: boolean;
}

export interface IItemsState {
    items: IItem[];
    totalCount: number;
    loading: boolean;
    pagination: number;
    offset: number;
    sort: IItemsSort | null;
}

export interface IDisplayState {
    side: IDisplaySide;
}

export interface IDisplaySide {
    visible: boolean;
    type: TypeSideItem;
}

export interface IAttributesState {
    attributes: IAttribute[];
}

export interface IFieldsState {
    fields: IField[];
}

export interface IFiltersState {
    queryFilters: IQueryFilter[];
    searchFullTextActive: boolean;
}

export interface ISelectionState {
    selection: SharedStateSelection;
    searchSelection: ISharedStateSelectionSearch;
}

export interface IRecordWithTreeNodePermissions {
    record: RecordIdentity_whoAmI;
    permissions: TREE_NODE_CHILDREN_treeNodeChildren_list_permissions;
}

export interface INavigationElement extends TREE_NODE_CHILDREN_treeNodeChildren_list {
    showDetails?: boolean;
}

export interface INavigationState {
    activeTree: string;
    path: INavigationElement[];
}

export interface IInfosState {
    base?: IBaseInfo;
    stack: IInfo[];
}
