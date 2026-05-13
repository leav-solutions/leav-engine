import {createContext, useContext} from 'react';
import {type IImportReducerState, type ImportReducerAction, initialState} from './importReducer';

const ImportReducerContext = createContext<{
    state: IImportReducerState;
    dispatch: React.Dispatch<ImportReducerAction>;
}>({
    state: initialState,
    dispatch: () => initialState,
});

export default ImportReducerContext;

export const useImportReducerContext = () => useContext(ImportReducerContext);
