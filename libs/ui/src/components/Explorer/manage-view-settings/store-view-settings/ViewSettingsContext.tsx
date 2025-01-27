// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createContext, Dispatch} from 'react';
import {IViewSettingsAction, IViewSettingsState} from './viewSettingsReducer';

export const ViewSettingsContext = createContext<{
    view: IViewSettingsState;
    dispatch: Dispatch<IViewSettingsAction>;
}>({
    view: null as any,
    dispatch: () => {
        throw new Error('useViewSettingsContext must be used inside a <ViewSettingsContext.Provider />');
    }
});
