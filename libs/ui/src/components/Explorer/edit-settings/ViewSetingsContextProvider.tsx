// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FunctionComponent, useReducer} from 'react';
import ViewSettingsReducer from './viewSettingsReducer';
import {ViewSettingsContext, viewSettingsInitialState} from './ViewSetingsContext';

export const ViewSettingsContextProvider: FunctionComponent = ({children}) => {
    const [state, dispatch] = useReducer(ViewSettingsReducer, viewSettingsInitialState);
    return <ViewSettingsContext.Provider value={{view: state, dispatch}}>{children}</ViewSettingsContext.Provider>;
};
