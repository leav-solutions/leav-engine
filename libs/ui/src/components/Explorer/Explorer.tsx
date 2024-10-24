// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ComponentProps, FunctionComponent, useState} from 'react';
import {FaTrash} from 'react-icons/fa';
import {KitModal} from 'aristid-ds';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useDeactivateRecordsMutation} from '_ui/_gqlTypes';
import {DataView} from './DataView';
import {useExplorerData} from './useExplorerData';
import {ItemActions} from './types';

interface IExplorerProps {
    library: string;
    itemActions: ItemActions<any>;
    defaultActionsForItem?: [] | ['deactivate'] | ['edit'] | ['deactivate', 'edit'] | undefined;
}

export const Explorer: FunctionComponent<IExplorerProps> = ({
    library,
    itemActions,
    defaultActionsForItem = ['deactivate', 'edit']
}) => {
    const {t} = useSharedTranslation();

    const {data, loading} = useExplorerData(library); // TODO: refresh when go back on page
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

    const _deleteAction: ItemActions<any>[number] = {
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

    const actionsOnItem: ComponentProps<typeof DataView>['itemActions'] = defaultActionsForItem?.some(
        // TODO: try with Array.includes better typing
        a => a === 'deactivate'
    )
        ? [_deleteAction, ...itemActions]
        : itemActions;

    return (
        <div>
            {loading ? (
                'Loading...'
            ) : (
                <DataView
                    dataGroupedFilteredSorted={data?.filter(({itemId}) => !deactivatedItemIds.includes(itemId)) ?? []}
                    attributesToDisplay={['itemId', 'whoAmI']}
                    itemActions={actionsOnItem}
                />
            )}
        </div>
    );
};
