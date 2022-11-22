// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ISelectionState} from 'redux/stateType';
import {SharedStateSelectionType} from '_types/types';

export function isAllSelected(selectionState: ISelectionState, selectionMode: boolean): boolean {
    return selectionMode
        ? selectionState.searchSelection.type === SharedStateSelectionType.search &&
              selectionState.searchSelection.allSelected
        : selectionState.selection.type === SharedStateSelectionType.search && selectionState.selection.allSelected;
}

export function isSelected(
    selectionState: ISelectionState,
    selectionMode: boolean,
    recordId: string,
    libraryId: string
): boolean {
    const selectionToCheck = selectionMode ? selectionState.searchSelection : selectionState.selection;

    return (
        selectionToCheck.type === SharedStateSelectionType.search &&
        !!selectionToCheck.selected.find(e => e.id === recordId && e.library === libraryId)
    );
}
