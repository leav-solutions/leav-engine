import {faArrowDownWideShort, faBookmark, faFilter, faList} from '@fortawesome/free-solid-svg-icons';
import {type ViewSettingsTabConfig} from './_types';

export const VIEW_SETTINGS_TABS: readonly ViewSettingsTabConfig[] = [
    {key: 'display', labelKey: 'view_settings.tab.display', icon: faList},
    {key: 'filters', labelKey: 'view_settings.tab.filters', icon: faFilter},
    {key: 'sorts', labelKey: 'view_settings.tab.sorts', icon: faArrowDownWideShort},
    {key: 'catalog', labelKey: 'view_settings.tab.views', icon: faBookmark},
];
