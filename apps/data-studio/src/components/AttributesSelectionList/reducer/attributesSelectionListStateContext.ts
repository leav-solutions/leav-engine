// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {Dispatch, useContext} from 'react';
import {
    AttributesSelectionListAction,
    IAttributesSelectionListState,
    initialState
} from './attributesSelectionListReducer';

export const AttributesSelectionListStateContext = React.createContext<{
    state: IAttributesSelectionListState;
    dispatch: Dispatch<AttributesSelectionListAction>;
}>({state: initialState, dispatch: () => initialState});

export const useAttributesSelectionListState = () => useContext(AttributesSelectionListStateContext);
