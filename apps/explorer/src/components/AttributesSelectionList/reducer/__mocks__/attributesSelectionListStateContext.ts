// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {mockSelectedAttributeA} from '../../../../__mocks__/common/attribute';
import {initialState} from '../attributesSelectionListReducer';

export const useAttributesSelectionListState = () => ({
    state: {...initialState, selectedAttributes: [mockSelectedAttributeA]},
    dispatch: jest.fn()
});
