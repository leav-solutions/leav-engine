// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {Dispatch} from 'react';
import {IEditRecordReducerActions, IEditRecordReducerState, initialState} from './editRecordReducer';

export interface IEditRecordReducerContext {
    state: IEditRecordReducerState;
    dispatch: Dispatch<IEditRecordReducerActions>;
}

export const EditRecordReducerContext = React.createContext<IEditRecordReducerContext>({
    state: initialState,
    dispatch: () => initialState
});