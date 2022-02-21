// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ITreeContentRecordAndChildren, ITreeNodePermissions} from 'graphQL/queries/trees/getTreeContentQuery';
import {SortOrder} from '_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {
    IAttribute,
    IBaseNotification,
    IField,
    IItem,
    INotification,
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
    permissions: ITreeNodePermissions;
}

export interface INavigationState {
    activeTree: string;
    path: ITreeContentRecordAndChildren[];
    isLoading: boolean;
    recordDetail?: ITreeContentRecordAndChildren;
    refetchTreeData: boolean;
}

export interface INotificationsState {
    base?: IBaseNotification;
    stack: INotification[];
}
