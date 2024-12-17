// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FaTrash} from 'react-icons/fa';
import {KitModal} from 'aristid-ds';
import {useDeactivateRecordsMutation} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ActionHook, IItemAction} from './_types';
import {useMemo} from 'react';

/**
 * Hook used to get the action for `<DataView />` component.
 *
 * When the mutation for deactivation is done, the Apollo cache will be clean (`Record` and `RecordIdentity`)
 * from deactivated record.
 *
 * @param isEnabled - whether the action is present
 */
export const useDeactivateAction = ({isEnabled}: ActionHook) => {
    const {t} = useSharedTranslation();

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

    const _deactivateAction: IItemAction = useMemo(
        () => ({
            label: t('explorer.deactivate-item'),
            icon: <FaTrash />,
            isDanger: true,
            callback: ({itemId, libraryId}) =>
                KitModal.confirm({
                    type: 'confirm',
                    dangerConfirm: true,
                    content: t('records_deactivation.confirm_one') ?? undefined,
                    okText: t('global.submit') ?? undefined,
                    cancelText: t('global.cancel') ?? undefined,
                    onOk: () =>
                        deactivateRecordsMutation({
                            variables: {
                                libraryId,
                                recordsIds: [itemId]
                            }
                        })
                })
        }),
        [t, deactivateRecordsMutation]
    );

    return {
        deactivateAction: isEnabled ? _deactivateAction : null
    };
};
