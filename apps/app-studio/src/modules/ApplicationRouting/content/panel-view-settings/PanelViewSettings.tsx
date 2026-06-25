import {type ReactNode, useEffect, useState} from 'react';
import {useIsAdminUser} from '../../../../config/user/useIsAdminUser';
import {DEFAULT_VIEW_SETTINGS_TAB_KEY} from '../../../../constants';
import {CurrentViewSection} from './current-view-section/CurrentViewSection';
import {PanelViewSettingsSidebar} from './panel-view-settings-sidebar/PanelViewSettingsSidebar';
import {VIEW_SETTINGS_TABS} from './tabs/_constantes';
import {type ViewSettingsTab} from '../../types';
import {TabCatalog} from './tabs/tab-catalog/TabCatalog';
import {TabDisplay} from './tabs/tab-display/TabDisplay';
import {TabFilters} from './tabs/TabFilters';
import {TabHeader} from './tabs/TabHeader';
import {TabSorts} from './tabs/tab-sorts/TabSorts';
import {root, rightColumn, tabContent} from './panelViewSettings.module.css';

export const PanelViewSettings = ({
    libraryId,
    currentTab,
    onClose,
}: {
    libraryId: string;
    currentTab?: ViewSettingsTab;
    onClose: () => void;
}) => {
    // Admin = membership in the administrators group (global), not a per-library permission.
    const canEditAdminView = useIsAdminUser();

    const [activeTab, setActiveTab] = useState<ViewSettingsTab>(currentTab ?? DEFAULT_VIEW_SETTINGS_TAB_KEY);

    useEffect(() => {
        if (currentTab) {
            setActiveTab(currentTab);
        }
    }, [currentTab]);

    const activeTabMeta = VIEW_SETTINGS_TABS.find(tab => tab.key === activeTab) ?? VIEW_SETTINGS_TABS[0];

    // Only an admin can curate the attributes available in the header gear, and only on tabs that host
    // that gear in the header (e.g. Sorts) rather than in a dedicated section (Display).
    const canEditAvailableAttributesInHeader =
        canEditAdminView &&
        [
            'sorts',
            /*'filters'*/
        ].includes(activeTab);

    const tabsContent: Record<ViewSettingsTab, ReactNode> = {
        display: <TabDisplay canEditAdminView={canEditAdminView} />,
        filters: <TabFilters canEditAdminView={canEditAdminView} />,
        sorts: <TabSorts />,
        catalog: <TabCatalog libraryId={libraryId} />,
    };

    return (
        <div className={root}>
            <PanelViewSettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <div className={rightColumn}>
                <CurrentViewSection onViewSettingsClose={onClose} canEditAdminView={canEditAdminView} />
                <TabHeader
                    tab={activeTabMeta}
                    canEditAvailableAttributesInHeader={canEditAvailableAttributesInHeader}
                />
                <div className={tabContent}>{tabsContent[activeTab]}</div>
            </div>
        </div>
    );
};
