// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {SharedStateSelectionType} from 'hooks/SharedStateHook/SharedStateReducer';

export const mockSharedSelectedElement = {
    id: 'id',
    library: 'library'
};

export const mockSharedSearchSelection = {
    selected: [mockSharedSelectedElement, mockSharedSelectedElement],
    type: SharedStateSelectionType.recherche
};

export const mockSharedNavigationSelection = {
    selected: [mockSharedSelectedElement],
    type: SharedStateSelectionType.navigation
};

export const mockSharedNavigationSelectionWithNoSelected = {
    selected: [],
    type: SharedStateSelectionType.navigation
};
