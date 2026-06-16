import {type ComponentProps, type ReactElement, useEffect, useState} from 'react';
import {type FeatureHook, type ViewSettingsShortcuts} from '../_types';
import {type IViewSettingsState} from '_ui/components/Explorer/manage-view-settings';
import {KitButton, KitTooltip} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowDownWideShort, faBookmark, faFilter, faList} from '@fortawesome/free-solid-svg-icons';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

type IViewSettingsStateV2 = IViewSettingsState & {shortcuts: ViewSettingsShortcuts[]};

export const useOpenViewSettingsV2 = ({
    view,
    open,
    closeViewSettings,
    onViewSettingsShortcutClick,
    isEnabled = true,
}: FeatureHook<{
    view: IViewSettingsStateV2;
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

    const mappingShortcutDisplayProps: Record<
        ViewSettingsShortcuts,
        Pick<ComponentProps<typeof KitButton>, 'icon' | 'aria-label'>
    > = {
        display: {
            icon: <FontAwesomeIcon icon={faList} />,
            'aria-label': String(t('explorer.viewSettings.display')),
        },
        filters: {
            icon: <FontAwesomeIcon icon={faFilter} />,
            'aria-label': String(t('explorer.viewSettings.filters')),
        },
        sorts: {
            icon: <FontAwesomeIcon icon={faArrowDownWideShort} />,
            'aria-label': String(t('explorer.viewSettings.sorts')),
        },
        catalog: {
            icon: <FontAwesomeIcon icon={faBookmark} />,
            'aria-label': String(t('explorer.viewSettings.catalog')),
        },
    };

    useEffect(() => {
        // TODO: add if view.shortcuts
        setViewSettingsShortcutsButtons(
            (['display', 'filters', 'sorts', 'catalog'] as const).map(shortcutName => (
                <KitTooltip key={shortcutName} title={mappingShortcutDisplayProps[shortcutName]['aria-label']}>
                    <KitButton
                        type="secondary"
                        size="m"
                        {...mappingShortcutDisplayProps[shortcutName]}
                        onClick={() => onViewSettingsShortcutClick?.({settingName: shortcutName, viewId: view.viewId!})}
                    />
                </KitTooltip>
            )),
        );
    }, [view.viewId]);

    return {viewSettingsShortcutsButtons: isEnabled ? viewSettingsShortcutsButtons : null};
};
