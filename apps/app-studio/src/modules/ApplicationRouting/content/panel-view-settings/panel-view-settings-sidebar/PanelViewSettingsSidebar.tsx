import {useTranslation} from 'react-i18next';
import {KitButton, KitTooltip} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {VIEW_SETTINGS_TABS} from '../tabs/_constantes';
import {sidebar} from './panelViewSettingsSidebar.module.css';
import {type ViewSettingsTab} from '../../../types';

type PanelViewSettingsSidebarProps = {
    activeTab: ViewSettingsTab;
    onTabChange: (key: ViewSettingsTab) => void;
};

export const PanelViewSettingsSidebar = ({activeTab, onTabChange}: PanelViewSettingsSidebarProps) => {
    const {t} = useTranslation();

    return (
        <nav className={sidebar}>
            {VIEW_SETTINGS_TABS.map(({key, labelKey, icon}) => {
                const label = String(t(labelKey));
                return (
                    <KitTooltip key={key} title={label} placement="right">
                        <KitButton
                            type="secondary"
                            size="m"
                            active={key === activeTab}
                            aria-label={label}
                            aria-pressed={key === activeTab}
                            icon={<FontAwesomeIcon icon={icon} />}
                            onClick={() => onTabChange(key)}
                        />
                    </KitTooltip>
                );
            })}
        </nav>
    );
};
