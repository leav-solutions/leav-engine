// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

export enum SharedReducerActionsTypes {
    SET_SELECTION = 'SET_SELECTION',
    RESET_SELECTION = 'RESET_SELECTION',
    SET_SEARCH_ALL_SELECTED = 'SET_SEARCH_ALL_SELECTED',
    TOGGLE_ELEMENT_SELECTED = 'TOGGLE_ELEMENT_SELECTED'
}

export enum SharedStateSelectionType {
    navigation,
    recherche
}

export interface ISharedSelected {
    id: string;
    library: string;
}

export type SharedStateSelection =
    | {
          type: SharedStateSelectionType.recherche;
          selected: ISharedSelected[];
          allSelected?: boolean;
      }
    | {
          type: SharedStateSelectionType.navigation;
          selected: ISharedSelected[];
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
      };

export const sharedStateReducer = (state: ISharedReducerState, action: SharedReducerActions): ISharedReducerState => {
    switch (action.type) {
        case SharedReducerActionsTypes.SET_SELECTION:
            return {...state, selection: action.selection};
        case SharedReducerActionsTypes.RESET_SELECTION:
            if (state.selection.type === SharedStateSelectionType.recherche) {
                return {...state, selection: {...state.selection, selected: [], allSelected: null}};
            }
            return {...state, selection: {...state.selection, selected: []}};
        case SharedReducerActionsTypes.SET_SEARCH_ALL_SELECTED:
            if (state.selection.type === SharedStateSelectionType.recherche) {
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
                return {
                    ...state,
                    selection: {
                        ...state.selection,
                        type: action.selectionType,
                        selected: state.selection.selected.filter(
                            elementSelected =>
                                elementSelected.id !== action.elementSelected.id &&
                                elementSelected.library !== action.elementSelected.library
                        )
                    }
                };
            }
            return {
                ...state,
                selection: {
                    ...state.selection,
                    type: action.selectionType,
                    selected: [...state.selection.selected, action.elementSelected]
                }
            };
        default:
            return state;
    }
};
