// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ISharedSelected, type SharedStateSelection, SharedStateSelectionType} from '_types/types';

export const mockSelection = {
    type: SharedStateSelectionType.SEARCH,
    selected: []
};

export const mockSharedSelectedElement: ISharedSelected = {
    id: 'id',
    library: 'library',
    label: 'label'
};

export const mockSharedSearchSelection: SharedStateSelection = {
    selected: [mockSharedSelectedElement, mockSharedSelectedElement],
    type: SharedStateSelectionType.SEARCH
};

export const mockSharedNavigationSelection: SharedStateSelection = {
    selected: [mockSharedSelectedElement],
    type: SharedStateSelectionType.NAVIGATION,
    parent: '12345'
};

export const mockSharedNavigationSelectionWithNoSelected: SharedStateSelection = {
    selected: [],
    type: SharedStateSelectionType.NAVIGATION,
    parent: '12345'
};
