// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {Dispatch, useContext} from 'react';
import {TreesSelectionListAction, ITreesSelectionListState, initialState} from './treesSelectionListReducer';

export const TreesSelectionListStateContext = React.createContext<{
    state: ITreesSelectionListState;
    dispatch: Dispatch<TreesSelectionListAction>;
}>({state: initialState, dispatch: () => initialState});

export const useTreesSelectionListState = () => useContext(TreesSelectionListStateContext);
