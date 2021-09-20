// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GET_LIBRARY_DETAIL_EXTENDED_libraries_list} from '_gqlTypes/GET_LIBRARY_DETAIL_EXTENDED';
import {SortOrder, ViewTypes} from '_gqlTypes/globalTypes';
import {RecordIdentity_whoAmI} from '_gqlTypes/RecordIdentity';
import {IAttribute, IField} from '_types/types';
import {IFilter, IQueryFilter, IView} from '../../_types/types';

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
    whoAmI: RecordIdentity_whoAmI;
    index: number;
    fields: {[x: string]: any};
}

export interface ISearchSort {
    field: string;
    order: SortOrder;
    active: boolean;
}

export interface ISearchState {
    library: GET_LIBRARY_DETAIL_EXTENDED_libraries_list;
    records: ISearchRecord[];
    totalCount: number;
    loading: boolean;
    pagination: number;
    offset: number;
    sort: ISearchSort | null;
    attributes: IAttribute[];
    fields: IField[];
    fullText: string;
    filters: IFilter[];
    queryFilters: IQueryFilter[];
    displayType: ViewTypes;
    view: IViewState;
    userViewsOrder: string[];
    sharedViewsOrder: string[];
}

export interface IViewState {
    current: IView | null;
    reload: boolean;
}
