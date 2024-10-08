// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import React, {Dispatch} from 'react';
import {IStandardFieldReducerState, StandardFieldReducerValueActions} from './standardFieldReducer';

export interface IStandardFieldReducerContext {
    state: IStandardFieldReducerState;
    dispatch: Dispatch<StandardFieldReducerValueActions>;
}

export const StandardFieldReducerContext = React.createContext<IStandardFieldReducerContext>({
    state: null,
    dispatch: null
});
