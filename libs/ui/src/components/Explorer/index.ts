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
