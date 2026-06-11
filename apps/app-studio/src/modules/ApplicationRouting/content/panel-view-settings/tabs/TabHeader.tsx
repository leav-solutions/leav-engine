import {useTranslation} from 'react-i18next';
import {KitButton, KitTooltip, KitTypography} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faThumbtackSlash} from '@fortawesome/free-solid-svg-icons';
import {tabHeader, title} from './tabHeader.module.css';
import {type ViewSettingsTabConfig} from './_types';

/**
 * TODO:
 * - bidirectional shortcut — toggle pin state on the view, dispatch to Explorer/iframe via targetPanelId
 */
export const TabHeader = ({tab}: {tab: ViewSettingsTabConfig}) => {
    const {t} = useTranslation();

    return (
        <header className={tabHeader}>
            <KitTypography.Text weight="bold" size="fontSize5" className={title}>
                {t(tab.labelKey)}
            </KitTypography.Text>
            <KitTooltip title={String(t('view_settings.pin'))}>
                <KitButton
                    type="secondary"
                    size="m"
                    disabled
                    aria-label={String(t('view_settings.pin'))}
                    icon={<FontAwesomeIcon icon={faThumbtackSlash} />}
                />
            </KitTooltip>
        </header>
    );
};
