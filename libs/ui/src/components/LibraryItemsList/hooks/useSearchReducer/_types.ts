// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ApolloError} from '@apollo/client';
import {ILang} from '_ui/types/misc';
import {IRecordIdentityWhoAmI} from '_ui/types/records';
import {IAttribute, IField, IFilter, ISearchSelection, SearchMode, SidebarContentType} from '_ui/types/search';
import {IValueVersion} from '_ui/types/values';
import {IView, IViewDisplay} from '_ui/types/views';
import {SortOrder} from '_ui/_gqlTypes';
import {
    ILibraryDetailExtended,
    ILibraryDetailExtendedLinkedTree
} from '_ui/_queries/libraries/getLibraryDetailExtendQuery';

export type IRecordPreview = {
    small: string;
    medium: string;
    big: string;
    pages: string;
} | null;

export interface IRecordWhoAmI {
    id: string;
    label?: string;
    preview?: IRecordPreview;
    color?: string;
    library?: {
        id: string;
        label: Record<string, string>;
    };
}

export interface ISearchRecord {
    whoAmI: IRecordIdentityWhoAmI;
    index: number;
    fields: {[x: string]: any};
}

export interface ISearchSort {
    field: string;
    order: SortOrder;
}

export interface ISidebarState {
    visible: boolean;
    type: SidebarContentType;
}

export interface ISearchState {
    library: ILibraryDetailExtended;
    records: ISearchRecord[];
    totalCount: number;
    error?: ApolloError;
    loading: boolean;
    pagination: number;
    offset: number;
    sort?: ISearchSort;
    attributes: IAttribute[];
    trees: ILibraryDetailExtendedLinkedTree[];
    fields: IField[];
    fullText: string;
    filters: IFilter[];
    display: IViewDisplay;
    view: IViewState;
    userViewsOrder: string[];
    sharedViewsOrder: string[];
    lang: ILang;
    valuesVersions: IValueVersion;
    sideBar: ISidebarState;
    selection: ISearchSelection;
    showTransparency: boolean;
    mode: SearchMode;
}

export interface IViewState {
    current: IView | null;
    reload: boolean;
    sync: boolean;
}