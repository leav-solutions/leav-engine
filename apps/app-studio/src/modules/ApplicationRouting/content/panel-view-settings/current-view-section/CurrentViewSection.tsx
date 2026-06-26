import {useTranslation} from 'react-i18next';
import {KitButton, KitTooltip, KitTypography} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faXmark} from '@fortawesome/free-solid-svg-icons';
import {useCurrentView} from '../store-current-view/useCurrentView';
import {CurrentViewLabel} from './CurrentViewLabel';
import {CurrentViewActions} from './CurrentViewActions';
import {header, currentView} from './currentViewSection.module.css';

/**
 * Persistent header of the view-settings panel. Shows the current view and lets the user act on it
 * (rename, save, save as, share, reset) regardless of the open tab.
 */
export const CurrentViewSection = ({onViewSettingsClose}: {onViewSettingsClose: () => void}) => {
    const {t} = useTranslation();
    const {view, isEmptyView} = useCurrentView();

    if (!view && !isEmptyView) {
        return null;
    }

    return (
        <section className={currentView}>
            <header className={header}>
                <KitTypography.Text weight="bold" size="fontSize5">
                    {t('view_settings.current_view.title')}
                </KitTypography.Text>
                <KitTooltip title={String(t('view_settings.current_view.close'))}>
                    <KitButton
                        type="secondary"
                        size="m"
                        aria-label={String(t('view_settings.current_view.close'))}
                        icon={<FontAwesomeIcon icon={faXmark} />}
                        onClick={onViewSettingsClose}
                    />
                </KitTooltip>
            </header>
            <CurrentViewLabel />
            <CurrentViewActions />
        </section>
    );
};
