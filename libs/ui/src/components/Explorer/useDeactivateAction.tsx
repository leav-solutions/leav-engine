// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {FaTrash} from 'react-icons/fa';
import {KitModal} from 'aristid-ds';
import {useDeactivateRecordsMutation} from '_ui/_gqlTypes';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {DataGroupedFilteredSorted, ItemActions} from './types';

/**
 * Hook used to get the action for `<DataView />` component.
 *
 * When the mutation for deactivation is done, the Apollo cache will be clean (`Record` and `RecordIdentity`)
 * from deactivated record.
 *
 * @param isEnabled - whether the action is present
 */
export const useDeactivateAction = (isEnabled: boolean) => {
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

    const _deactivateAction: ItemActions<DataGroupedFilteredSorted<'whoAmI'>[number]>[number] = {
        label: t('explorer.deactivateItem'),
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
    };

    return {
        deactivateAction: isEnabled ? _deactivateAction : null
    };
};
