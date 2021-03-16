// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React from 'react';
import {sharedReducerInitialState} from './SharedReducerInitialState';
import {ISharedReducerState, SharedReducerActions} from './SharedStateReducer';

export const SharedStateContext = React.createContext<{
    stateShared: ISharedReducerState;
    dispatchShared: React.Dispatch<SharedReducerActions>;
}>({
    stateShared: sharedReducerInitialState,
    dispatchShared: null as any
});
