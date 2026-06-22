import {useState} from 'react';
import {useTranslation} from 'react-i18next';
import {KitButton, KitTooltip} from 'aristid-ds';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faClone, faRotateLeft, faSave, faTrash} from '@fortawesome/free-solid-svg-icons';
import {useLang} from '@leav/ui';
import {useCurrentView} from '../store-current-view/useCurrentView';
import {useCurrentViewActions} from './useCurrentViewActions';
import {ShareControl} from './ShareControl';
import {SharedByLabel} from './SharedByLabel';
import {ForkViewModal} from './ForkViewModal';
import {actions, actionButtons} from './currentViewSection.module.css';

export const CurrentViewActions = ({canEditAdminView}: {canEditAdminView: boolean}) => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {view, isOwner, isDirty, isEmptyView, resetView} = useCurrentView();
    const {save, saveLoading, fork, forkLoading, toggleShared, shareLoading} = useCurrentViewActions();
    const [isForkModalOpen, setIsForkModalOpen] = useState(false);

    //TODO: That might change in the future, depending on whether the user is admin or not.
    // No CRUD action in the default (empty) state: there is no view to act on.
    if (!view || isEmptyView) {
        return null;
    }

    const hasLabel = (view.label?.[lang[0]] ?? '').trim() !== '';
    const canSave = isDirty && hasLabel;
    const canShare = isOwner && canEditAdminView;

    return (
        <div className={actions}>
            {canShare ? (
                <ShareControl shared={view.shared} onToggleShared={toggleShared} disabled={shareLoading} />
            ) : (
                <SharedByLabel createdByLabel={view.created_by.whoAmI.label} />
            )}
            <div className={actionButtons}>
                {isOwner && (
                    <KitTooltip title={String(t('view_settings.current_view.save'))}>
                        <KitButton
                            type="secondary"
                            size="m"
                            disabled={!canSave}
                            loading={saveLoading}
                            aria-label={String(t('view_settings.current_view.save'))}
                            icon={<FontAwesomeIcon icon={faSave} />}
                            onClick={save}
                        />
                    </KitTooltip>
                )}
                <KitTooltip title={String(t('view_settings.current_view.clone'))}>
                    <KitButton
                        type="secondary"
                        size="m"
                        loading={forkLoading}
                        aria-label={String(t('view_settings.current_view.clone'))}
                        icon={<FontAwesomeIcon icon={faClone} />}
                        onClick={() => setIsForkModalOpen(true)}
                    />
                </KitTooltip>
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
                {/* TODO: Implement deletion functionality in LEAVC-934 */}
                {isOwner && (
                    <KitTooltip title={String(t('view_settings.current_view.delete'))}>
                        <KitButton
                            type="secondary"
                            size="m"
                            disabled
                            danger
                            aria-label={String(t('view_settings.current_view.delete'))}
                            icon={<FontAwesomeIcon icon={faTrash} />}
                        />
                    </KitTooltip>
                )}
            </div>
            <ForkViewModal isOpen={isForkModalOpen} onClose={() => setIsForkModalOpen(false)} onSubmit={fork} />
        </div>
    );
};
