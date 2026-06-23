import {useTranslation} from 'react-i18next';
import cn from 'classnames';
import {KitButton, KitTooltip, KitTypography} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faThumbtack, faThumbtackSlash} from '@fortawesome/free-solid-svg-icons';
import {ViewV2Shortcut} from '../../../../../__generated__';
import {useCurrentView} from '../store-current-view/useCurrentView';
import {tabHeader, title, unpinnedIcon} from './tabHeader.module.css';
import {type ViewSettingsTabConfig} from './_types';

export const TabHeader = ({tab}: {tab: ViewSettingsTabConfig}) => {
    const {t} = useTranslation();
    const {shortcuts, toggleShortcut} = useCurrentView();

    const shortcut = tab.key as ViewV2Shortcut;
    const isPinned = shortcuts.includes(shortcut);
    // `display` is always pinned: it is the API default and the read-side fallback, so its pin cannot be removed.
    const isPinLocked = shortcut === ViewV2Shortcut.display;
    const pinLabel = String(t(isPinned ? 'view_settings.unpin' : 'view_settings.pin'));

    return (
        <header className={tabHeader}>
            <KitTypography.Text weight="bold" size="fontSize5" className={title}>
                {t(tab.labelKey)}
            </KitTypography.Text>
            {!isPinLocked && (
                <KitTooltip title={pinLabel}>
                    <KitButton
                        type="secondary"
                        size="m"
                        active={isPinned}
                        aria-label={pinLabel}
                        icon={
                            <FontAwesomeIcon
                                icon={isPinned ? faThumbtack : faThumbtackSlash}
                                className={cn({[unpinnedIcon]: !isPinned})}
                            />
                        }
                        onClick={() => toggleShortcut(shortcut)}
                    />
                </KitTooltip>
            )}
        </header>
    );
};
