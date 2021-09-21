// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ViewTypes} from '_gqlTypes/globalTypes';
import {defaultSort, defaultView, viewSettingsField} from 'constants/constants';
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
    SET_VIEW = 'SET_VIEW',
    SET_USER_VIEWS_ORDER = 'SET_USER_VIEWS_ORDER',
    SET_SHARED_VIEWS_ORDER = 'SET_SHARED_VIEWS_ORDER',
    SET_DISPLAY_TYPE = 'SET_DISPLAY_TYPE'
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
    | {type: SearchActionTypes.SET_VIEW; view: IViewState}
    | {type: SearchActionTypes.SET_DISPLAY_TYPE; displayType: ViewTypes}
    | {type: SearchActionTypes.SET_USER_VIEWS_ORDER; userViewsOrder: string[]}
    | {type: SearchActionTypes.SET_SHARED_VIEWS_ORDER; sharedViewsOrder: string[]};

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
    displayType: ViewTypes.list,
    view: {current: defaultView, reload: false, sync: true},
    userViewsOrder: [],
    sharedViewsOrder: []
};

const checkSync = (
    state: ISearchState,
    toCheck: {sort: boolean; filters: boolean; displayType: boolean; fields: boolean}
): boolean => {
    let sync = true;

    if (toCheck.sort) {
        sync = state.sort.field === state.view.current.sort.field && state.sort.order === state.view.current.sort.order;
    }

    if (toCheck.filters) {
        sync = sync && JSON.stringify(state.view.current.filters) === JSON.stringify(state.filters);
    }

    if (toCheck.displayType) {
        sync = sync && state.displayType === state.view.current.type;
    }

    if (toCheck.fields) {
        const viewFieldsKeys: string[] = !!state.view.current.settings?.find(s => s.name === viewSettingsField)
            ? state.view.current?.settings.find(s => s.name === viewSettingsField).value
            : [];

        sync = sync && state.fields.map(f => f.id).join('.') === viewFieldsKeys.join('.');
    }

    return sync;
};

const searchReducer = (state: ISearchState, action: SearchAction): ISearchState => {
    let sync = checkSync(state, {
        sort: action.type !== SearchActionTypes.SET_SORT, // FIXME: probleme avec le sort
        filters: action.type !== SearchActionTypes.SET_FILTERS,
        displayType: action.type !== SearchActionTypes.SET_DISPLAY_TYPE,
        fields: action.type !== SearchActionTypes.SET_FIELDS
    });

    switch (action.type) {
        case SearchActionTypes.SET_RECORDS:
            return {...state, records: action.records};
        case SearchActionTypes.SET_TOTAL_COUNT:
            return {...state, totalCount: action.totalCount};
        case SearchActionTypes.SET_PAGINATION:
            return {...state, pagination: action.page, loading: true};
        case SearchActionTypes.SET_OFFSET:
            return {...state, offset: action.offset, loading: true};
        case SearchActionTypes.SET_LOADING:
            return {...state, loading: action.loading};
        case SearchActionTypes.SET_SORT:
            sync =
                sync &&
                state.view.current.sort.field === action.sort.field &&
                state.view.current.sort.order === action.sort.order;

            return {...state, sort: action.sort, view: {...state.view, sync}};
        case SearchActionTypes.CANCEL_SORT:
            return {...state, sort: {...defaultSort, active: false}};
        case SearchActionTypes.SET_ATTRIBUTES:
            return {...state, attributes: action.attributes};
        case SearchActionTypes.SET_FIELDS:
            const viewFieldsKeys: IField[] = !!state.view.current.settings?.find(s => s.name === viewSettingsField)
                ? state.view.current?.settings.find(s => s.name === viewSettingsField).value
                : [];

            sync = sync && action.fields.map(f => f.id).join('.') === viewFieldsKeys.join('.');

            return {...state, fields: action.fields, view: {...state.view, sync}};
        case SearchActionTypes.SET_FULLTEXT:
            return {...state, fullText: action.fullText};
        case SearchActionTypes.SET_FILTERS:
            sync = sync && JSON.stringify(state.view.current.filters) === JSON.stringify(action.filters);
            return {...state, filters: action.filters, view: {...state.view, sync}};
        case SearchActionTypes.SET_QUERY_FILTERS:
            return {...state, queryFilters: action.queryFilters};
        case SearchActionTypes.SET_VIEW:
            return {...state, view: action.view};
        case SearchActionTypes.SET_DISPLAY_TYPE:
            sync = sync && action.displayType === state.view.current.type;
            return {...state, displayType: action.displayType, view: {...state.view, sync}};
        case SearchActionTypes.SET_USER_VIEWS_ORDER:
            return {...state, userViewsOrder: action.userViewsOrder};
        case SearchActionTypes.SET_SHARED_VIEWS_ORDER:
            return {...state, sharedViewsOrder: action.sharedViewsOrder};
    }
};

export default searchReducer;
