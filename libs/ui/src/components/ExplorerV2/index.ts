import {ExplorerV2 as InternalExplorer} from './Explorer';
import {useEditSettings, SidePanel, EditSettingsContextProvider} from './manage-view-settings';

type CompoundedComponent = typeof InternalExplorer & {
    useEditSettings: typeof useEditSettings;
    EditSettingsContextProvider: typeof EditSettingsContextProvider;
    SettingsSidePanel: typeof SidePanel;
};

// TODO: To rename to `Explorer` later
export const ExplorerV2 = InternalExplorer as unknown as CompoundedComponent;
ExplorerV2.EditSettingsContextProvider = EditSettingsContextProvider;
ExplorerV2.useEditSettings = useEditSettings;
ExplorerV2.SettingsSidePanel = SidePanel;
