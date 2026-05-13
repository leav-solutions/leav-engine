import React, {type Dispatch} from 'react';
import {type IEditRecordReducerActions, type IEditRecordReducerState, initialState} from './editRecordReducer';

export interface IEditRecordReducerContext {
    state: IEditRecordReducerState;
    dispatch: Dispatch<IEditRecordReducerActions>;
}

export const EditRecordReducerContext = React.createContext<IEditRecordReducerContext>({
    state: initialState,
    dispatch: () => initialState,
});
