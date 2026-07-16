import {useTranslation} from 'react-i18next';
import {KitBadge, KitButton, KitTooltip} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {sidebar} from './panelViewSettingsSidebar.module.css';
import {type ViewSettingsTabConfig} from '../tabs/_types';
import {type ViewSettingsTab} from '../../../types';

export const PanelViewSettingsSidebar = ({
    tabs,
    activeTab,
    onTabChange,
    tabsWithActiveValue = [],
}: {
    tabs: ViewSettingsTabConfig[];
    activeTab: ViewSettingsTab;
    onTabChange: (key: ViewSettingsTab) => void;
    tabsWithActiveValue?: ViewSettingsTab[];
}) => {
    const {t} = useTranslation();

    return (
        <nav className={sidebar}>
            {tabs.map(({key, labelKey, icon}) => {
                const label = String(t(labelKey));
                return (
                    <KitTooltip key={key} title={label} placement="right">
                        <KitBadge dot={tabsWithActiveValue.includes(key)} status="success" offset="m">
                            <KitButton
                                type="secondary"
                                size="m"
                                active={key === activeTab}
                                aria-label={label}
                                aria-pressed={key === activeTab}
                                icon={<FontAwesomeIcon icon={icon} />}
                                onClick={() => onTabChange(key)}
                            />
                        </KitBadge>
                    </KitTooltip>
                );
            })}
        </nav>
    );
};
