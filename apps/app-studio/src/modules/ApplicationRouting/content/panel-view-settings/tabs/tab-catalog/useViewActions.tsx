import {useLang, useConfirmModal, useUser} from '@leav/ui';
import {KitAlert} from 'aristid-ds';
import {type IKitActionButton} from 'aristid-ds/dist/Kit/DataDisplay/types';
import {useTranslation} from 'react-i18next';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCopy, faTrash} from '@fortawesome/free-solid-svg-icons';
import {localizedTranslation} from '@leav/utils';
import {INFO_NOTIFICATION_DURATION} from '_ui/constants';
import {useCurrentView} from '../../store-current-view/useCurrentView';
import {type View} from './useViewCatalog';
import {useDeleteView} from './useDeleteView';
import {dangerIcon} from './tabCatalog.module.css';
import cn from 'classnames';

interface IUseViewActionsResult {
    getViewActions: (view: View) => IKitActionButton[];
}

/**
 * Builds the per-row actions of a catalog view (copy id, delete). When the copy action is disabled,
 * a native title is carried by the copy icon itself to explain why.
 */
export const useViewActions = (libraryId: string): IUseViewActionsResult => {
    const {t} = useTranslation();
    const {lang} = useLang();
    const {userData} = useUser();
    const {view: currentLoadedView, canManageViews} = useCurrentView();
    const {deleteView} = useDeleteView();
    const {openConfirmModal} = useConfirmModal();

    const handleDeleteView = (view: View) => {
        openConfirmModal({
            title: t('view_settings.delete_view_confirm_title'),
            content: view.shared
                ? t('view_settings.delete_view_confirm_content_shared')
                : t('view_settings.delete_view_confirm_content'),
            dangerConfirm: true,
            onOk: () => deleteView(view.id, libraryId),
        });
    };

    // The view id is only useful once the view is shared, so copying it is disabled until then.
    // The disabled button cannot carry its own tooltip through the DS actions API, so the
    // explanation is exposed as a native title scoped to the copy icon.
    const getViewActions = (view: View): IKitActionButton[] => {
        const isOwner = view.created_by.id === userData?.userId;
        const isViewCurrentlyLoaded = view.id === currentLoadedView?.id;

        const actions: IKitActionButton[] = [
            {
                key: 'copy-id',
                label: String(t('view_settings.copy_id')),
                title: view.shared ? String(t('view_settings.copy_id_tooltip', {id: view.id})) : undefined,
                icon: (
                    <span title={view.shared ? undefined : String(t('view_settings.copy_id_disabled'))}>
                        <FontAwesomeIcon icon={faCopy} />
                    </span>
                ),
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

        if (isOwner || (canManageViews && view.shared)) {
            actions.push({
                key: 'delete',
                label: String(t('view_settings.delete_view')),
                title: String(t('view_settings.delete')),
                icon: <FontAwesomeIcon icon={faTrash} className={cn({[dangerIcon]: !isViewCurrentlyLoaded})} />,
                disabled: isViewCurrentlyLoaded,
                onClick: e => {
                    (e as {stopPropagation?: () => void}).stopPropagation?.();
                    handleDeleteView(view);
                },
            });
        }

        return actions;
    };

    return {getViewActions};
};
