import {AttributeFormat, type RecordFilterCondition} from '_ui/_gqlTypes';
import {
    type UIFilter,
    type IUIFilterTree,
    isUIFilterLink,
    isUIFilterStandard,
    isUIFilterThrough,
    isUIFilterTree,
    isUIFilterValueList,
    isUIFilterWithSmartFilter,
    type FiltersOperator,
    type IUIFilterThrough,
} from '../_types';
import {hasOnlyNoValueConditions, nullValueConditions} from '../conditionsHelper';
import {conditionsByFormat, treeFilterConditions} from '../filter-items/filter-type/useConditionOptionsByType';
import {AttributeConditionFilter, ThroughConditionFilter} from '_ui/types';
import {isLinkAttribute} from '_ui/_utils/attributeType';
import {type AttributesById} from '../useTransformFilters';

export type ViewType = 'table' | 'list' | 'timeline' | 'mosaic';

export const FiltersActionTypes = {
    ADD_FILTER: 'ADD_FILTER',
    SET_FILTERS: 'SET_FILTERS',
    SET_FILTERS_AND_OPERATOR: 'SET_FILTERS_AND_OPERATOR',
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

interface IUIFiltersActionSetFilters {
    type: typeof FiltersActionTypes.SET_FILTERS;
    payload: UIFilter[];
}

interface IUIFiltersActionSetFiltersAndOperator {
    type: typeof FiltersActionTypes.SET_FILTERS_AND_OPERATOR;
    payload: {filters: UIFilter[]; filtersOperator: FiltersOperator};
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
    | IUIFiltersActionSetFilters
    | IUIFiltersActionSetFiltersAndOperator
    | IIUIFiltersActionResetFilter
    | IUIFiltersActionRemoveFilter
    | IUIFiltersActionChangeFilterConfig
    | IUIFiltersActionMoveFilter
    | IUIFiltersActionReset
    | IUIFiltersActionLoadView
    | IUIFiltersActionRestoreInitialViewSettings
    | IUIFiltersActionUpdateViewListAndCurrentView;

/**
 * Builds the THROUGH filter materialized when a "smart filter" attribute points through another
 * attribute (attribute.smartFilter.through). The filter targets `<through.id>.id`.
 */
const buildSmartFilterThroughFilter = (
    payload: IUIFiltersActionAddFilter['payload'],
    throughId: string,
): IUIFilterThrough => ({
    ...payload,
    field: Array.isArray(payload.field) ? payload.field[0] : payload.field,
    id: window.crypto.randomUUID(),
    condition: ThroughConditionFilter.THROUGH,
    subCondition: AttributeConditionFilter.EQUAL,
    subField: `${throughId}.id`,
    value: null,
});

const buildTreeFilter = (
    payload: IUIFiltersActionAddFilter['payload'],
    initialFilters: IUIFiltersState['initialFilters'],
): IUIFilterTree => {
    const filterWithDefaultValues = initialFilters.find(
        initialFilter => initialFilter.attribute.id === payload.attribute.id,
    );
    if (filterWithDefaultValues !== undefined && isUIFilterTree(filterWithDefaultValues)) {
        // TODO : include IS_EMPTY to permissions
        return {...filterWithDefaultValues, withEmptyValues: true};
    }
    const {format} = payload.attribute;
    const treeFilter = {
        ...payload,
        id: window.crypto.randomUUID(),
        field: Array.isArray(payload.field) ? payload.field : [payload.field],
        condition: format && hasOnlyNoValueConditions(format) ? null : treeFilterConditions[0],
        value: null,
    };
    return treeFilter;
};

const buildDefaultFilter = (
    payload: IUIFiltersActionAddFilter['payload'],
    {condition, hasValueList}: {condition: RecordFilterCondition | null; hasValueList?: boolean},
): UIFilter => {
    const newFilter = {
        ...payload,
        field: isLinkAttribute(payload.attribute.type)
            ? `${payload.field}.id`
            : Array.isArray(payload.field)
              ? payload.field[0]
              : payload.field,
        id: window.crypto.randomUUID(),
        condition,
        value: null,
        valuesList: hasValueList ? payload.attribute.valuesList : undefined,
    };
    return newFilter;
};

const addFilter: Reducer<IUIFiltersActionAddFilter> = (state, payload) => {
    const candidate = payload as UIFilter;

    const hasValueList = payload.attribute.valuesList?.enable;
    const isSmartFilter = isUIFilterWithSmartFilter(candidate);
    const {format} = payload.attribute;
    let condition: RecordFilterCondition | null =
        format == null || hasOnlyNoValueConditions(format) ? null : (conditionsByFormat[format][0] ?? null);
    if (hasValueList || isSmartFilter) {
        condition = AttributeConditionFilter.EQUAL;
    }

    // A smart filter pointing "through" another attribute is not added as a smart filter:
    // it is materialized as a THROUGH filter on that target attribute (and thus rendered by
    // LinkAttributeDropDown, not SmartFilterAttributeDropdown). See buildSmartFilterThroughFilter.
    const smartFilterThrough = isUIFilterWithSmartFilter(candidate)
        ? candidate.attribute.smartFilter?.through
        : undefined;

    let filterToAdd;
    if (smartFilterThrough) {
        filterToAdd = buildSmartFilterThroughFilter(payload, smartFilterThrough.id);
    } else if (isUIFilterTree(candidate)) {
        filterToAdd = buildTreeFilter(payload, state.initialFilters);
    } else {
        filterToAdd = buildDefaultFilter(payload, {condition, hasValueList});
    }

    return {
        ...state,
        filters: [...state.filters, filterToAdd],
    };
};

const setFilters: Reducer<IUIFiltersActionSetFilters> = (state, payload) => ({
    ...state,
    filters: payload,
});

const setFiltersAndOperator: Reducer<IUIFiltersActionSetFiltersAndOperator> = (state, payload) => ({
    ...state,
    filters: payload.filters,
    filtersOperator: payload.filtersOperator,
});

const resetFilter: Reducer<IIUIFiltersActionResetFilter> = (state, payload) => ({
    ...state,
    filters: state.filters.map(filter => {
        if (filter.id === payload.id) {
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
                    formattedValue: null,
                };
            }

            if (isUIFilterThrough(filter)) {
                return {
                    ...filter,
                    condition: ThroughConditionFilter.THROUGH,
                    value: null,
                    formattedValue: null,
                };
            }

            if (isUIFilterLink(filter)) {
                return {
                    ...filter,
                    condition: conditionsByFormat[AttributeFormat.text][0],
                    value: null,
                    formattedValue: null,
                };
            }

            if (isUIFilterTree(filter)) {
                // Reset-to-empty on a tree = "vidé mais reste épinglé": an EXPLICIT empty user selection
                // (`[]`, never null). `null` drops the tree from the lean projection and desyncs the spokes
                // (see useControlledFilterStore.projectLean / buildTreeInitial). In ViewV2 the primary reset
                // target is `initialFilters` (buildTreeInitial); this fallback only fires when no initial
                // filter matches, so it must follow the same convention.
                return {
                    ...filter,
                    condition: null,
                    value: [],
                    nodes: [],
                    userNodes: [],
                    userFormattedValue: [],
                    formattedValue: [],
                    withEmptyValues: false,
                    includeHiddenOptions: false,
                };
            }
        }
        return filter;
    }),
});

const removeFilter: Reducer<IUIFiltersActionRemoveFilter> = (state, payload) => ({
    ...state,
    filters: state.filters.filter(({id}) => id !== payload.id),
});

const changeFilterConfig: Reducer<IUIFiltersActionChangeFilterConfig> = (state, payload) => ({
    ...state,
    filters: state.filters.map(filter => {
        if (filter.id !== payload.id) {
            return filter;
        }
        if (isUIFilterTree(filter)) {
            // Deselecting every node keeps the filter PINNED but empty: represent it as an EXPLICIT empty
            // user selection (`userNodes: []`, never null). A null user selection reads as "not touched /
            // not yet resolved" and is dropped from the lean projection (useControlledFilterStore), so a
            // cleared tree could never propagate across spokes (volet ⇄ ExplorerV2 toolbar) — the other
            // surface kept a stale value or silently unpinned. The empty arrays survive the projection;
            // the records query still skips a tree with no record ids (prepareFiltersForRequest). The four
            // fields are normalised defensively so a stale user selection can't leak through.
            if (isUIFilterTree(payload) && Array.isArray(payload.value) && payload.value.length === 0) {
                return {
                    ...filter,
                    ...payload,
                    value: [],
                    nodes: [],
                    userNodes: [],
                    userFormattedValue: [],
                };
            }
            return {...filter, ...payload};
        }
        if (isUIFilterValueList(filter) && filter.condition && nullValueConditions.includes(filter.condition)) {
            return {...filter, ...payload, value: null};
        }
        return {...filter, ...payload};
    }),
});

const moveFilter: Reducer<IUIFiltersActionMoveFilter> = (state, payload) => {
    const attributesUsedToFilter = [...state.filters];
    const [filterToMove] = attributesUsedToFilter.splice(payload.indexFrom, 1);
    attributesUsedToFilter.splice(payload.indexTo, 0, filterToMove);
    return {
        ...state,
        filters: attributesUsedToFilter,
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
            case FiltersActionTypes.SET_FILTERS: {
                return setFilters(state, action.payload);
            }
            case FiltersActionTypes.SET_FILTERS_AND_OPERATOR: {
                return setFiltersAndOperator(state, action.payload);
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
