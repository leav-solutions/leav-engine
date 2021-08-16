// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {defaultSort, defaultView} from 'constants/constants';
import {IAttribute, IField, IFilter, IQueryFilter} from '_types/types';
import {ISearchRecord, ISearchSort, ISearchState, IViewState} from './_types';

export enum SearchActionTypes {
    SET_RECORDS = 'SET_RECORDS',
    SET_TOTAL_COUNT = 'SET_TOTAL_COUNT',
    SET_PAGINATION = 'SET_PAGINATION',
    SET_OFFSET = 'SET_OFFSET',
    SET_LOADING = 'SET_LOADING',
    SET_SORT = 'SET_SORT',
    CANCEL_SORT = 'CANCEL_SORT',
    SET_ATTRIBUTES = 'SET_ATTRIBUTES',
    SET_FIELDS = 'SET_FIELDS',
    SET_FULLTEXT = 'SET_FULLTEXT',
    SET_FILTERS = 'SET_FILTERS',
    SET_QUERY_FILTERS = 'SET_QUERY_FILTERS',
    SET_VIEW = 'SET_VIEW'
}

export type SearchAction =
    | {type: SearchActionTypes.SET_RECORDS; records: ISearchRecord[]}
    | {type: SearchActionTypes.SET_TOTAL_COUNT; totalCount: number}
    | {type: SearchActionTypes.SET_PAGINATION; page: number}
    | {type: SearchActionTypes.SET_OFFSET; offset: number}
    | {type: SearchActionTypes.SET_LOADING; loading: boolean}
    | {type: SearchActionTypes.SET_SORT; sort: ISearchSort}
    | {type: SearchActionTypes.CANCEL_SORT}
    | {type: SearchActionTypes.SET_ATTRIBUTES; attributes: IAttribute[]}
    | {type: SearchActionTypes.SET_FIELDS; fields: IField[]}
    | {type: SearchActionTypes.SET_FULLTEXT; fullText: string}
    | {type: SearchActionTypes.SET_FILTERS; filters: IFilter[]}
    | {type: SearchActionTypes.SET_QUERY_FILTERS; queryFilters: IQueryFilter[]}
    | {type: SearchActionTypes.SET_VIEW; view: IViewState};

export const initialSearchState: ISearchState = {
    library: null,
    records: [],
    totalCount: 0,
    loading: false,
    pagination: 20,
    offset: 0,
    sort: {...defaultSort, active: false},
    attributes: [],
    fields: [],
    fullText: '',
    filters: [],
    queryFilters: [],
    view: {current: defaultView, reload: false}
};

const searchReducer = (state: ISearchState, action: SearchAction): ISearchState => {
    switch (action.type) {
        case SearchActionTypes.SET_RECORDS:
            return {...state, records: action.records};
        case SearchActionTypes.SET_TOTAL_COUNT:
            return {...state, totalCount: action.totalCount};
        case SearchActionTypes.SET_PAGINATION:
            return {...state, pagination: action.page};
        case SearchActionTypes.SET_OFFSET:
            return {...state, offset: action.offset};
        case SearchActionTypes.SET_LOADING:
            return {...state, loading: action.loading};
        case SearchActionTypes.SET_SORT:
            return {...state, sort: action.sort};
        case SearchActionTypes.CANCEL_SORT:
            return {...state, sort: {...defaultSort, active: false}};
        case SearchActionTypes.SET_ATTRIBUTES:
            return {...state, attributes: action.attributes};
        case SearchActionTypes.SET_FIELDS:
            return {...state, fields: action.fields};
        case SearchActionTypes.SET_FULLTEXT:
            return {...state, fullText: action.fullText};
        case SearchActionTypes.SET_FILTERS:
            return {...state, filters: action.filters};
        case SearchActionTypes.SET_QUERY_FILTERS:
            return {...state, queryFilters: action.queryFilters};
        case SearchActionTypes.SET_VIEW:
            return {...state, view: action.view};
    }
};

export default searchReducer;
