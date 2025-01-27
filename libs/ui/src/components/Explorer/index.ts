// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Explorer as InternalExplorer} from './Explorer';
import {useEditSettings, SidePanel, EditSettingsContextProvider} from './manage-view-settings';

type CompoundedComponent = typeof InternalExplorer & {
    useEditSettings: typeof useEditSettings;
    EditSettingsContextProvider: typeof EditSettingsContextProvider;
    SettingsSidePanel: typeof SidePanel;
};

export const Explorer = InternalExplorer as unknown as CompoundedComponent;
Explorer.EditSettingsContextProvider = EditSettingsContextProvider;
Explorer.useEditSettings = useEditSettings;
Explorer.SettingsSidePanel = SidePanel;
