// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {v4 as uuid} from 'uuid';
import {SortOrder, RecordFilterCondition} from '_ui/_gqlTypes';
import {Entrypoint, IExplorerFilter} from '../../_types';
import {hasOnlyNoValueConditions} from '../../conditionsHelper';
import {MASS_SELECTION_ALL} from '../../_constants';
import {conditionsByFormat} from '../filter-items/filter-type/useConditionOptionsByType';

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
    RESTORE_INITIAL_VIEW_SETTINGS: 'RESTORE_INITIAL_VIEW_SETTINGS'
} as const;

export interface IViewSettingsState {
    libraryId: string;
    viewId?: string;
    entrypoint: Entrypoint;
    viewType: ViewType;
    attributesIds: string[];
    fulltextSearch: string;
    sort: Array<{
        field: string;
        order: SortOrder;
    }>;
    pageSize: number;
    filters: IExplorerFilter[];
    maxFilters: number;
    initialViewSettings: Pick<IViewSettingsState, 'viewType' | 'attributesIds' | 'sort' | 'pageSize' | 'filters'>;
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
    payload: Omit<IExplorerFilter, 'id' | 'value' | 'condition'>;
}

interface IViewSettingsActionResetFilter {
    type: typeof ViewSettingsActionTypes.RESET_FILTER;
    payload: Pick<IExplorerFilter, 'id'>;
}

interface IViewSettingsActionRemoveFilter {
    type: typeof ViewSettingsActionTypes.REMOVE_FILTER;
    payload: Pick<IExplorerFilter, 'id'>;
}

interface IViewSettingsActionChangeFilterConfig {
    type: typeof ViewSettingsActionTypes.CHANGE_FILTER_CONFIG;
    payload: IExplorerFilter;
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
    attributesIds: [...state.attributesIds, payload.attributeId]
});

const removeAttribute: Reducer<IViewSettingsActionRemoveAttribute> = (state, payload) => ({
    ...state,
    attributesIds: state.attributesIds.filter(attributesId => attributesId !== payload.attributeId)
});

const moveAttribute: Reducer<IViewSettingsActionMoveAttribute> = (state, payload) => {
    const attributesIds = [...state.attributesIds];
    const [attributeIdToMove] = attributesIds.splice(payload.indexFrom, 1);
    // TODO use newES6 syntax (toSpliced)
    attributesIds.splice(payload.indexTo, 0, attributeIdToMove);
    return {
        ...state,
        attributesIds
    };
};

const resetAttributes: Reducer = state => ({
    ...state,
    attributesIds: []
});

const changeViewType: Reducer<IViewSettingsActionChangeViewType> = (state, payload) => ({
    ...state,
    viewType: payload.viewType
});

const addSort: Reducer<IViewSettingsActionAddSort> = (state, payload) => ({
    ...state,
    sort: [...state.sort, {field: payload.field, order: payload.order}]
});

const removeSort: Reducer<IViewSettingsActionRemoveSort> = (state, payload) => ({
    ...state,
    sort: state.sort.filter(({field: attributeId}) => attributeId !== payload.field)
});

const changeSortOrder: Reducer<IViewSettingsActionChangeSortOrder> = (state, payload) => ({
    ...state,
    sort: state.sort.map(sort => (sort.field === payload.field ? {...sort, order: payload.order} : sort))
});

const moveSort: Reducer<IViewSettingsActionMoveSort> = (state, payload) => {
    const attributesUsedToSort = [...state.sort];
    const [sortToMove] = attributesUsedToSort.splice(payload.indexFrom, 1);
    attributesUsedToSort.splice(payload.indexTo, 0, sortToMove);
    return {
        ...state,
        sort: attributesUsedToSort
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
            condition: hasOnlyNoValueConditions(payload.attribute.format)
                ? null
                : ((conditionsByFormat[payload.attribute.format][0] ?? null) as RecordFilterCondition),
            value: null
        }
    ]
});

const resetFilter: Reducer<IViewSettingsActionResetFilter> = (state, payload) => ({
    ...state,
    filters: state.filters.map(filter => {
        if (filter.id === payload.id) {
            const initialViewFilter = state.initialViewSettings.filters.find(({id}) => id === payload.id);
            return (
                initialViewFilter ?? {
                    ...filter,
                    condition: hasOnlyNoValueConditions(filter.attribute.format)
                        ? null
                        : ((conditionsByFormat[filter.attribute.format][0] ?? null) as RecordFilterCondition),
                    value: null
                }
            );
        }
        return filter;
    })
});

const removeFilter: Reducer<IViewSettingsActionRemoveFilter> = (state, payload) => ({
    ...state,
    filters: state.filters.filter(({id}) => id !== payload.id)
});

const changeFilterConfig: Reducer<IViewSettingsActionChangeFilterConfig> = (state, payload) => ({
    ...state,
    filters: state.filters.map(filter => (filter.id === payload.id ? {...filter, ...payload} : filter))
});

const moveFilter: Reducer<IViewSettingsActionMoveFilter> = (state, payload) => {
    const attributesUsedToFilter = [...state.filters];
    const [filterToMove] = attributesUsedToFilter.splice(payload.indexFrom, 1);
    attributesUsedToFilter.splice(payload.indexTo, 0, filterToMove);
    return {
        ...state,
        filters: attributesUsedToFilter
    };
};

const reset: Reducer<IViewSettingsActionReset> = (_, payload) => payload;

const setSelectedKeys: Reducer<IViewSettingsActionSetSelectedKeys> = (state, payload) => ({
    ...state,
    massSelection: payload
});

const restoreInitialViewSettings: Reducer = state => ({
    ...state,
    ...state.initialViewSettings
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
    | IViewSettingsActionRestoreInitialViewSettings;

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
        default:
            return state;
    }
};
