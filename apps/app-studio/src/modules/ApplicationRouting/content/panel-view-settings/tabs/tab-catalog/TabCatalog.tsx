import {useCallback, useState} from 'react';
import {useLang, usePanelEventHandlers} from '@leav/ui';
import {KitAlert, KitBadge, KitItemList, KitSpace, KitTag, KitTypography} from 'aristid-ds';
import {type IKitActionButton} from 'aristid-ds/dist/Kit/DataDisplay/types';
import {useTranslation} from 'react-i18next';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBookmark, faCopy} from '@fortawesome/free-solid-svg-icons';
import {localizedTranslation} from '@leav/utils';
import {INFO_NOTIFICATION_DURATION} from '_ui/constants';
import cn from 'classnames';
import {type AppStudioInternalEvent} from '../../../../types';
import {useCurrentView} from '../../store-current-view/useCurrentView';
import {useCurrentViewActions} from '../../current-view-section/useCurrentViewActions';
import {UnsavedViewChangesModal} from './UnsavedViewChangesModal';
import {type View, useViewCatalog} from './useViewCatalog';
import {useLastUsedView} from './useLastUsedView';
import {
    emptyBadge,
    emptyBox,
    heading,
    iconBox,
    isCurrentView,
    primaryIcon,
    sectionTitle,
    viewItem,
} from './tabCatalog.module.css';

export const TabCatalog = ({libraryId}: {libraryId: string}) => {
    const {t} = useTranslation();
    const {lang} = useLang();

    const {myViews, sharedViews} = useViewCatalog(libraryId);
    const {view: currentLoadedView, isDirty, isEmptyView} = useCurrentView();
    const {save, saveLoading} = useCurrentViewActions();

    const {dispatch} = usePanelEventHandlers<AppStudioInternalEvent>();
    const {saveLastUsedView} = useLastUsedView();

    // The view we're about to switch to, deferred until the unsaved-changes modal is resolved.
    // The modal is open iff this is non-null (mirrors CurrentViewActions' isForkModalOpen pattern).
    const [pendingViewId, setPendingViewId] = useState<string | null>(null);

    // Same rule as `canSave` in CurrentViewActions: a view without a label can't be saved.
    const hasLabel = (currentLoadedView?.label?.[lang[0]] ?? '').trim() !== '';

    const applySelection = (id: string) => {
        saveLastUsedView(id);
        dispatch({type: 'view-settings-select-view', data: {viewId: id}});
    };

    const selectView = (id: string) => {
        // Clicking the already-loaded view is a no-op (avoids a spurious confirmation modal).
        if (id === currentLoadedView?.id) {
            return;
        }

        // Gate the selection at the source: the event also drives the Explorer and the app-settings
        // highlight, so confirming here keeps every consumer in sync on cancel.
        if (isDirty) {
            setPendingViewId(id);
            return;
        }

        applySelection(id);
    };

    const handleDiscard = () => {
        if (pendingViewId !== null) {
            applySelection(pendingViewId);
        }
        setPendingViewId(null);
    };

    const handleSave = async () => {
        const ok = await save();
        // On failure save() already surfaced the error notif; keep the modal open so edits aren't lost.
        if (ok && pendingViewId !== null) {
            applySelection(pendingViewId);
            setPendingViewId(null);
        }
    };

    // The view id is only useful once the view is shared, so copying it is disabled until then.
    // The disabled button cannot carry its own tooltip through the DS actions API, so the
    // explanation is exposed as a native title on the row (see `getDisabledCopyTitle` below).
    const getViewActions = (view: View): IKitActionButton[] => [
        {
            key: 'copy-id',
            label: String(t('view_settings.copy_id')),
            icon: <FontAwesomeIcon icon={faCopy} />,
            disabled: !view.shared,
            onClick: async e => {
                (e as {stopPropagation?: () => void}).stopPropagation?.();
                await navigator.clipboard.writeText(view.id);
                KitAlert.info({
                    message: localizedTranslation(view.label, lang),
                    description: String(t('view_settings.id_copied')),
                    duration: INFO_NOTIFICATION_DURATION,
                    closable: true,
                });
            },
        },
    ];

    // Native title fallback so the disabled copy button still explains why it is disabled.
    const getDisabledCopyTitle = (view: View): string | undefined =>
        view.shared ? undefined : String(t('view_settings.copy_id_disabled'));

    // Render in the default (empty) state too, so a view can be selected when none is loaded yet.
    if (!currentLoadedView && !isEmptyView) {
        return null;
    }

    return (
        <KitSpace direction="vertical" size="l" className="full-width">
            <KitSpace direction="vertical" size="m" className="full-width">
                <div className={sectionTitle}>
                    <KitTypography.Title level="h4" className={heading}>
                        {t('view_settings.my_views')}
                    </KitTypography.Title>
                    {myViews.length > 0 ? (
                        <KitBadge count={myViews.length} color="primary" secondaryColorInvert />
                    ) : (
                        <KitBadge count={0} showZero className={emptyBadge} />
                    )}
                </div>
                {myViews.length === 0 ? (
                    <KitTypography.Text className={cn(emptyBox, viewItem)}>
                        {t('view_settings.my_views_empty')}
                    </KitTypography.Text>
                ) : (
                    <KitSpace direction="vertical" size="xs" className="full-width">
                        {myViews.map(view => (
                            // TODO: add modified tag when view is modified
                            <KitItemList
                                key={view.id}
                                className={cn(viewItem, {[isCurrentView]: view.id === currentLoadedView?.id})}
                                actions={getViewActions(view)}
                                title={getDisabledCopyTitle(view)}
                                idCardProps={{
                                    title: (
                                        <KitSpace size="xs">
                                            {localizedTranslation(view.label, lang)}
                                            {view.shared && (
                                                <KitTag type="success" size="small">
                                                    {t('view_settings.current_view.shared')}
                                                </KitTag>
                                            )}
                                        </KitSpace>
                                    ),
                                    avatar: (
                                        <span className={iconBox}>
                                            <FontAwesomeIcon icon={faBookmark} className={primaryIcon} />
                                        </span>
                                    ),
                                }}
                                onClick={() => selectView(view.id)}
                            />
                        ))}
                    </KitSpace>
                )}
            </KitSpace>
            <KitSpace direction="vertical" size="m" className="full-width">
                <div className={sectionTitle}>
                    <KitTypography.Title level="h4" className={heading}>
                        {t('view_settings.shared_views')}
                    </KitTypography.Title>
                    {sharedViews.length > 0 ? (
                        <KitBadge count={sharedViews.length} color="primary" secondaryColorInvert />
                    ) : (
                        <KitBadge count={0} showZero className={emptyBadge} />
                    )}
                </div>
                {sharedViews.length === 0 ? (
                    <KitTypography.Text className={cn(emptyBox, viewItem)}>
                        {t('view_settings.shared_views_empty')}
                    </KitTypography.Text>
                ) : (
                    <KitSpace direction="vertical" size="xs" className="full-width">
                        {sharedViews.map(view => (
                            // TODO: add modified tag when view is modified
                            <KitItemList
                                key={view.id}
                                className={cn(viewItem, {[isCurrentView]: view.id === currentLoadedView?.id})}
                                actions={getViewActions(view)}
                                title={getDisabledCopyTitle(view)}
                                idCardProps={{
                                    title: localizedTranslation(view.label, lang),
                                    avatar: (
                                        <span className={iconBox}>
                                            <FontAwesomeIcon icon={faBookmark} className={primaryIcon} />
                                        </span>
                                    ),
                                }}
                                onClick={() => selectView(view.id)}
                            />
                        ))}
                    </KitSpace>
                )}
            </KitSpace>
            <UnsavedViewChangesModal
                isOpen={pendingViewId !== null}
                saveLoading={saveLoading}
                canSave={hasLabel}
                onClose={() => setPendingViewId(null)}
                onDiscard={handleDiscard}
                onSave={handleSave}
            />
        </KitSpace>
    );
};
