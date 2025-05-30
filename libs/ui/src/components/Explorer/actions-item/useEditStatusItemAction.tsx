// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Dispatch, useMemo} from 'react';
import {FaTrash, FaTrashRestore} from 'react-icons/fa';
import {KitModal} from 'aristid-ds';
import {
    ActivateRecordsMutation,
    DeactivateRecordsMutation,
    useActivateRecordsMutation,
    useDeactivateRecordsMutation,
    useDeleteValueMutation
} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useValuesCacheUpdate} from '_ui/hooks/useValuesCacheUpdate';
import {FeatureHook, Entrypoint, IEntrypointLink, IItemAction, IItemData} from '../_types';
import {IViewSettingsAction, IViewSettingsState, ViewSettingsActionTypes} from '../manage-view-settings';
import {MASS_SELECTION_ALL} from '../_constants';
import {FetchResult} from '@apollo/client';

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
    entrypoint
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
    const updateValuesCache = useValuesCacheUpdate();

    const [deactivateRecordsMutation] = useDeactivateRecordsMutation({
        update(cache, deactivatedRecords) {
            deactivatedRecords.data?.deactivateRecords.forEach(record => {
                cache.evict({
                    id: cache.identify(record)
                });
            });
            cache.modify({
                fields: {
                    records: prev => ({
                        ...prev,
                        totalCount: prev.totalCount - 1
                    })
                },
                broadcast: false
            });
            cache.gc();
        }
    });

    const [activateRecordsMutation] = useActivateRecordsMutation({
        update(cache, activatedRecords) {
            activatedRecords.data?.activateRecords.forEach(record => {
                cache.evict({
                    id: cache.identify(record)
                });
            });
            cache.modify({
                fields: {
                    records: prev => ({
                        ...prev,
                        totalCount: prev.totalCount - 1
                    })
                },
                broadcast: false
            });
            cache.gc();
        }
    });

    const [deleteRecordLinkMutation] = useDeleteValueMutation({
        update: (_, deletedRecord) => {
            const parentRecord = {
                id: (entrypoint as IEntrypointLink).parentRecordId,
                library: {
                    id: (entrypoint as IEntrypointLink).parentLibraryId
                }
            };
            updateValuesCache(parentRecord, deletedRecord.data?.deleteValue ?? []);
        }
    });

    const _deactivateItem = async (item: IItemData): Promise<FetchResult<DeactivateRecordsMutation>> => {
        const libRes = await deactivateRecordsMutation({
            variables: {
                libraryId: item.libraryId,
                recordsIds: [item.itemId]
            }
        });

        if (view.massSelection !== MASS_SELECTION_ALL) {
            dispatch({
                type: ViewSettingsActionTypes.SET_SELECTED_KEYS,
                payload: view.massSelection.filter(key => key !== item.itemId)
            });
        }

        onRemove?.(item);

        return libRes;
    };

    const _activateItem = async (item: IItemData): Promise<FetchResult<ActivateRecordsMutation>> => {
        const libRes = await activateRecordsMutation({
            variables: {
                libraryId: item.libraryId,
                recordsIds: [item.itemId]
            }
        });

        if (view.massSelection !== MASS_SELECTION_ALL) {
            dispatch({
                type: ViewSettingsActionTypes.SET_SELECTED_KEYS,
                payload: view.massSelection.filter(key => key !== item.itemId)
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
            icon: (item: IItemData) =>
                entrypoint.type === 'library' ? item.active ? <FaTrash /> : <FaTrashRestore /> : <FaTrash />,
            isDanger: true,
            disabled: (item: IItemData) =>
                entrypoint.type === 'link' ? !canDeleteLinkValues : item.active ? !item.canDelete : !item.canActivate,
            callback: item => {
                const {itemId, id_value} = item;

                KitModal.confirm({
                    type: 'confirm',
                    dangerConfirm: true,
                    content:
                        entrypoint.type === 'library'
                            ? item.active
                                ? t('records_deactivation.confirm_one')
                                : t('records_activation.confirm_one')
                            : t('record_edition.delete_link_confirm'),
                    okText: t('global.submit') ?? undefined,
                    cancelText: t('global.cancel') ?? undefined,
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
                                            id_value
                                        }
                                    }
                                });
                                onRemove?.(item);
                                return linkRes;
                            default:
                                return;
                        }
                    }
                });
            }
        }),
        [
            t,
            deactivateRecordsMutation,
            deleteRecordLinkMutation,
            activateRecordsMutation,
            canDeleteLinkValues,
            entrypoint.type,
            view.massSelection,
            dispatch
        ]
    );

    return {
        editStatusItemAction: isEnabled ? _editStatusItemAction : null
    };
};
