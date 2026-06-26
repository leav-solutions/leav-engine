import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {KitBadge, KitButton, KitTooltip} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faClone, faRotateLeft, faSave} from '@fortawesome/free-solid-svg-icons';
import {useLang} from '@leav/ui';
import {useCurrentView} from '../store-current-view/useCurrentView';
import {useCurrentViewActions} from './useCurrentViewActions';
import {ShareControl} from './ShareControl';
import {SharedByLabel} from './SharedByLabel';
import {SaveAsViewModal} from './SaveAsViewModal';
import {actions, actionButtons} from './currentViewSection.module.css';

export const CurrentViewActions = ({canEditAdminView}: {canEditAdminView: boolean}) => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {view, canManageView, isDirty, isEmptyView, resetView} = useCurrentView();
    const {save, saveLoading, saveAs, saveAsLoading, toggleShared, shareLoading} = useCurrentViewActions();
    const [isSaveAsModalOpen, setIsSaveAsModalOpen] = useState(false);

    if (!view) {
        return null;
    }

    const saveAsButton = (
        <KitTooltip title={String(t('view_settings.current_view.save_as'))}>
            <KitBadge dot={isEmptyView && isDirty}>
                <KitButton
                    type={isEmptyView && isDirty ? 'primary' : 'secondary'}
                    size="m"
                    loading={saveAsLoading}
                    aria-label={String(t('view_settings.current_view.save_as'))}
                    icon={<FontAwesomeIcon icon={faClone} />}
                    onClick={() => setIsSaveAsModalOpen(true)}
                />
            </KitBadge>
        </KitTooltip>
    );

    const resetButton = (
        <KitTooltip title={String(t('view_settings.current_view.reset'))}>
            <KitButton
                type="secondary"
                size="m"
                disabled={!isDirty}
                aria-label={String(t('view_settings.current_view.reset'))}
                icon={<FontAwesomeIcon icon={faRotateLeft} />}
                onClick={resetView}
            />
        </KitTooltip>
    );

    const saveAsModal = (
        <SaveAsViewModal isOpen={isSaveAsModalOpen} onClose={() => setIsSaveAsModalOpen(false)} onSubmit={saveAs} />
    );

    // Default (empty) view state: only an admin can configure the reference view, and only via
    // "Save as" (create a real view from the synthetic draft) + "Reset" (revert to the empty draft).
    if (isEmptyView) {
        if (!canEditAdminView) {
            return null;
        }

        return (
            <div className={actions}>
                <div className={actionButtons}>
                    {saveAsButton}
                    {resetButton}
                </div>
                {saveAsModal}
            </div>
        );
    }

    const hasLabel = (view.label?.[lang[0]] ?? '').trim() !== '';
    const canSave = isDirty && hasLabel;
    const canShare = canEditAdminView && canManageView;

    return (
        <div className={actions}>
            {canShare ? (
                <ShareControl shared={view.shared} onToggleShared={toggleShared} disabled={shareLoading} />
            ) : (
                <SharedByLabel createdByLabel={view.created_by.whoAmI.label} />
            )}
            <div className={actionButtons}>
                {canManageView && (
                    <KitTooltip title={String(t('view_settings.current_view.save'))}>
                        <KitBadge dot={canSave}>
                            <KitButton
                                type="primary"
                                size="m"
                                disabled={!canSave}
                                loading={saveLoading}
                                aria-label={String(t('view_settings.current_view.save'))}
                                icon={<FontAwesomeIcon icon={faSave} />}
                                onClick={save}
                            />
                        </KitBadge>
                    </KitTooltip>
                )}
                {saveAsButton}
                {resetButton}
            </div>
            {saveAsModal}
        </div>
    );
};
