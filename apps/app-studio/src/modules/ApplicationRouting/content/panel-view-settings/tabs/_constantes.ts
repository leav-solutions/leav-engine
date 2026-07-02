import {VIEW_SETTINGS_TABS as SHARED_VIEW_SETTINGS_TABS} from '@leav/ui';
import {type ViewSettingsTab} from '../../../types';
import {type ViewSettingsTabConfig} from './_types';

// Labels stay app-side: app-studio uses the `view_settings.tab.*` namespace (and `views` for catalog),
// whereas ExplorerV2's shortcut buttons use the `explorer.viewSettings.*` namespace.
const LABEL_KEY_BY_TAB: Record<ViewSettingsTab, string> = {
    catalog: 'view_settings.tab.views',
    display: 'view_settings.tab.display',
    filters: 'view_settings.tab.filters',
    sorts: 'view_settings.tab.sorts',
};

export const VIEW_SETTINGS_TABS: readonly ViewSettingsTabConfig[] = SHARED_VIEW_SETTINGS_TABS.map(({key, icon}) => ({
    key,
    icon,
    labelKey: LABEL_KEY_BY_TAB[key],
}));

// Tabs that host the admin "available attributes" gear in the shared TabHeader (rather than in a
// dedicated section like Display). Both Sorts and Filters use the nested (multi-level) gear.
export const EDIT_AVAILABLE_ATTRIBUTES_IN_HEADER_TABS: ViewSettingsTab[] = ['sorts', 'filters'];
