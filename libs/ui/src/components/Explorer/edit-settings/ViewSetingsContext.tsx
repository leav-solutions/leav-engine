// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createContext, Dispatch} from 'react';
import {IViewSettingsState, ViewSettingsAction} from './viewSettingsReducer';

export const ViewSettingsInitialState: IViewSettingsState = {
    displayMode: 'table',
    fields: []
};

export const ViewSettingsContext = createContext<{
    view: IViewSettingsState;
    dispatch: Dispatch<ViewSettingsAction>;
}>({view: ViewSettingsInitialState, dispatch: () => ViewSettingsInitialState});
