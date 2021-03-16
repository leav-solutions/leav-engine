// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt

import {
    ISharedSelected,
    SharedReducerActions,
    SharedReducerActionsTypes,
    SharedStateSelection,
    SharedStateSelectionType
} from './SharedStateReducer';

export const setSharedSelection = (selection: SharedStateSelection): SharedReducerActions => ({
    type: SharedReducerActionsTypes.SET_SELECTION,
    selection
});

export const resetSharedSelection = (): SharedReducerActions => ({
    type: SharedReducerActionsTypes.RESET_SELECTION
});

export const toggleSharedElementSelected = (
    selectionType: SharedStateSelectionType,
    elementSelected: ISharedSelected
): SharedReducerActions => ({
    type: SharedReducerActionsTypes.TOGGLE_ELEMENT_SELECTED,
    selectionType,
    elementSelected
});
