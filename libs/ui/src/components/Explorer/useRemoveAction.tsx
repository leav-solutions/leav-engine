// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FaTrash} from 'react-icons/fa';
import {KitModal} from 'aristid-ds';
import {useDeactivateRecordsMutation, useDeleteValueMutation} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ActionHook, Entrypoint, IEntrypointLink, IItemAction} from './_types';
import {useMemo} from 'react';
import {useValuesCacheUpdate} from '_ui/hooks';

/**
 * Hook used to get the action for `<DataView />` component.
 *
 * When the mutation for removing is done, the Apollo cache will be clean (`Record` and `RecordIdentity`)
 * from removed record.
 *
 * @param isEnabled - whether the action is present
 */
export const useRemoveAction = (
    {isEnabled}: ActionHook,
    entrypoint: Entrypoint
): {removeAction: IItemAction | null} => {
    const {t} = useSharedTranslation();
    const updateValuesCache = useValuesCacheUpdate();

    const [deactivateRecordsMutation] = useDeactivateRecordsMutation({
        update(cache, deactivatedRecords) {
            deactivatedRecords.data?.deactivateRecords.forEach(record => {
                cache.evict({
                    id: cache.identify(record)
                });
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

    const _removeAction: IItemAction = useMemo(
        () => ({
            label: t('explorer.remove-item'),
            icon: <FaTrash />,
            isDanger: true,
            callback: ({itemId, libraryId, id_value}) => {
                KitModal.confirm({
                    type: 'confirm',
                    dangerConfirm: true,
                    content:
                        entrypoint.type === 'library'
                            ? t('records_deactivation.confirm_one')
                            : t('record_edition.delete_link_confirm'),
                    okText: t('global.submit') ?? undefined,
                    cancelText: t('global.cancel') ?? undefined,
                    onOk: () => {
                        switch (entrypoint.type) {
                            case 'library':
                                deactivateRecordsMutation({
                                    variables: {
                                        libraryId,
                                        recordsIds: [itemId]
                                    }
                                });
                                break;
                            case 'link':
                                deleteRecordLinkMutation({
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
                                break;
                            default:
                                return;
                        }
                    }
                });
            }
        }),
        [t, deactivateRecordsMutation, deleteRecordLinkMutation]
    );

    return {
        removeAction: isEnabled ? _removeAction : null
    };
};
