import {type Dispatch, useMemo} from 'react';
import {useConfirmModal} from '_ui/hooks/useConfirmModal/useConfirmModal';
import {
    type ActivateRecordsMutation,
    type DeactivateRecordsMutation,
    useActivateRecordsMutation,
    useDeactivateRecordsMutation,
    useDeleteValueMutation,
} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useValuesCacheUpdate} from '_ui/hooks/useValuesCacheUpdate';
import {type FeatureHook, type Entrypoint, type IEntrypointLink, type IItemAction, type IItemData} from '../_types';
import {type IViewSettingsAction, type IViewSettingsState, ViewSettingsActionTypes} from '../manage-view-settings-v2';
import {MASS_SELECTION_ALL} from '../_constants';
import {BREAK_TWO_LINES, ERROR_NOTIFICATION_DURATION, SUCCESS_NOTIFICATION_DURATION} from '_ui/constants';
import {type FetchResult} from '@apollo/client';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTrash, faTrashRestore} from '@fortawesome/free-solid-svg-icons';
import {KitAlert} from 'aristid-ds';

/**
 * Hook used to get the action for `<DataView />` component.
 *
 * When the mutation for removing is done, the Apollo cache will be clean (`Record` and `RecordIdentity`)
 * from removed record.
 *
 * @param isEnabled - whether the action is present
 * @param view - represent the current view
 * @param dispatch - method to change the current view
 * @param entrypoint - represent the current entrypoint
 * @param canDeleteLinkValues - check permission to delete link values
 */
export const useEditStatusItemAction = ({
    isEnabled,
    canDeleteLinkValues,
    store: {view, dispatch},
    onRemove,
    entrypoint,
}: FeatureHook<{
    store: {
        view: IViewSettingsState;
        dispatch: Dispatch<IViewSettingsAction>;
    };
    canDeleteLinkValues: boolean;
    onRemove?: IItemAction['callback'];
    entrypoint: Entrypoint;
}>) => {
    const {t} = useSharedTranslation();
    const {openConfirmModal} = useConfirmModal();
    const updateValuesCache = useValuesCacheUpdate();

    const [deactivateRecordsMutation] = useDeactivateRecordsMutation({
        update(cache, deactivatedRecords) {
            deactivatedRecords.data?.deactivateRecords.forEach(record => {
                cache.evict({
                    id: cache.identify(record),
                });
            });
            cache.modify({
                fields: {
                    records: prev => ({
                        ...prev,
                        totalCount: prev.totalCount - 1,
                    }),
                },
                broadcast: false,
            });
            cache.gc();
        },
    });

    const [activateRecordsMutation] = useActivateRecordsMutation({
        update(cache, activatedRecords) {
            activatedRecords.data?.activateRecords.forEach(record => {
                cache.evict({
                    id: cache.identify(record),
                });
            });
            cache.modify({
                fields: {
                    records: prev => ({
                        ...prev,
                        totalCount: prev.totalCount - 1,
                    }),
                },
                broadcast: false,
            });
            cache.gc();
        },
    });

    const [deleteRecordLinkMutation] = useDeleteValueMutation({
        update: (_, deletedRecord) => {
            const parentRecord = {
                id: (entrypoint as IEntrypointLink).parentRecordId,
                library: {
                    id: (entrypoint as IEntrypointLink).parentLibraryId,
                },
            };
            updateValuesCache(parentRecord, deletedRecord.data?.deleteValue ?? []);
        },
    });

    const displayAlert = ({type}: {type: 'success' | 'error'}) => {
        KitAlert[type]({
            showIcon: true,
            duration: type === 'success' ? SUCCESS_NOTIFICATION_DURATION : ERROR_NOTIFICATION_DURATION,
            closable: true,
            message: t(`explorer.item_deleted_${type}`),
            description: null,
        });
    };

    const _deactivateItem = async (item: IItemData): Promise<FetchResult<DeactivateRecordsMutation>> => {
        const libRes = await deactivateRecordsMutation({
            variables: {
                libraryId: item.libraryId,
                recordsIds: [item.itemId],
            },
        });

        if (view.massSelection !== MASS_SELECTION_ALL) {
            dispatch({
                type: ViewSettingsActionTypes.SET_SELECTED_KEYS,
                payload: view.massSelection.filter(key => key !== item.itemId),
            });
        }

        if ((libRes.data?.deactivateRecords ?? []).length > 0) {
            displayAlert({type: 'success'});
            onRemove?.(item);
        } else {
            displayAlert({type: 'error'});
        }
        return libRes;
    };

    const _activateItem = async (item: IItemData): Promise<FetchResult<ActivateRecordsMutation>> => {
        const libRes = await activateRecordsMutation({
            variables: {
                libraryId: item.libraryId,
                recordsIds: [item.itemId],
            },
        });

        if (view.massSelection !== MASS_SELECTION_ALL) {
            dispatch({
                type: ViewSettingsActionTypes.SET_SELECTED_KEYS,
                payload: view.massSelection.filter(key => key !== item.itemId),
            });
        }

        return libRes;
    };

    const _editStatusItemAction: IItemAction = useMemo(
        () => ({
            label: (item: IItemData) =>
                entrypoint.type === 'library'
                    ? item.active
                        ? t('explorer.deactivate-item')
                        : t('explorer.activate-item')
                    : t('explorer.delete-item'),
            icon: (item: IItemData) => (
                <FontAwesomeIcon icon={entrypoint.type === 'library' && !item.active ? faTrashRestore : faTrash} />
            ),
            isDanger: true,
            disabled: (item: IItemData) =>
                entrypoint.type === 'link' ? !canDeleteLinkValues : item.active ? !item.canDelete : !item.canActivate,
            callback: item => {
                const {itemId, id_value} = item;

                const title =
                    entrypoint.type === 'library'
                        ? item.active
                            ? t('explorer.deactivate_item_one')
                            : t('explorer.activate_item_one')
                        : t('explorer.delete_link_one');

                const content =
                    entrypoint.type === 'library'
                        ? item.active
                            ? t('explorer.deactivate_item_description_one')
                            : t('explorer.activate_item_description_one')
                        : t('explorer.delete_link_description_one');

                openConfirmModal({
                    title,
                    content: content + BREAK_TWO_LINES + t('global.are_you_sure'),
                    onOk: async () => {
                        switch (entrypoint.type) {
                            case 'library':
                                if (item.active) {
                                    return _deactivateItem(item);
                                }

                                return _activateItem(item);
                            case 'link':
                                const linkRes = await deleteRecordLinkMutation({
                                    variables: {
                                        library: entrypoint.parentLibraryId,
                                        attribute: entrypoint.linkAttributeId,
                                        recordId: entrypoint.parentRecordId,
                                        value: {
                                            payload: itemId,
                                            id_value,
                                        },
                                    },
                                });
                                onRemove?.(item);
                                return linkRes;
                            default:
                                return;
                        }
                    },
                });
            },
        }),
        [
            t,
            deactivateRecordsMutation,
            deleteRecordLinkMutation,
            activateRecordsMutation,
            canDeleteLinkValues,
            entrypoint.type,
            view.massSelection,
            dispatch,
        ],
    );

    return {
        editStatusItemAction: isEnabled ? _editStatusItemAction : null,
    };
};
