// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    DisplaySize,
    IAttribute,
    IField,
    IItem,
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
    selectionMode?: boolean;
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
