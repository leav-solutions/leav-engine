// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
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
