// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React,{Dispatch} from 'react';
import {IEditRecordReducerActions,initialState} from './editRecordModalReducer';

export const EditRecordModalReducerContext = React.createContext<{
    state: IEditRecordReducerState;
    dispatch: Dispatch<IEditRecordReducerActions>;
}

export const EditRecordModalReducerContext = React.createContext<IEditRecordModalReducerContext>({
    state: initialState,
    dispatch: () => initialState
});
