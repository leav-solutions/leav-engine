import {useEffect, useMemo} from 'react';
import {type FeatureHook, type ViewSettingsShortcuts} from '../_types';
import {type IViewSettingsState} from './store-view-settings/viewSettingsReducer';
import {KitBadge, KitButton, KitTooltip} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {VIEW_SETTINGS_TABS} from '_ui/constants';
import {DEFAULT_VIEW_SHORTCUTS} from './store-view-settings/viewSettingsInitialState';

export const useOpenViewSettingsV2 = ({
    view,
    showFilters,
    showSorts,
    hasActiveFilters,
    open,
    closeViewSettings,
    onViewSettingsShortcutClick,
    isEnabled = true,
}: FeatureHook<{
    view: IViewSettingsState;
    showFilters: boolean;
    showSorts: boolean;
    hasActiveFilters: boolean;
    open: boolean;
    closeViewSettings?: () => void;
    onViewSettingsShortcutClick?: ({settingName, viewId}: {settingName: ViewSettingsShortcuts; viewId: string}) => void;
}>) => {
    const {t} = useSharedTranslation();

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

    const viewSettingsShortcutsButtons = useMemo(() => {
        // VIEW_SETTINGS_TABS is the canonical order: the view's `shortcuts` list only decides which
        // shortcuts are shown, never their order — buttons always appear in this fixed sequence.
        const enabledTabs = VIEW_SETTINGS_TABS.filter(({key}) => view.shortcuts.includes(key));
        const effectiveShortcuts = enabledTabs.length > 0 ? enabledTabs.map(({key}) => key) : DEFAULT_VIEW_SHORTCUTS;

        // A tab not already in the view's shortcuts is still shown, without changing the shortcuts
        // themselves, when it has an active value (a filter/sort the user would otherwise lose easy
        // access to). The green dot reflects that same active state regardless of why the button
        // is shown (configured shortcut or forced).
        const hasActiveValueByKey: Partial<Record<ViewSettingsShortcuts, boolean>> = {
            filters: showFilters && hasActiveFilters,
            sorts: showSorts && view.sort.length > 0,
        };

        const tabsToDisplay = VIEW_SETTINGS_TABS.filter(
            ({key}) => effectiveShortcuts.includes(key) || hasActiveValueByKey[key],
        );

        return tabsToDisplay.map(({key, icon}) => (
            <KitTooltip key={key} title={labelByShortcut[key]}>
                <KitBadge dot={Boolean(hasActiveValueByKey[key])} status="success" offset="m">
                    <KitButton
                        type="secondary"
                        size="m"
                        icon={<FontAwesomeIcon icon={icon} />}
                        aria-label={labelByShortcut[key]}
                        onClick={() => onViewSettingsShortcutClick?.({settingName: key, viewId: view.viewId!})}
                    />
                </KitBadge>
            </KitTooltip>
        ));
    }, [view.viewId, view.shortcuts, view.sort, showFilters, showSorts, hasActiveFilters]);

    return {viewSettingsShortcutsButtons: isEnabled ? viewSettingsShortcutsButtons : null};
};
