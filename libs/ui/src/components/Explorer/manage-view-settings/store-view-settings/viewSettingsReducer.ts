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
    CHANGE_SORT_ORDER: 'CHANGE_SORT_ORDER'
} as const;

export interface IViewSettingsState {
    viewType: ViewType;
    attributesIds: string[];
    sort: Array<{
        attributeId: string;
        order: SortOrder;
    }>;
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

type Reducer<PAYLOAD = 'no_payload'> = PAYLOAD extends 'no_payload'
    ? (state: IViewSettingsState) => IViewSettingsState
    : (state: IViewSettingsState, payload: PAYLOAD) => IViewSettingsState;

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
    return {
        ...state,
        attributesIds: attributesIds.toSpliced(payload.indexTo, 0, attributeIdToMove)
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

export type IViewSettingsAction =
    | IViewSettingsActionResetAttributes
    | IViewSettingsActionAddAttribute
    | IViewSettingsActionRemoveAttribute
    | IViewSettingsActionMoveAttribute
    | IViewSettingsActionChangeViewType
    | IViewSettingsActionAddSort
    | IViewSettingsActionRemoveSort
    | IViewSettingsActionChangeSortOrder
    | IViewSettingsActionMoveSort;

export const viewSettingsReducer = (state: IViewSettingsState, action: IViewSettingsAction): IViewSettingsState => {
    switch (action.type) {
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
        default:
            return state;
    }
};
