// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createContext, useContext} from 'react';
import {IImportReducerState, ImportReducerAction, initialState} from './importReducer';

const ImportReducerContext = createContext<{
    state: IImportReducerState;
    dispatch: React.Dispatch<ImportReducerAction>;
}>({
    state: initialState,
    dispatch: () => initialState
});

export default ImportReducerContext;

export const useImportReducerContext = () => useContext(ImportReducerContext);
