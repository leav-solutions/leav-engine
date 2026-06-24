import {type ReactElement, useEffect, useState} from 'react';
import {type FeatureHook, type ViewSettingsShortcuts} from '../_types';
import {type IViewSettingsState} from './store-view-settings/viewSettingsReducer';
import {KitButton, KitTooltip} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {VIEW_SETTINGS_TABS} from '_ui/constants';
import {DEFAULT_VIEW_SHORTCUTS} from './store-view-settings/viewSettingsInitialState';

export const useOpenViewSettingsV2 = ({
    view,
    open,
    closeViewSettings,
    onViewSettingsShortcutClick,
    isEnabled = true,
}: FeatureHook<{
    view: IViewSettingsState;
    open: boolean;
    closeViewSettings?: () => void;
    onViewSettingsShortcutClick?: ({settingName, viewId}: {settingName: ViewSettingsShortcuts; viewId: string}) => void;
}>) => {
    const {t} = useSharedTranslation();
    const [viewSettingsShortcutsButtons, setViewSettingsShortcutsButtons] = useState<ReactElement[]>([]);

    useEffect(() => {
        if (isEnabled) {
            if (!open) {
                closeViewSettings?.();
            }
        }
    }, [isEnabled, open]);

    const labelByShortcut: Record<ViewSettingsShortcuts, string> = {
        catalog: String(t('explorer.viewSettings.catalog')),
        display: String(t('explorer.viewSettings.display')),
        filters: String(t('explorer.viewSettings.filters')),
        sorts: String(t('explorer.viewSettings.sorts')),
    };

    useEffect(() => {
        // VIEW_SETTINGS_TABS is the canonical order: the view's `shortcuts` list only decides which
        // shortcuts are shown, never their order — buttons always appear in this fixed sequence.
        const enabledTabs = VIEW_SETTINGS_TABS.filter(({key}) => view.shortcuts.includes(key));
        const tabsToDisplay =
            enabledTabs.length > 0
                ? enabledTabs
                : VIEW_SETTINGS_TABS.filter(({key}) => DEFAULT_VIEW_SHORTCUTS.includes(key));

        setViewSettingsShortcutsButtons(
            tabsToDisplay.map(({key, icon}) => (
                <KitTooltip key={key} title={labelByShortcut[key]}>
                    <KitButton
                        type="secondary"
                        size="m"
                        icon={<FontAwesomeIcon icon={icon} />}
                        aria-label={labelByShortcut[key]}
                        onClick={() => onViewSettingsShortcutClick?.({settingName: key, viewId: view.viewId!})}
                    />
                </KitTooltip>
            )),
        );
    }, [view.viewId, view.shortcuts]);

    return {viewSettingsShortcutsButtons: isEnabled ? viewSettingsShortcutsButtons : null};
};
