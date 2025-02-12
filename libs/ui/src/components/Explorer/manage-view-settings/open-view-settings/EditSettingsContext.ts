// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {createContext, ReactNode} from 'react';

interface IActiveSettings {
    content: ReactNode;
    title: string;
    onClickLeftButton?: () => void;
}

export type SettingsPanelPages = 'router-menu' | 'configure-display' | 'sort-items' | 'filter-items';

export interface IEditSettingsContext {
    setActiveSettings: (params: IActiveSettings) => void;
    activeSettings: null | IActiveSettings;
    panelElement: (() => Element | DocumentFragment) | null;
    closeSettingsPanel: () => void;
}

export const EditSettingsContext = createContext<IEditSettingsContext>({
    setActiveSettings: () => {
        throw new Error('Not implemented');
    },
    activeSettings: null,
    panelElement: null,
    closeSettingsPanel: () => {
        throw new Error('Element must be wrapped into EditSettingsContextProvider');
    }
});
