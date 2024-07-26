// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {GraphQLErrors} from '@apollo/client/errors';
import getFieldsFromView from '_ui/components/LibraryItemsList/helpers/getFieldsFromView';
import {IAttribute, IField, IFilter, ISelectedRecord, SearchMode, SidebarContentType} from '_ui/types/search';
import {IValueVersion} from '_ui/types/values';
import {IView, IViewDisplay} from '_ui/types/views';
import {ViewSizes, ViewTypes} from '_ui/_gqlTypes';
import {defaultView, viewSettingsField} from '../../constants';
import {ISearchRecord, ISearchSort, ISearchState} from './_types';

export enum SearchActionTypes {
    UPDATE_RESULT = 'UPDATE_RESULT',
    SET_ERROR = 'SET_ERROR',
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
    ENABLE_FILTERS = 'ENABLE_FILTERS',
    APPLY_FILTERS = 'APPLY_FILTERS',
    SET_VALUES_VERSIONS = 'SET_VALUES_VERSIONS',
    TOGGLE_TRANSPARENCY = 'TOGGLE_TRANSPARENCY',
    TOGGLE_SIDEBAR = 'TOGGLE_SIDEBAR',
    SET_SIDEBAR = 'SET_SIDEBAR',
    SET_SELECTION = 'SET_SELECTION',
    TOGGLE_RECORD_SELECTION = 'TOGGLE_RECORD_SELECTION',
    SELECT_ALL = 'SELECT_ALL',
    CLEAR_SELECTION = 'CLEAR_SELECTION'
}

interface ISearchResult {
    type: SearchActionTypes.UPDATE_RESULT;
    records: ISearchRecord[];
    errors?: GraphQLErrors;
    totalCount: number;
}

export type SearchAction =
    | ({type: SearchActionTypes.UPDATE_RESULT} & ISearchResult)
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
    | {type: SearchActionTypes.ENABLE_FILTERS}
    | {type: SearchActionTypes.APPLY_FILTERS}
    | {type: SearchActionTypes.SET_VALUES_VERSIONS; valuesVersions: IValueVersion}
    | {type: SearchActionTypes.TOGGLE_TRANSPARENCY}
    | {type: SearchActionTypes.TOGGLE_SIDEBAR}
    | {type: SearchActionTypes.SET_SIDEBAR; sidebarType: SidebarContentType; visible: boolean}
    | {type: SearchActionTypes.SET_SELECTION; selected: ISelectedRecord[]}
    | {type: SearchActionTypes.TOGGLE_RECORD_SELECTION; record: ISelectedRecord}
    | {type: SearchActionTypes.SELECT_ALL}
    | {type: SearchActionTypes.CLEAR_SELECTION};

export const initialSearchState: ISearchState = {
    library: null,
    errors: [],
    records: [],
    totalCount: 0,
    loading: false,
    pagination: 20,
    offset: 0,
    attributes: [],
    trees: [],
    fields: [],
    fullText: '',
    filters: [],
    display: {type: ViewTypes.list, size: ViewSizes.MEDIUM},
    view: {current: defaultView, reload: false, sync: true},
    userViewsOrder: [],
    sharedViewsOrder: [],
    valuesVersions: {},
    lang: null,
    sideBar: {
        visible: false,
        type: SidebarContentType.filters
    },
    selection: {
        selected: [],
        allSelected: false
    },
    showTransparency: false,
    mode: SearchMode.search
};

const checkSync = (
    state: ISearchState,
    toCheck: {sort: boolean; filters: boolean; display: boolean; fields: boolean; valuesVersions: boolean}
): boolean => {
    let sync = true;

    if (toCheck.sort) {
        sync =
            state.sort?.field === state.view?.current?.sort?.field &&
            state.sort?.order === state.view?.current?.sort?.order;
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
        sort: action.type !== SearchActionTypes.SET_SORT,
        filters: action.type !== SearchActionTypes.SET_FILTERS,
        display: action.type !== SearchActionTypes.SET_DISPLAY,
        fields: action.type !== SearchActionTypes.SET_FIELDS,
        valuesVersions: action.type !== SearchActionTypes.SET_VALUES_VERSIONS
    });

    switch (action.type) {
        case SearchActionTypes.UPDATE_RESULT: {
            return {
                ...state,
                records: action.records ?? state.records,
                totalCount: action.totalCount ?? state.totalCount,
                errors: action.errors ?? [],
                loading: false
            };
        }
        case SearchActionTypes.SET_PAGINATION:
            return {...state, pagination: action.page, loading: true};
        case SearchActionTypes.SET_OFFSET:
            return {...state, offset: action.offset, loading: true};
        case SearchActionTypes.SET_LOADING:
            return {...state, loading: action.loading};
        case SearchActionTypes.SET_SORT:
            sync =
                sync &&
                state.view.current.sort?.field === action.sort.field &&
                state.view.current.sort?.order === action.sort.order;

            return {...state, sort: action.sort, view: {...state.view, sync}};
        case SearchActionTypes.CANCEL_SORT:
            const {sort, ...newState} = state;

            sync = sync && typeof state.view.current.sort === 'undefined';

            return {...newState, view: {...state.view, sync}, loading: true};
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
                sort: action.view.sort,
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
        case SearchActionTypes.ENABLE_FILTERS:
            return {
                ...state,
                filters: state.filters.map(f => ({...f, active: true})),
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
        case SearchActionTypes.TOGGLE_TRANSPARENCY:
            return {...state, showTransparency: !state.showTransparency};
        case SearchActionTypes.TOGGLE_SIDEBAR:
            return {...state, sideBar: {...state.sideBar, visible: !state.sideBar.visible}};
        case SearchActionTypes.SET_SIDEBAR:
            return {...state, sideBar: {...state.sideBar, type: action.sidebarType, visible: action.visible}};
        case SearchActionTypes.SET_SELECTION:
            return {...state, selection: {...state.selection, selected: action.selected, allSelected: false}};
        case SearchActionTypes.TOGGLE_RECORD_SELECTION:
            const currentlySelected = state.selection.selected.findIndex(s => s.id === action.record.id) > -1;

            return {
                ...state,
                selection: {
                    ...state.selection,
                    selected: currentlySelected
                        ? state.selection.selected.filter(s => s.id !== action.record.id)
                        : [...state.selection.selected, action.record]
                }
            };
        case SearchActionTypes.SELECT_ALL:
            return {
                ...state,
                selection: {
                    selected: [],
                    allSelected: true
                }
            };
        case SearchActionTypes.CLEAR_SELECTION:
            return {
                ...state,
                selection: {
                    selected: [],
                    allSelected: false
                }
            };
        default:
            return state;
    }
};

export default searchReducer;
