import {useDeactivateRecordsMutation} from '_ui/_gqlTypes';
import {ItemActions} from '_ui/components/Explorer/types';
import {FaTrash} from 'react-icons/fa';
import {ComponentProps, useState} from 'react';
import {DataView} from '_ui/components/Explorer/DataView';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {KitModal} from 'aristid-ds';

export const useDeactivateAction = (isEnabled: boolean) => {
    const {t} = useSharedTranslation();

    const [deactivatedItemIds, setDeactivatedItemIds] = useState<string[]>([]);

    const [deactivateRecords] = useDeactivateRecordsMutation();
    const _deactivateItem = async ({itemId, libraryId}) => {
        await deactivateRecords({
            variables: {
                libraryId,
                recordsIds: [itemId]
            }
        });

        setDeactivatedItemIds([...deactivatedItemIds, itemId]);
    };

    const _deactivateAction: ItemActions<any>[number] = {
        label: t('explorer.deactivateItem'),
        icon: <FaTrash />,
        isDanger: true,
        callback: item =>
            KitModal.confirm({
                type: 'confirm',
                dangerConfirm: true,
                content: t('records_deactivation.confirm_one') ?? undefined,
                okText: t('global.submit') ?? undefined,
                cancelText: t('global.cancel') ?? undefined,
                onOk: () => _deactivateItem(item)
            })
    };

    return {
        deactivateAction: isEnabled ? _deactivateAction : null,
        deactivatedItemIds
    };
};
