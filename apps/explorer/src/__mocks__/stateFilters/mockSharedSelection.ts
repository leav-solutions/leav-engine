// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {
    ISharedSelected,
    SharedStateSelection,
    SharedStateSelectionType
} from 'hooks/SharedStateHook/SharedStateReducer';
import {mockNavigationPath} from '__mocks__/Navigation/mockTreeElements';

export const mockSharedSelectedElement: ISharedSelected = {
    id: 'id',
    library: 'library',
    label: 'label'
};

export const mockSharedSearchSelection: SharedStateSelection = {
    selected: [mockSharedSelectedElement, mockSharedSelectedElement],
    type: SharedStateSelectionType.search
};

export const mockSharedNavigationSelection: SharedStateSelection = {
    selected: [mockSharedSelectedElement],
    type: SharedStateSelectionType.navigation,
    parent: mockNavigationPath
};

export const mockSharedNavigationSelectionWithNoSelected: SharedStateSelection = {
    selected: [],
    type: SharedStateSelectionType.navigation,
    parent: mockNavigationPath
};
