// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {TreeElementInput} from '_gqlTypes/globalTypes';

export enum SharedReducerActionsTypes {
    SET_SELECTION = 'SET_SELECTION',
    RESET_SELECTION = 'RESET_SELECTION',
    SET_SEARCH_ALL_SELECTED = 'SET_SEARCH_ALL_SELECTED',
    TOGGLE_ELEMENT_SELECTED = 'TOGGLE_ELEMENT_SELECTED'
}

export enum SharedStateSelectionType {
    navigation,
    search
}

export interface ISharedSelected {
    id: string;
    library: string;
    label: string;
}

export type SharedStateSelection =
    | {
          type: SharedStateSelectionType.search;
          selected: ISharedSelected[];
          allSelected?: boolean;
      }
    | {
          type: SharedStateSelectionType.navigation;
          selected: ISharedSelected[];
          parent: TreeElementInput;
      };

export interface ISharedReducerState {
    selection: SharedStateSelection;
}

export type SharedReducerActions =
    | {
          type: SharedReducerActionsTypes.SET_SELECTION;
          selection: SharedStateSelection;
      }
    | {
          type: SharedReducerActionsTypes.RESET_SELECTION;
      }
    | {
          type: SharedReducerActionsTypes.SET_SEARCH_ALL_SELECTED;
          allSelected: boolean;
      }
    | {
          type: SharedReducerActionsTypes.TOGGLE_ELEMENT_SELECTED;
          selectionType: SharedStateSelectionType;
          elementSelected: ISharedSelected;
          parent?: TreeElementInput;
      };

export const sharedStateReducer = (state: ISharedReducerState, action: SharedReducerActions): ISharedReducerState => {
    switch (action.type) {
        case SharedReducerActionsTypes.SET_SELECTION:
            return {...state, selection: action.selection};
        case SharedReducerActionsTypes.RESET_SELECTION:
            if (state.selection.type === SharedStateSelectionType.search) {
                return {...state, selection: {...state.selection, selected: [], allSelected: null}};
            }
            return {...state, selection: {...state.selection, selected: []}};
        case SharedReducerActionsTypes.SET_SEARCH_ALL_SELECTED:
            if (state.selection.type === SharedStateSelectionType.search) {
                return {...state, selection: {...state.selection, allSelected: action.allSelected}};
            }
            return state;
        case SharedReducerActionsTypes.TOGGLE_ELEMENT_SELECTED:
            const isSelected = state.selection.selected.some(
                elementSelected =>
                    elementSelected.id === action.elementSelected.id &&
                    elementSelected.library === action.elementSelected.library
            );

            if (isSelected) {
                if (action.selectionType === SharedStateSelectionType.navigation) {
                    return {
                        ...state,
                        selection: {
                            parent: action.parent,
                            type: action.selectionType,
                            selected: state.selection.selected.filter(
                                elementSelected =>
                                    elementSelected.id !== action.elementSelected.id &&
                                    elementSelected.library !== action.elementSelected.library
                            )
                        }
                    };
                } else if (action.selectionType === SharedStateSelectionType.search) {
                    return {
                        ...state,
                        selection: {
                            allSelected: false,
                            type: action.selectionType,
                            selected: state.selection.selected.filter(
                                elementSelected =>
                                    elementSelected.id !== action.elementSelected.id &&
                                    elementSelected.library !== action.elementSelected.library
                            )
                        }
                    };
                }
            }
            if (action.selectionType === SharedStateSelectionType.navigation) {
                return {
                    ...state,
                    selection: {
                        parent: action.parent,
                        type: action.selectionType,
                        selected: [...state.selection.selected, action.elementSelected]
                    }
                };
            } else if (action.selectionType === SharedStateSelectionType.search) {
                return {
                    ...state,
                    selection: {
                        allSelected: false,
                        type: action.selectionType,
                        selected: [...state.selection.selected, action.elementSelected]
                    }
                };
            }
        default:
            return state;
    }
};
