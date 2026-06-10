import {type ReactNode, useEffect, useState} from 'react';
import {useGetPermissionEditViewOnLibraryQuery} from '../../../../__generated__';
import {DEFAULT_VIEW_SETTINGS_TAB_KEY} from '../../../../constants';
import {CurrentViewSection} from './current-view-section/CurrentViewSection';
import {PanelViewSettingsSidebar} from './panel-view-settings-sidebar/PanelViewSettingsSidebar';
import {VIEW_SETTINGS_TABS} from './tabs/_constantes';
import {type ViewSettingsTab} from '../../types';
import {TabCatalog} from './tabs/TabCatalog';
import {TabDisplay} from './tabs/TabDisplay';
import {TabFilters} from './tabs/TabFilters';
import {TabHeader} from './tabs/TabHeader';
import {TabSorts} from './tabs/TabSorts';
import styles from './panelViewSettings.module.css';

export const PanelViewSettings = ({
    libraryId,
    currentTab,
    currentViewId,
    onClose,
}: {
    libraryId: string;
    currentTab?: ViewSettingsTab;
    currentViewId: string;
    onClose: () => void;
}) => {
    const {data} = useGetPermissionEditViewOnLibraryQuery({
        variables: {libraryId},
    });

    const canEditAdminView =
        data?.libraries.list?.find(({id}) => id === libraryId)?.permissions?.admin_library ?? false;

    const [activeTab, setActiveTab] = useState<ViewSettingsTab>(currentTab ?? DEFAULT_VIEW_SETTINGS_TAB_KEY);

    useEffect(() => {
        if (currentTab) {
            setActiveTab(currentTab);
        }
    }, [currentTab]);

    const activeTabMeta = VIEW_SETTINGS_TABS.find(tab => tab.key === activeTab) ?? VIEW_SETTINGS_TABS[0];

    const tabContent: Record<ViewSettingsTab, ReactNode> = {
        display: <TabDisplay canEditAdminView={canEditAdminView} />,
        filters: <TabFilters canEditAdminView={canEditAdminView} />,
        sorts: <TabSorts canEditAdminView={canEditAdminView} />,
        catalog: <TabCatalog viewId={currentViewId} libraryId={libraryId} />,
    };

    return (
        <div className={styles.root}>
            <PanelViewSettingsSidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <div className={styles.rightColumn}>
                <CurrentViewSection onViewSettingsClose={onClose} currentViewId={currentViewId} />
                <TabHeader tab={activeTabMeta} />
                <div className={styles.tabContent}>{tabContent[activeTab]}</div>
            </div>
        </div>
    );
};
