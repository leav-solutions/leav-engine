// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {v4 as uuid} from 'uuid';
import {SortOrder, AttributeFormat} from '_ui/_gqlTypes';
import {
    DefaultViewSettings,
    Entrypoint,
    ExplorerFilter,
    IExplorerFilterStandard,
    isExplorerFilterLink,
    isExplorerFilterStandard,
    isExplorerFilterThrough,
    IUserView
} from '../../_types';
import {hasOnlyNoValueConditions} from '../../conditionsHelper';
import {MASS_SELECTION_ALL} from '../../_constants';
import {conditionsByFormat} from '../filter-items/filter-type/useConditionOptionsByType';
import {ThroughConditionFilter} from '_ui/types';

export type ViewType = 'table' | 'list' | 'timeline' | 'mosaic';
export type MassSelection = string[] | typeof MASS_SELECTION_ALL;

export const ViewSettingsActionTypes = {
    RESET: 'RESET',
    ADD_ATTRIBUTE: 'ADD_ATTRIBUTE',
    REMOVE_ATTRIBUTE: 'REMOVE_ATTRIBUTE',
    MOVE_ATTRIBUTE: 'MOVE_ATTRIBUTE',
    RESET_ATTRIBUTES: 'RESET_ATTRIBUTES',
    CHANGE_VIEW_TYPE: 'CHANGE_VIEW_TYPE',
    ADD_SORT: 'ADD_SORT',
    REMOVE_SORT: 'REMOVE_SORT',
    MOVE_SORT: 'MOVE_SORT',
    CHANGE_SORT_ORDER: 'CHANGE_SORT_ORDER',
    CHANGE_PAGE_SIZE: 'CHANGE_PAGE_SIZE',
    CHANGE_FULLTEXT_SEARCH: 'CHANGE_FULLTEXT_SEARCH',
    CLEAR_FULLTEXT_SEARCH: 'CLEAR_FULLTEXT_SEARCH',
    ADD_FILTER: 'ADD_FILTER',
    RESET_FILTER: 'RESET_FILTER',
    REMOVE_FILTER: 'REMOVE_FILTER',
    MOVE_FILTER: 'MOVE_FILTER',
    CHANGE_FILTER_CONFIG: 'CHANGE_FILTER_CONFIG',
    SET_SELECTED_KEYS: 'SET_SELECTED_KEYS',
    RESTORE_INITIAL_VIEW_SETTINGS: 'RESTORE_INITIAL_VIEW_SETTINGS',
    UPDATE_VIEWS: 'UPDATE_VIEWS',
    LOAD_VIEW: 'LOAD_VIEW'
} as const;

export interface IViewSettingsState {
    libraryId: string;
    viewId: string | null;
    viewLabels: Record<string, string>;
    viewModified: boolean;
    entrypoint: Entrypoint;
    viewType: ViewType;
    savedViews: IUserView[];
    attributesIds: string[];
    fulltextSearch: string;
    sort: Array<{
        field: string;
        order: SortOrder;
    }>;
    pageSize: number;
    filters: ExplorerFilter[];
    maxFilters: number;
    initialViewSettings: Pick<IViewSettingsState, 'viewType' | 'attributesIds' | 'sort' | 'pageSize' | 'filters'>;
    defaultViewSettings: DefaultViewSettings;
    massSelection: MassSelection;
}

interface IViewSettingsActionChangePageSize {
    type: typeof ViewSettingsActionTypes.CHANGE_PAGE_SIZE;
    payload: {pageSize: number};
}

interface IViewSettingsActionAddAttribute {
    type: typeof ViewSettingsActionTypes.ADD_ATTRIBUTE;
    payload: {attributeId: string};
}

interface IViewSettingsActionRemoveAttribute {
    type: typeof ViewSettingsActionTypes.REMOVE_ATTRIBUTE;
    payload: {attributeId: string};
}

interface IViewSettingsActionMoveAttribute {
    type: typeof ViewSettingsActionTypes.MOVE_ATTRIBUTE;
    payload: {
        indexFrom: number;
        indexTo: number;
    };
}

interface IViewSettingsActionChangeViewType {
    type: typeof ViewSettingsActionTypes.CHANGE_VIEW_TYPE;
    payload: {viewType: ViewType};
}

interface IViewSettingsActionResetAttributes {
    type: typeof ViewSettingsActionTypes.RESET_ATTRIBUTES;
}

interface IViewSettingsActionAddSort {
    type: typeof ViewSettingsActionTypes.ADD_SORT;
    payload: {field: string; order: SortOrder};
}

interface IViewSettingsActionRemoveSort {
    type: typeof ViewSettingsActionTypes.REMOVE_SORT;
    payload: {field: string};
}

interface IViewSettingsActionChangeSortOrder {
    type: typeof ViewSettingsActionTypes.CHANGE_SORT_ORDER;
    payload: {field: string; order: SortOrder};
}

interface IViewSettingsActionMoveSort {
    type: typeof ViewSettingsActionTypes.MOVE_SORT;
    payload: {
        indexFrom: number;
        indexTo: number;
    };
}

interface IViewSettingsActionChangeFulltextSearch {
    type: typeof ViewSettingsActionTypes.CHANGE_FULLTEXT_SEARCH;
    payload: {search: string};
}

interface IViewSettingsActionClearFulltextSearch {
    type: typeof ViewSettingsActionTypes.CLEAR_FULLTEXT_SEARCH;
}

interface IViewSettingsActionAddFilter {
    type: typeof ViewSettingsActionTypes.ADD_FILTER;
    payload: Omit<ExplorerFilter, 'id' | 'value' | 'condition'>;
}

interface IViewSettingsActionResetFilter {
    type: typeof ViewSettingsActionTypes.RESET_FILTER;
    payload: Pick<ExplorerFilter, 'id'>;
}

interface IViewSettingsActionRemoveFilter {
    type: typeof ViewSettingsActionTypes.REMOVE_FILTER;
    payload: Pick<ExplorerFilter, 'id'>;
}

interface IViewSettingsActionChangeFilterConfig {
    type: typeof ViewSettingsActionTypes.CHANGE_FILTER_CONFIG;
    payload: ExplorerFilter;
}

interface IViewSettingsActionMoveFilter {
    type: typeof ViewSettingsActionTypes.MOVE_FILTER;
    payload: {
        indexFrom: number;
        indexTo: number;
    };
}

interface IViewSettingsActionReset {
    type: typeof ViewSettingsActionTypes.RESET;
    payload: IViewSettingsState;
}

interface IViewSettingsActionSetSelectedKeys {
    type: typeof ViewSettingsActionTypes.SET_SELECTED_KEYS;
    payload: MassSelection;
}

interface IViewSettingsActionRestoreInitialViewSettings {
    type: typeof ViewSettingsActionTypes.RESTORE_INITIAL_VIEW_SETTINGS;
}

interface IViewSettingsActionUpdateViewListAndCurrentView {
    type: typeof ViewSettingsActionTypes.UPDATE_VIEWS;
    payload: IUserView;
}

export type IViewSettingsActionLoadViewPayload = Pick<
    IViewSettingsState,
    'viewId' | 'viewLabels' | 'viewType' | 'attributesIds' | 'sort' | 'filters'
>;

interface IViewSettingsActionLoadView {
    type: typeof ViewSettingsActionTypes.LOAD_VIEW;
    payload: IViewSettingsActionLoadViewPayload;
}

type Reducer<
    PAYLOAD extends {
        type: keyof typeof ViewSettingsActionTypes;
        payload?: unknown;
    } = {type: any; payload: 'no_payload'}
> = PAYLOAD['payload'] extends 'no_payload'
    ? (state: IViewSettingsState) => IViewSettingsState
    : (state: IViewSettingsState, payload: PAYLOAD['payload']) => IViewSettingsState;

const changePageSize: Reducer<IViewSettingsActionChangePageSize> = (state, payload) => ({
    ...state,
    pageSize: payload.pageSize
});

const addAttribute: Reducer<IViewSettingsActionAddAttribute> = (state, payload) => ({
    ...state,
    attributesIds: [...state.attributesIds, payload.attributeId],
    viewModified: true
});

const removeAttribute: Reducer<IViewSettingsActionRemoveAttribute> = (state, payload) => ({
    ...state,
    attributesIds: state.attributesIds.filter(attributesId => attributesId !== payload.attributeId),
    viewModified: true
});

const moveAttribute: Reducer<IViewSettingsActionMoveAttribute> = (state, payload) => {
    const attributesIds = [...state.attributesIds];
    const [attributeIdToMove] = attributesIds.splice(payload.indexFrom, 1);
    // TODO use newES6 syntax (toSpliced)
    attributesIds.splice(payload.indexTo, 0, attributeIdToMove);
    return {
        ...state,
        attributesIds,
        viewModified: true
    };
};

const resetAttributes: Reducer = state => ({
    ...state,
    attributesIds: []
});

const changeViewType: Reducer<IViewSettingsActionChangeViewType> = (state, payload) => ({
    ...state,
    viewType: payload.viewType,
    viewModified: true
});

const addSort: Reducer<IViewSettingsActionAddSort> = (state, payload) => ({
    ...state,
    sort: [...state.sort, {field: payload.field, order: payload.order}],
    viewModified: true
});

const removeSort: Reducer<IViewSettingsActionRemoveSort> = (state, payload) => ({
    ...state,
    sort: state.sort.filter(({field: attributeId}) => attributeId !== payload.field),
    viewModified: true
});

const changeSortOrder: Reducer<IViewSettingsActionChangeSortOrder> = (state, payload) => ({
    ...state,
    sort: state.sort.map(sort => (sort.field === payload.field ? {...sort, order: payload.order} : sort)),
    viewModified: true
});

const moveSort: Reducer<IViewSettingsActionMoveSort> = (state, payload) => {
    const attributesUsedToSort = [...state.sort];
    const [sortToMove] = attributesUsedToSort.splice(payload.indexFrom, 1);
    attributesUsedToSort.splice(payload.indexTo, 0, sortToMove);
    return {
        ...state,
        sort: attributesUsedToSort,
        viewModified: true
    };
};

const changeFulltextSearch: Reducer<IViewSettingsActionChangeFulltextSearch> = (state, payload) => ({
    ...state,
    fulltextSearch: payload.search
});

export const clearFulltextSearch: Reducer = state => ({
    ...state,
    fulltextSearch: ''
});

const addFilter: Reducer<IViewSettingsActionAddFilter> = (state, payload) => ({
    ...state,
    filters: [
        ...state.filters,
        {
            ...payload,
            id: uuid(),
            condition: hasOnlyNoValueConditions((payload as IExplorerFilterStandard).attribute.format)
                ? null
                : (conditionsByFormat[(payload as IExplorerFilterStandard).attribute.format][0] ?? null),
            value: null
        }
    ],
    viewModified: true
});

const resetFilter: Reducer<IViewSettingsActionResetFilter> = (state, payload) => ({
    ...state,
    filters: state.filters.map(filter => {
        if (filter.id === payload.id) {
            const initialViewFilter = state.initialViewSettings.filters.find(({id}) => id === payload.id);
            if (initialViewFilter) {
                return initialViewFilter;
            }

            if (isExplorerFilterStandard(filter)) {
                return {
                    ...filter,
                    condition: hasOnlyNoValueConditions(filter.attribute.format)
                        ? null
                        : conditionsByFormat[filter.attribute.format][0],
                    value: null
                };
            }

            if (isExplorerFilterThrough(filter)) {
                return {
                    ...filter,
                    condition: ThroughConditionFilter.THROUGH,
                    value: null
                };
            }

            if (isExplorerFilterLink(filter)) {
                return {
                    ...filter,
                    condition: conditionsByFormat[AttributeFormat.text][0],
                    value: null
                };
            }
        }
        return filter;
    })
});

const removeFilter: Reducer<IViewSettingsActionRemoveFilter> = (state, payload) => ({
    ...state,
    filters: state.filters.filter(({id}) => id !== payload.id),
    viewModified: true
});

const changeFilterConfig: Reducer<IViewSettingsActionChangeFilterConfig> = (state, payload) => ({
    ...state,
    filters: state.filters.map(filter => (filter.id === payload.id ? {...filter, ...payload} : filter)),
    viewModified: true
});

const moveFilter: Reducer<IViewSettingsActionMoveFilter> = (state, payload) => {
    const attributesUsedToFilter = [...state.filters];
    const [filterToMove] = attributesUsedToFilter.splice(payload.indexFrom, 1);
    attributesUsedToFilter.splice(payload.indexTo, 0, filterToMove);
    return {
        ...state,
        filters: attributesUsedToFilter,
        viewModified: true
    };
};

const reset: Reducer<IViewSettingsActionReset> = (_, payload) => payload;

const setSelectedKeys: Reducer<IViewSettingsActionSetSelectedKeys> = (state, payload) => ({
    ...state,
    massSelection: payload
});

const restoreInitialViewSettings: Reducer = state => ({
    ...state,
    ...state.initialViewSettings,
    viewModified: false
});

const updateViewListAndCurrentView: Reducer<IViewSettingsActionUpdateViewListAndCurrentView> = (state, payload) => ({
    ...state,
    viewId: payload.id ?? null,
    viewLabels: payload.label,
    savedViews: state.savedViews.find(({id}) => id === payload.id)
        ? state.savedViews.map(view => (view.id === payload.id ? payload : view))
        : state.savedViews.concat([payload]),
    initialViewSettings: {
        viewType: state.viewType,
        attributesIds: state.attributesIds,
        sort: state.sort,
        pageSize: state.pageSize,
        filters: state.filters
    },
    viewModified: false
});

const loadView: Reducer<IViewSettingsActionLoadView> = (state, payload) => ({
    ...state,
    ...payload,
    initialViewSettings: {
        viewType: payload.viewType,
        attributesIds: payload.attributesIds,
        sort: payload.sort,
        pageSize: state.pageSize,
        filters: payload.filters
    },
    viewModified: false
});

export type IViewSettingsAction =
    | IViewSettingsActionResetAttributes
    | IViewSettingsActionAddAttribute
    | IViewSettingsActionRemoveAttribute
    | IViewSettingsActionMoveAttribute
    | IViewSettingsActionChangeViewType
    | IViewSettingsActionAddSort
    | IViewSettingsActionRemoveSort
    | IViewSettingsActionChangeSortOrder
    | IViewSettingsActionMoveSort
    | IViewSettingsActionChangePageSize
    | IViewSettingsActionChangeFulltextSearch
    | IViewSettingsActionClearFulltextSearch
    | IViewSettingsActionAddFilter
    | IViewSettingsActionResetFilter
    | IViewSettingsActionRemoveFilter
    | IViewSettingsActionChangeFilterConfig
    | IViewSettingsActionMoveFilter
    | IViewSettingsActionReset
    | IViewSettingsActionSetSelectedKeys
    | IViewSettingsActionRestoreInitialViewSettings
    | IViewSettingsActionUpdateViewListAndCurrentView
    | IViewSettingsActionLoadView;

export const viewSettingsReducer = (state: IViewSettingsState, action: IViewSettingsAction): IViewSettingsState => {
    switch (action.type) {
        case ViewSettingsActionTypes.CHANGE_PAGE_SIZE: {
            return changePageSize(state, action.payload);
        }
        case ViewSettingsActionTypes.ADD_ATTRIBUTE: {
            return addAttribute(state, action.payload);
        }
        case ViewSettingsActionTypes.REMOVE_ATTRIBUTE: {
            return removeAttribute(state, action.payload);
        }
        case ViewSettingsActionTypes.MOVE_ATTRIBUTE: {
            return moveAttribute(state, action.payload);
        }
        case ViewSettingsActionTypes.RESET_ATTRIBUTES: {
            return resetAttributes(state);
        }
        case ViewSettingsActionTypes.CHANGE_VIEW_TYPE: {
            return changeViewType(state, action.payload);
        }
        case ViewSettingsActionTypes.ADD_SORT: {
            return addSort(state, action.payload);
        }
        case ViewSettingsActionTypes.REMOVE_SORT: {
            return removeSort(state, action.payload);
        }
        case ViewSettingsActionTypes.MOVE_SORT: {
            return moveSort(state, action.payload);
        }
        case ViewSettingsActionTypes.CHANGE_SORT_ORDER: {
            return changeSortOrder(state, action.payload);
        }
        case ViewSettingsActionTypes.CHANGE_FULLTEXT_SEARCH: {
            return changeFulltextSearch(state, action.payload);
        }
        case ViewSettingsActionTypes.CLEAR_FULLTEXT_SEARCH: {
            return clearFulltextSearch(state);
        }
        case ViewSettingsActionTypes.ADD_FILTER: {
            return addFilter(state, action.payload);
        }
        case ViewSettingsActionTypes.RESET_FILTER: {
            return resetFilter(state, action.payload);
        }
        case ViewSettingsActionTypes.REMOVE_FILTER: {
            return removeFilter(state, action.payload);
        }
        case ViewSettingsActionTypes.CHANGE_FILTER_CONFIG: {
            return changeFilterConfig(state, action.payload);
        }
        case ViewSettingsActionTypes.MOVE_FILTER: {
            return moveFilter(state, action.payload);
        }
        case ViewSettingsActionTypes.RESET: {
            return reset(state, action.payload);
        }
        case ViewSettingsActionTypes.SET_SELECTED_KEYS: {
            return setSelectedKeys(state, action.payload);
        }
        case ViewSettingsActionTypes.RESTORE_INITIAL_VIEW_SETTINGS: {
            return restoreInitialViewSettings(state);
        }
        case ViewSettingsActionTypes.UPDATE_VIEWS: {
            return updateViewListAndCurrentView(state, action.payload);
        }
        case ViewSettingsActionTypes.LOAD_VIEW: {
            return loadView(state, action.payload);
        }
        default:
            return state;
    }
};
