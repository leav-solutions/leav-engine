import {type ReactNode, useEffect, useState} from 'react';
import cn from 'classnames';
import {DEFAULT_VIEW_SETTINGS_TAB_KEY} from '../../../../constants';
import {CurrentViewSection} from './current-view-section/CurrentViewSection';
import {PanelViewSettingsSidebar} from './panel-view-settings-sidebar/PanelViewSettingsSidebar';
import {useCurrentView} from './store-current-view/useCurrentView';
import {VIEW_SETTINGS_TABS} from './tabs/_constantes';
import {type ViewSettingsTab} from '../../types';
import {TabCatalog} from './tabs/tab-catalog/TabCatalog';
import {TabDisplay} from './tabs/tab-display/TabDisplay';
import {useDelegatedDisplayIframeSource} from './tabs/tab-display/useDelegatedDisplayIframeSource';
import {TabFilters} from './tabs/tab-filters/TabFilters';
import {TabHeader} from './tabs/TabHeader';
import {TabSorts} from './tabs/tab-sorts/TabSorts';
import {root, rightColumn, tabContent, tabContentNoPadding} from './panelViewSettings.module.css';

export const PanelViewSettings = ({
    libraryId,
    currentTab,
    hiddenTabs,
    onClose,
}: {
    libraryId: string;
    currentTab?: ViewSettingsTab;
    hiddenTabs?: ViewSettingsTab[];
    onClose: () => void;
}) => {
    // Single source of truth for the visible tab rail (sidebar + default-tab guard below).
    const visibleTabs = VIEW_SETTINGS_TABS.filter(({key}) => !hiddenTabs?.includes(key));

    // Green-dot indicator on the sidebar tabs:
    // - "sorts" is active as soon as at least one sort is activated (an unactivated sort is
    //   configured but not applied, cf. viewV2ToSerializedView.ts), so an all-deactivated view has
    //   no active sort even though `sorts` itself is non-empty.
    // - "filters" is active as soon as at least one filter (pinned or unpinned — the volet gives
    //   access to the whole facette) actually carries a value: a filter merely made "available" by the
    //   admin gear is seeded with an empty condition (cf. SET_AVAILABLE_FILTERS) and shouldn't count.
    const {view, activatedSorts} = useCurrentView();
    const hasActiveFilterValue = (view?.filters ?? []).some(
        filter => filter.values.length > 0 || Boolean(filter.withEmptyValues),
    );
    const tabsWithActiveValue: ViewSettingsTab[] = [
        ...(hasActiveFilterValue ? (['filters'] as const) : []),
        ...(activatedSorts.length > 0 ? (['sorts'] as const) : []),
    ];

    // Keep the active tab out of the hidden set: fall back to the first visible tab whenever the
    // resolved tab is masked, so an opener that hides the default tab never lands on it.
    const resolveVisibleTab = (tab: ViewSettingsTab): ViewSettingsTab =>
        hiddenTabs?.includes(tab) ? (visibleTabs[0]?.key ?? tab) : tab;

    const [activeTab, setActiveTab] = useState<ViewSettingsTab>(
        resolveVisibleTab(currentTab ?? DEFAULT_VIEW_SETTINGS_TAB_KEY),
    );

    useEffect(() => {
        if (currentTab) {
            setActiveTab(resolveVisibleTab(currentTab));
        }
    }, [currentTab]);

    const activeTabMeta = visibleTabs.find(tab => tab.key === activeTab) ?? visibleTabs[0] ?? VIEW_SETTINGS_TABS[0];

    // The Display tab of a custom panel is delegated to a full-bleed iframe: strip the tab content
    // padding so it fills edge to edge (see TabDisplay). Other tabs keep the default padding.
    const delegatedDisplayIframeSource = useDelegatedDisplayIframeSource();
    const isDisplayDelegatedToIframe = activeTab === 'display' && Boolean(delegatedDisplayIframeSource);

    const tabsContent: Record<ViewSettingsTab, ReactNode> = {
        display: <TabDisplay />,
        filters: <TabFilters />,
        sorts: <TabSorts />,
        catalog: <TabCatalog libraryId={libraryId} />,
    };

    return (
        <div className={root}>
            <PanelViewSettingsSidebar
                tabs={visibleTabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                tabsWithActiveValue={tabsWithActiveValue}
            />
            <div className={rightColumn}>
                <CurrentViewSection onViewSettingsClose={onClose} />
                <TabHeader tab={activeTabMeta} />
                <div className={cn(tabContent, {[tabContentNoPadding]: isDisplayDelegatedToIframe})}>
                    {tabsContent[activeTab]}
                </div>
            </div>
        </div>
    );
};
