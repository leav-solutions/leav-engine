import {SelectionChanged, EditRecordClick} from './Navigator';
import {GET_LIBRARIES_libraries_list, GET_LIBRARIES_libraries_list_attributes} from '../../_gqlTypes/GET_LIBRARIES';
import {IGenericValue} from '../../_types/records';
import {RecordIdentity_whoAmI} from '../../_gqlTypes/RecordIdentity';

type RecordData = {
    [attributeName: string]: IGenericValue | IGenericValue[];
} & {
    id: string;
    whoAmI: RecordIdentity_whoAmI;
};
export interface IReducerState {
    restrictToRoots: string[];
    selectable: boolean;
    onSelectionChanged: null | SelectionChanged;
    onEditRecordClick: EditRecordClick | null;
    multipleSelection: boolean;
    selection: RecordIdentity_whoAmI[];
    selectedRoot: string | null;
    rootsList: GET_LIBRARIES_libraries_list[];
    selectedRootLabel: string | null;
    selectedRootQuery: string | null;
    selectedRootFilter: string | null;
    selectedRootAttributes: GET_LIBRARIES_libraries_list_attributes[];
    lang: string[];
    filters: IFilter[];
    showFilters: boolean;
    list: RecordData[];
    execSearch: boolean;
}
export interface IFilter {
    attribute: string;
    value: string;
    operator: string;
}
export interface IReducerAction {
    type: ActionTypes;
    data?: any;
}
export enum ActionTypes {
    INIT_STATE = 'INIT_STATE',
    SET_RESTRICT_ROOTS = 'SET_RESTRICT_TO_ROOTS',
    SET_SELECTED_ROOT = 'SET_SELECTED_ROOT',
    SET_ROOTS = 'SET_ROOTS',
    SET_ROOT_INFOS = 'SET_ROOT_INFOS',
    SET_FILTERS = 'SET_FILTERS',
    TOGGLE_FILTERS = 'TOGGLE_FILTERS',
    SET_LIST = 'SET_LIST',
    FILTER_REMOVE = 'FILTER_REMOVE',
    SELECTION_ADD = 'SELECTION_ADD',
    SELECTION_REMOVE = 'SELECTION_REMOVE'
}

export const initialState = {
    restrictToRoots: [],
    selectable: false,
    onSelectionChanged: null,
    onEditRecordClick: null,
    multipleSelection: false,
    selection: [],
    selectedRoot: null,
    selectedRootLabel: null,
    selectedRootQuery: null,
    selectedRootFilter: null,
    selectedRootAttributes: [],
    rootsList: [],
    lang: ['fr'],
    filters: [],
    showFilters: false,
    list: [],
    execSearch: true
};

const reducer = (state: IReducerState, action: IReducerAction): IReducerState => {
    switch (action.type) {
        case ActionTypes.INIT_STATE:
            return {
                ...state,
                restrictToRoots: action.data.restrictToRoots,
                selectedRoot: action.data.restrictToRoots.length === 1 ? action.data.restrictToRoots[0] : null,
                onSelectionChanged: action.data.onSelectionChanged,
                multipleSelection: action.data.multipleSelection,
                selectable: action.data.selectable
            };
        case ActionTypes.SET_RESTRICT_ROOTS:
            return {
                ...state,
                restrictToRoots: action.data,
                selectedRoot: action.data.length === 1 ? action.data[0] : null
            };
        case ActionTypes.SET_SELECTED_ROOT:
            return {
                ...state,
                selectedRoot: action.data,
                selectedRootQuery: null,
                selectedRootAttributes: [],
                list: [],
                filters: [],
                execSearch: true
            };
        case ActionTypes.SET_ROOTS:
            return {
                ...state,
                rootsList: action.data
            };
        case ActionTypes.SET_ROOT_INFOS:
            return {
                ...state,
                selectedRootLabel: action.data.label,
                selectedRootQuery: action.data.query,
                selectedRootFilter: action.data.filter,
                selectedRootAttributes: action.data.attributes
            };
        case ActionTypes.SET_FILTERS:
            return {
                ...state,
                filters: action.data,
                list: [],
                showFilters: false,
                execSearch: true
            };
        case ActionTypes.FILTER_REMOVE:
            return {
                ...state,
                filters: state.filters.filter((f, i) => i !== action.data),
                execSearch: true
            };
        case ActionTypes.TOGGLE_FILTERS:
            return {
                ...state,
                showFilters: !state.showFilters
            };
        case ActionTypes.SET_LIST:
            return {
                ...state,
                list: action.data,
                execSearch: false
            };
        case ActionTypes.SELECTION_ADD:
            const addedSelection = state.multipleSelection
                ? Array.from(new Set(state.selection).add(action.data))
                : [action.data];
            const callbackAdd = state.onSelectionChanged;
            if (callbackAdd !== null) {
                setImmediate(() => callbackAdd(addedSelection));
            }
            return {
                ...state,
                selection: addedSelection
            };
        case ActionTypes.SELECTION_REMOVE:
            const substractedSelection = state.selection.filter(e => e.id !== action.data.id);
            const callbackRemove = state.onSelectionChanged;
            if (callbackRemove !== null) {
                setImmediate(() => callbackRemove(substractedSelection));
            }
            return {
                ...state,
                selection: substractedSelection
            };
        default:
            return state;
    }
};

export default reducer;
