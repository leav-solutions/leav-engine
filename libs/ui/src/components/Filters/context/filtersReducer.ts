// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {v4 as uuid} from 'uuid';
import {AttributeFormat, type RecordFilterCondition} from '_ui/_gqlTypes';
import {
    type UIFilter,
    type IUIFilterStandard,
    type IUIFilterTree,
    isUIFilterLink,
    isUIFilterStandard,
    isUIFilterThrough,
    isUIFilterTree,
    isUIFilterValueList,
    type FiltersOperator,
} from '../_types';
import {hasOnlyNoValueConditions, nullValueConditions} from '../conditionsHelper';
import {conditionsByFormat, getFirstConditionByFilterType} from '../filter-items/filter-type/useConditionOptionsByType';
import {AttributeConditionFilter, ThroughConditionFilter} from '_ui/types';
import {isLinkAttribute} from '_ui/_utils/attributeType';
import {type AttributesById} from '../useTransformFilters';

export type ViewType = 'table' | 'list' | 'timeline' | 'mosaic';

export const FiltersActionTypes = {
    ADD_FILTER: 'ADD_FILTER',
    RESET_FILTER: 'RESET_FILTER',
    REMOVE_FILTER: 'REMOVE_FILTER',
    MOVE_FILTER: 'MOVE_FILTER',
    CHANGE_FILTER_CONFIG: 'CHANGE_FILTER_CONFIG',
    LOAD_VIEW: 'LOAD_VIEW',
    RESET: 'RESET',
    RESTORE_INITIAL_VIEW_SETTINGS: 'RESTORE_INITIAL_VIEW_SETTINGS',
    UPDATE_VIEWS: 'UPDATE_VIEWS',
} as const;

export interface IUIFiltersState {
    libraryId: string;
    viewId: string | null;
    filtersOperator: FiltersOperator;
    filters: UIFilter[] | IUIFilterTree[];
    initialFilters: UIFilter[] | IUIFilterTree[];
    attributesDataById: AttributesById;
    loading: boolean;
}

interface IUIFiltersActionAddFilter {
    type: typeof FiltersActionTypes.ADD_FILTER;
    payload: Omit<UIFilter, 'id' | 'value' | 'condition'>;
}

interface IIUIFiltersActionResetFilter {
    type: typeof FiltersActionTypes.RESET_FILTER;
    payload: Pick<UIFilter, 'id'>;
}

interface IUIFiltersActionRemoveFilter {
    type: typeof FiltersActionTypes.REMOVE_FILTER;
    payload: Pick<UIFilter, 'id'>;
}

interface IUIFiltersActionChangeFilterConfig {
    type: typeof FiltersActionTypes.CHANGE_FILTER_CONFIG;
    payload: UIFilter | IUIFilterTree;
}

interface IUIFiltersActionMoveFilter {
    type: typeof FiltersActionTypes.MOVE_FILTER;
    payload: {
        indexFrom: number;
        indexTo: number;
    };
}

interface IUIFiltersActionReset {
    type: typeof FiltersActionTypes.RESET;
    payload: IUIFiltersState;
}

interface IUIFiltersActionLoadView {
    type: typeof FiltersActionTypes.LOAD_VIEW;
    payload: Pick<IUIFiltersState, 'filters' | 'viewId' | 'attributesDataById'>;
}

interface IUIFiltersActionRestoreInitialViewSettings {
    type: typeof FiltersActionTypes.RESTORE_INITIAL_VIEW_SETTINGS;
}

interface IUIFiltersActionUpdateViewListAndCurrentView {
    type: typeof FiltersActionTypes.UPDATE_VIEWS;
    payload: IUIFiltersState;
}

type Reducer<
    PAYLOAD extends {
        type: keyof typeof FiltersActionTypes;
        payload?: unknown;
    } = {type: any; payload: 'no_payload'},
> = PAYLOAD['payload'] extends 'no_payload'
    ? (state: IUIFiltersState) => IUIFiltersState
    : (state: IUIFiltersState, payload: PAYLOAD['payload']) => IUIFiltersState;

export type UIFiltersAction =
    | IUIFiltersActionAddFilter
    | IIUIFiltersActionResetFilter
    | IUIFiltersActionRemoveFilter
    | IUIFiltersActionChangeFilterConfig
    | IUIFiltersActionMoveFilter
    | IUIFiltersActionReset
    | IUIFiltersActionLoadView
    | IUIFiltersActionRestoreInitialViewSettings
    | IUIFiltersActionUpdateViewListAndCurrentView;

const addFilter: Reducer<IUIFiltersActionAddFilter> = (state, payload) => {
    const hasValueList = payload.attribute.valuesList;

    let condition = hasOnlyNoValueConditions((payload as IUIFilterStandard).attribute.format)
        ? null
        : (conditionsByFormat[(payload as IUIFilterStandard).attribute.format][0] ?? null);
    if (hasValueList) {
        condition = AttributeConditionFilter.EQUAL;
    }

    const filterToAdd = isUIFilterTree(payload as UIFilter)
        ? {
              ...payload,
              id: uuid(),
              field: Array.isArray(payload.field) ? payload.field : [payload.field],
              condition: hasOnlyNoValueConditions((payload as IUIFilterStandard).attribute.format)
                  ? null
                  : (getFirstConditionByFilterType(payload as UIFilter) as RecordFilterCondition[])[0],
              value: null,
          }
        : {
              ...payload,
              field: isLinkAttribute(payload.attribute.type) ? `${payload.field}.id` : (payload.field as string),
              id: uuid(),
              condition,
              value: null,
              valuesList: hasValueList ? payload.attribute.valuesList : undefined,
          };
    return {
        ...state,
        filters: [...state.filters, filterToAdd],
        viewModified: true,
    };
};

const resetFilter: Reducer<IIUIFiltersActionResetFilter> = (state, payload) => ({
    ...state,
    filters: state.filters.map(filter => {
        if (filter.id === payload.id) {
            // TODO Add initial Filters State
            const initialFilter = state.initialFilters.find(({id}) => id === payload.id);
            if (initialFilter) {
                return initialFilter;
            }

            if (isUIFilterValueList(filter)) {
                return {
                    ...filter,
                    condition: null,
                    value: null,
                };
            }

            if (isUIFilterStandard(filter)) {
                return {
                    ...filter,
                    condition: hasOnlyNoValueConditions(filter.attribute.format)
                        ? null
                        : conditionsByFormat[filter.attribute.format][0],
                    value: null,
                };
            }

            if (isUIFilterThrough(filter)) {
                return {
                    ...filter,
                    condition: ThroughConditionFilter.THROUGH,
                    value: null,
                };
            }

            if (isUIFilterLink(filter)) {
                return {
                    ...filter,
                    condition: conditionsByFormat[AttributeFormat.text][0],
                    value: null,
                };
            }

            if (isUIFilterTree(filter)) {
                return {
                    ...filter,
                    condition: null,
                    value: null,
                };
            }
        }
        return filter;
    }),
});

const removeFilter: Reducer<IUIFiltersActionRemoveFilter> = (state, payload) => ({
    ...state,
    filters: state.filters.filter(({id}) => id !== payload.id),
    viewModified: true,
});

const changeFilterConfig: Reducer<IUIFiltersActionChangeFilterConfig> = (state, payload) => ({
    ...state,
    filters: state.filters.map(filter => {
        if (filter.id !== payload.id) {
            return filter;
        }
        if (isUIFilterTree(filter) && payload.value && payload.value.length === 0) {
            return {...filter, ...payload, value: null};
        }
        if (isUIFilterValueList(filter) && filter.condition && nullValueConditions.includes(filter.condition)) {
            return {...filter, ...payload, value: null};
        }
        return {...filter, ...payload};
    }),
    viewModified: true,
});

const moveFilter: Reducer<IUIFiltersActionMoveFilter> = (state, payload) => {
    const attributesUsedToFilter = [...state.filters];
    const [filterToMove] = attributesUsedToFilter.splice(payload.indexFrom, 1);
    attributesUsedToFilter.splice(payload.indexTo, 0, filterToMove);
    return {
        ...state,
        filters: attributesUsedToFilter,
        viewModified: true,
    };
};

const reset: Reducer<IUIFiltersActionReset> = (_, payload) => payload;

const loadView: Reducer<IUIFiltersActionLoadView> = (state, payload) => ({
    ...state,
    ...payload,
    initialFilters: payload.filters,
});

const restoreInitialViewSettings: Reducer = state => ({
    ...state,
    filters: state.initialFilters,
});

export const filtersReducer =
    setRefetchViews =>
    (state: IUIFiltersState, action: UIFiltersAction): IUIFiltersState => {
        switch (action.type) {
            case FiltersActionTypes.ADD_FILTER: {
                return addFilter(state, action.payload);
            }
            case FiltersActionTypes.RESET_FILTER: {
                return resetFilter(state, action.payload);
            }
            case FiltersActionTypes.REMOVE_FILTER: {
                return removeFilter(state, action.payload);
            }
            case FiltersActionTypes.CHANGE_FILTER_CONFIG: {
                return changeFilterConfig(state, action.payload);
            }
            case FiltersActionTypes.MOVE_FILTER: {
                return moveFilter(state, action.payload);
            }
            case FiltersActionTypes.RESET: {
                return reset(state, action.payload);
            }
            case FiltersActionTypes.LOAD_VIEW: {
                return loadView(state, action.payload);
            }
            case FiltersActionTypes.RESTORE_INITIAL_VIEW_SETTINGS: {
                return restoreInitialViewSettings(state);
            }
            case FiltersActionTypes.UPDATE_VIEWS: {
                setRefetchViews?.(true);
                return state;
            }
            default:
                return state;
        }
    };
