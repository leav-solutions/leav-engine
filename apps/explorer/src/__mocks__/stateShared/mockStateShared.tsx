// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {sharedReducerInitialState} from 'hooks/SharedStateHook/SharedReducerInitialState';
import {SharedStateContext} from 'hooks/SharedStateHook/SharedStateContext';
import {ISharedReducerState} from 'hooks/SharedStateHook/SharedStateReducer';
import React from 'react';

interface IMockStateSharedProps {
    children: React.ReactNode;
    stateShared?: Partial<ISharedReducerState>;
    dispatchShared?: any;
}

export const MockStateShared = ({children, stateShared, dispatchShared}: IMockStateSharedProps) => {
    let stateSharedValue: ISharedReducerState = sharedReducerInitialState;
    let dispatchSharedValue = jest.fn();

    if (stateShared) {
        stateSharedValue = {...stateSharedValue, ...stateShared} as any;
    }

    if (dispatchShared) {
        dispatchSharedValue = dispatchShared;
    }

    return (
        <SharedStateContext.Provider value={{stateShared: stateSharedValue, dispatchShared: dispatchSharedValue}}>
            {children}
        </SharedStateContext.Provider>
    );
};
