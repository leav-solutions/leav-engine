// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {IToggleSelection, SharedStateSelection, SharedStateSelectionType} from '_types/types';

export const toggleInSelection = (selection: SharedStateSelection, payload: IToggleSelection): SharedStateSelection => {
    const isSelected = selection.selected.find(
        elementSelected =>
            elementSelected.id === payload.elementSelected.id &&
            elementSelected.library === payload.elementSelected.library
    );

    if (isSelected) {
        if (payload.selectionType === SharedStateSelectionType.navigation) {
            return {
                parent: payload.parent,
                type: payload.selectionType,
                selected: selection.selected.filter(
                    elementSelected =>
                        elementSelected.id !== payload.elementSelected.id ||
                        elementSelected.library !== payload.elementSelected.library
                )
            };
        } else if (payload.selectionType === SharedStateSelectionType.search) {
            return {
                allSelected: false,
                type: payload.selectionType,
                selected: selection.selected.filter(
                    elementSelected =>
                        elementSelected.id !== payload.elementSelected.id ||
                        elementSelected.library !== payload.elementSelected.library
                )
            };
        }
    }
    if (payload.selectionType === SharedStateSelectionType.navigation) {
        return {
            parent: payload.parent,
            type: payload.selectionType,
            selected: [...selection.selected, payload.elementSelected]
        };
    } else if (payload.selectionType === SharedStateSelectionType.search) {
        return {
            allSelected: false,
            type: payload.selectionType,
            selected: [...selection.selected, payload.elementSelected]
        };
    }

    return selection;
};
