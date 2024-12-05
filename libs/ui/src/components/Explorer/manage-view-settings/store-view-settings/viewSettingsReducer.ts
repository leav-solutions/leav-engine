// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SortOrder} from '_ui/_gqlTypes';

export type ViewType = 'table' | 'list' | 'timeline' | 'mosaic';

export const ViewSettingsActionTypes = {
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
    CLEAR_FULLTEXT_SEARCH: 'CLEAR_FULLTEXT_SEARCH'
    CHANGE_SORT_ORDER: 'CHANGE_SORT_ORDER',
    ADD_FILTER: 'ADD_FILTER',
    REMOVE_FILTER: 'REMOVE_FILTER',
    MOVE_FILTER: 'MOVE_FILTER',
    CHANGE_FILTER_CONFIG: 'CHANGE_FILTER_CONFIG'
} as const;

export interface IViewSettingsState {
    viewType: ViewType;
    attributesIds: string[];
    fulltextSearch: string;
    sort: Array<{
        attributeId: string;
        order: SortOrder;
    }>;
    pageSize: number;
    filter: Array<{
        field: string;
        operator: string;
        values: string[];
    }>;
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
    payload: {attributeId: string; order: SortOrder};
}

interface IViewSettingsActionRemoveSort {
    type: typeof ViewSettingsActionTypes.REMOVE_SORT;
    payload: {attributeId: string};
}

interface IViewSettingsActionChangeSortOrder {
    type: typeof ViewSettingsActionTypes.CHANGE_SORT_ORDER;
    payload: {attributeId: string; order: SortOrder};
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
    payload: {field: string; operator: string; values: string[]};
}

interface IViewSettingsActionRemoveFilter {
    type: typeof ViewSettingsActionTypes.REMOVE_FILTER;
    payload: {field: string};
}

interface IViewSettingsActionChangeFilterConfig {
    type: typeof ViewSettingsActionTypes.CHANGE_FILTER_CONFIG;
    payload: {field: string; operator: string; values: string[]};
}

interface IViewSettingsActionMoveFilter {
    type: typeof ViewSettingsActionTypes.MOVE_FILTER;
    payload: {
        indexFrom: number;
        indexTo: number;
    };
}

type Reducer<PAYLOAD = 'no_payload'> = PAYLOAD extends 'no_payload'
    ? (state: IViewSettingsState) => IViewSettingsState
    : (state: IViewSettingsState, payload: PAYLOAD) => IViewSettingsState;

const changePageSize: Reducer<IViewSettingsActionChangePageSize['payload']> = (state, payload) => ({
    ...state,
    pageSize: payload.pageSize
});

const addAttribute: Reducer<IViewSettingsActionAddAttribute['payload']> = (state, payload) => ({
    ...state,
    attributesIds: [...state.attributesIds, payload.attributeId]
});

const removeAttribute: Reducer<IViewSettingsActionRemoveAttribute['payload']> = (state, payload) => ({
    ...state,
    attributesIds: state.attributesIds.filter(attributesId => attributesId !== payload.attributeId)
});

const moveAttribute: Reducer<IViewSettingsActionMoveAttribute['payload']> = (state, payload) => {
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

const changeViewType: Reducer<IViewSettingsActionChangeViewType['payload']> = (state, payload) => ({
    ...state,
    viewType: payload.viewType
});

const addSort: Reducer<IViewSettingsActionAddSort['payload']> = (state, payload) => ({
    ...state,
    sort: [...state.sort, {attributeId: payload.attributeId, order: payload.order}]
});

const removeSort: Reducer<IViewSettingsActionRemoveSort['payload']> = (state, payload) => ({
    ...state,
    sort: state.sort.filter(({attributeId}) => attributeId !== payload.attributeId)
});

const changeSortOrder: Reducer<IViewSettingsActionChangeSortOrder['payload']> = (state, payload) => ({
    ...state,
    sort: state.sort.map(sort => (sort.attributeId === payload.attributeId ? {...sort, order: payload.order} : sort))
});

const moveSort: Reducer<IViewSettingsActionMoveSort['payload']> = (state, payload) => {
    const attributesUsedToSort = [...state.sort];
    const [sortToMove] = attributesUsedToSort.splice(payload.indexFrom, 1);
    attributesUsedToSort.splice(payload.indexTo, 0, sortToMove);
    return {
        ...state,
        sort: attributesUsedToSort
    };
};

const changeFulltextSearch: Reducer<IViewSettingsActionChangeFulltextSearch['payload']> = (state, payload) => ({
    ...state,
    fulltextSearch: payload.search
});

export const clearFulltextSearch: Reducer = state => ({
    ...state,
    fulltextSearch: ''
});

const addFilter: Reducer<IViewSettingsActionAddFilter['payload']> = (state, payload) => ({
    ...state,
    filter: [...state.filter, {field: payload.field, operator: payload.operator, values: payload.values}]
});

const removeFilter: Reducer<IViewSettingsActionRemoveFilter['payload']> = (state, payload) => ({
    ...state,
    filter: state.filter.filter(({field}) => field !== payload.field)
});

const changeFilterConfig: Reducer<IViewSettingsActionChangeFilterConfig['payload']> = (state, payload) => ({
    ...state,
    filter: state.filter.map(filter =>
        filter.field === payload.field ? {...filter, operator: payload.operator, values: payload.values} : filter
    )
});

const moveFilter: Reducer<IViewSettingsActionMoveFilter['payload']> = (state, payload) => {
    const attributesUsedToFilter = [...state.filter];
    const [filterToMove] = attributesUsedToFilter.splice(payload.indexFrom, 1);
    attributesUsedToFilter.splice(payload.indexTo, 0, filterToMove);
    return {
        ...state,
        filter: attributesUsedToFilter
    };
};

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
    | IViewSettingsActionMoveSort
    | IViewSettingsActionAddFilter
    | IViewSettingsActionRemoveFilter
    | IViewSettingsActionChangeFilterConfig
    | IViewSettingsActionMoveFilter;

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
        case ViewSettingsActionTypes.REMOVE_FILTER: {
            return removeFilter(state, action.payload);
        }
        case ViewSettingsActionTypes.CHANGE_FILTER_CONFIG: {
            return changeFilterConfig(state, action.payload);
        }
        case ViewSettingsActionTypes.MOVE_FILTER: {
            return moveFilter(state, action.payload);
        }
        default:
            return state;
    }
};
