// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IRecordField} from 'graphQL/queries/trees/getTreeContentQuery';
import {
    DisplaySize,
    IAttribute,
    IBaseNotification,
    IField,
    IItem,
    INavigationPath,
    INotification,
    IQueryFilter,
    ISharedStateSelectionSearch,
    IView,
    OrderSearch,
    SharedStateSelection,
    TypeSideItem
} from '_types/types';

export interface IItemsSort {
    field: string;
    order: OrderSearch;
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

export interface IViewState {
    current: IView | null;
    reload: boolean;
}

export interface IDisplayState {
    size: DisplaySize;
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

export interface INavigationState {
    path: INavigationPath[];
    isLoading: boolean;
    recordDetail?: IRecordField;
    refetchTreeData: boolean;
}

export interface INotificationsState {
    base?: IBaseNotification;
    stack: INotification[];
}
