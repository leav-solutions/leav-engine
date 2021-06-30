// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockTree} from '../../../../__mocks__/common/tree';
import {initialState} from '../treesSelectionListReducer';

export const useTreesSelectionListState = () => ({
    state: {...initialState, selectedTrees: [mockTree]},
    dispatch: jest.fn()
});
