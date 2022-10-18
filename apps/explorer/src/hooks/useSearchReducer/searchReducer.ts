// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import getFieldsFromView from 'components/LibraryItemsList/helpers/getFieldsFromView';
import {defaultSort, defaultView, viewSettingsField} from 'constants/constants';
import {ViewSizes, ViewTypes} from '_gqlTypes/globalTypes';
import {IAttribute, IField, IFilter, IValuesVersion, IView, IViewDisplay} from '_types/types';
import {ISearchRecord, ISearchSort, ISearchState} from './_types';

export enum SearchActionTypes {
    UPDATE_RESULT = 'UPDATE_RESULT',
    SET_PAGINATION = 'SET_PAGINATION',
    SET_OFFSET = 'SET_OFFSET',
    SET_LOADING = 'SET_LOADING',
    SET_SORT = 'SET_SORT',
    CANCEL_SORT = 'CANCEL_SORT',
    SET_ATTRIBUTES = 'SET_ATTRIBUTES',
    SET_FIELDS = 'SET_FIELDS',
    SET_FULLTEXT = 'SET_FULLTEXT',
    SET_FILTERS = 'SET_FILTERS',
    SET_VIEW_RELOAD = 'SET_VIEW_RELOAD',
    SET_VIEW_SYNC = 'SET_VIEW_SYNC',
    CHANGE_VIEW = 'CHANGE_VIEW',
    SET_USER_VIEWS_ORDER = 'SET_USER_VIEWS_ORDER',
    SET_SHARED_VIEWS_ORDER = 'SET_SHARED_VIEWS_ORDER',
    SET_DISPLAY = 'SET_DISPLAY',
    RESET_FILTERS = 'RESET_FILTERS',
    DISABLE_FILTERS = 'DISABLE_FILTERS',
    APPLY_FILTERS = 'APPLY_FILTERS',
    SET_VALUES_VERSIONS = 'SET_VALUES_VERSIONS'
}

export type SearchAction =
    | {type: SearchActionTypes.UPDATE_RESULT; records: ISearchRecord[]; totalCount: number}
    | {type: SearchActionTypes.SET_PAGINATION; page: number}
    | {type: SearchActionTypes.SET_OFFSET; offset: number}
    | {type: SearchActionTypes.SET_LOADING; loading: boolean}
    | {type: SearchActionTypes.SET_SORT; sort: ISearchSort}
    | {type: SearchActionTypes.CANCEL_SORT}
    | {type: SearchActionTypes.SET_ATTRIBUTES; attributes: IAttribute[]}
    | {type: SearchActionTypes.SET_FIELDS; fields: IField[]}
    | {type: SearchActionTypes.SET_FULLTEXT; fullText: string}
    | {type: SearchActionTypes.SET_FILTERS; filters: IFilter[]}
    | {type: SearchActionTypes.SET_VIEW_RELOAD; reload: boolean}
    | {type: SearchActionTypes.SET_VIEW_SYNC; sync: boolean}
    | {type: SearchActionTypes.CHANGE_VIEW; view: IView}
    | {type: SearchActionTypes.SET_DISPLAY; display: IViewDisplay}
    | {type: SearchActionTypes.SET_USER_VIEWS_ORDER; userViewsOrder: string[]}
    | {type: SearchActionTypes.SET_SHARED_VIEWS_ORDER; sharedViewsOrder: string[]}
    | {type: SearchActionTypes.RESET_FILTERS}
    | {type: SearchActionTypes.DISABLE_FILTERS}
    | {type: SearchActionTypes.APPLY_FILTERS}
    | {type: SearchActionTypes.SET_VALUES_VERSIONS; valuesVersions: IValuesVersion};

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
    display: {type: ViewTypes.list, size: ViewSizes.MEDIUM},
    view: {current: defaultView, reload: false, sync: true},
    userViewsOrder: [],
    sharedViewsOrder: [],
    valuesVersions: {},
    lang: null
};

const checkSync = (
    state: ISearchState,
    toCheck: {sort: boolean; filters: boolean; display: boolean; fields: boolean; valuesVersions: boolean}
): boolean => {
    let sync = true;

    if (toCheck.sort) {
        sync =
            state.sort.field === state.view?.current?.sort?.field &&
            state.sort.order === state.view?.current?.sort?.order;
    }

    if (toCheck.filters) {
        sync = sync && JSON.stringify(state.view.current?.filters) === JSON.stringify(state.filters);
    }

    if (toCheck.display) {
        sync =
            sync &&
            state.display.type === state.view.current?.display?.type &&
            state.display.size === state.view.current?.display?.size;
    }

    if (toCheck.fields) {
        const viewFieldsKeys: string[] = !!state.view.current?.settings?.find(s => s.name === viewSettingsField)
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
        display: action.type !== SearchActionTypes.SET_DISPLAY,
        fields: action.type !== SearchActionTypes.SET_FIELDS,
        valuesVersions: action.type !== SearchActionTypes.SET_VALUES_VERSIONS
    });

    switch (action.type) {
        case SearchActionTypes.UPDATE_RESULT:
            return {...state, records: action.records, totalCount: action.totalCount, loading: false};
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
            return {...state, sort: {...defaultSort, active: false}, loading: true};
        case SearchActionTypes.SET_ATTRIBUTES:
            return {...state, attributes: action.attributes};
        case SearchActionTypes.SET_FIELDS:
            const viewFieldsKeys: IField[] = !!state.view.current.settings?.find(s => s.name === viewSettingsField)
                ? state.view.current?.settings.find(s => s.name === viewSettingsField).value
                : [];

            sync = sync && action.fields.map(f => f.id).join('.') === viewFieldsKeys.join('.');

            return {...state, fields: action.fields, view: {...state.view, sync}, loading: true};
        case SearchActionTypes.SET_FULLTEXT:
            return {...state, fullText: action.fullText};
        case SearchActionTypes.SET_FILTERS:
            sync = sync && JSON.stringify(state.view.current.filters) === JSON.stringify(action.filters);
            return {...state, filters: action.filters, view: {...state.view, sync}};
        case SearchActionTypes.CHANGE_VIEW:
            return {
                ...state,
                view: {
                    current: action.view,
                    reload: true,
                    sync: true
                },
                fields: getFieldsFromView(action.view, state.library, state.lang),
                filters: action.view.filters,
                sort: {...(action.view?.sort ?? defaultSort), active: true},
                display: action.view.display,
                valuesVersions: action.view.valuesVersions
            };
        case SearchActionTypes.SET_VIEW_RELOAD:
            return {...state, view: {...state.view, reload: action.reload}};
        case SearchActionTypes.SET_VIEW_SYNC:
            return {...state, view: {...state.view, sync: action.sync}};
        case SearchActionTypes.SET_DISPLAY:
            sync =
                sync &&
                action.display.type === state.view.current.display.type &&
                action.display.size === state.view.current.display.size;
            return {...state, display: action.display, view: {...state.view, sync}};
        case SearchActionTypes.SET_USER_VIEWS_ORDER:
            return {...state, userViewsOrder: action.userViewsOrder};
        case SearchActionTypes.SET_SHARED_VIEWS_ORDER:
            return {...state, sharedViewsOrder: action.sharedViewsOrder};
        case SearchActionTypes.RESET_FILTERS:
            return {...state, filters: [], loading: true};
        case SearchActionTypes.DISABLE_FILTERS:
            return {
                ...state,
                filters: state.filters.map(f => ({...f, active: false})),
                loading: true
            };
        case SearchActionTypes.APPLY_FILTERS:
            // Reset pagination when applying filters as this may lead to unexpected behavior
            // if new filters return less results
            return {
                ...state,
                offset: 0,
                loading: true
            };
        case SearchActionTypes.SET_VALUES_VERSIONS: {
            sync = sync && JSON.stringify(state.view.current.valuesVersions) === JSON.stringify(action.valuesVersions);
            return {
                ...state,
                view: {...state.view, sync},
                valuesVersions: {...state.valuesVersions, ...action.valuesVersions}
            };
        }
    }
};

export default searchReducer;
