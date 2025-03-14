// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Dispatch, useMemo, useState} from 'react';
import {FaTrash} from 'react-icons/fa';
import {KitModal} from 'aristid-ds';
import {useDeactivateRecordsMutation, useDeleteValueMutation, useExplorerLinkAttributeQuery} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useValuesCacheUpdate} from '_ui/hooks/useValuesCacheUpdate';
import {FeatureHook, Entrypoint, IEntrypointLink, IItemAction, IItemData} from '../_types';
import {IViewSettingsAction, IViewSettingsState, ViewSettingsActionTypes} from '../manage-view-settings';
import {MASS_SELECTION_ALL} from '../_constants';
import {use} from 'i18next';

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
 */
export const useRemoveItemAction = ({
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

    const _removeItemAction: IItemAction = useMemo(
        () => ({
            label: entrypoint.type === 'library' ? t('explorer.deactivate-item') : t('explorer.delete-item'),
            icon: <FaTrash />,
            isDanger: true,
            disabled: (item: IItemData) => (entrypoint.type === 'link' ? !canDeleteLinkValues : !item.canDelete),
            callback: item => {
                const {itemId, libraryId, id_value} = item;
                KitModal.confirm({
                    type: 'confirm',
                    dangerConfirm: true,
                    content:
                        entrypoint.type === 'library'
                            ? t('records_deactivation.confirm_one')
                            : t('record_edition.delete_link_confirm'),
                    okText: t('global.submit') ?? undefined,
                    cancelText: t('global.cancel') ?? undefined,
                    onOk: async () => {
                        switch (entrypoint.type) {
                            case 'library':
                                const libRes = await deactivateRecordsMutation({
                                    variables: {
                                        libraryId,
                                        recordsIds: [itemId]
                                    }
                                });
                                if (view.massSelection !== MASS_SELECTION_ALL) {
                                    dispatch({
                                        type: ViewSettingsActionTypes.SET_SELECTED_KEYS,
                                        payload: view.massSelection.filter(key => key !== itemId)
                                    });
                                }
                                onRemove?.(item);
                                return libRes;
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
            canDeleteLinkValues,
            entrypoint.type,
            view.massSelection,
            dispatch
        ]
    );

    return {
        removeItemAction: isEnabled ? _removeItemAction : null
    };
};
