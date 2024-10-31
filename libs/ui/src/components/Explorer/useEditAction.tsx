// Copyright LEAV Solutions 2017
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {FaPen} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {EditRecordModal} from '_ui/components';
import {RecordFilterCondition, useExplorerLazyQuery} from '_ui/_gqlTypes';
import {ActionHook, DataGroupedFilteredSorted, ItemActions} from './types';

/**
 * Hook used to get the action for `<DataView />` component.
 *
 * When the mutation for editing is done, the Apollo cache will be refreshed (`Record` and `RecordIdentity`)
 * from only edited record.
 *
 * It returns also two parts : one for the action button call - one for displaying the modal required by the action.
 *
 * @param isEnabled - whether the action is present
 */
export const useEditAction = ({isEnabled}: ActionHook) => {
    const {t} = useSharedTranslation();

    const [refreshItem] = useExplorerLazyQuery({fetchPolicy: 'network-only'});

    const [editingItem, setEditingItem] = useState<null | DataGroupedFilteredSorted<'whoAmI'>[number]>(null);

    const _editAction: ItemActions<any>[number] = {
        label: t('explorer.editItem'),
        icon: <FaPen />,
        callback: item => {
            setEditingItem(item);
        }
    };

    const _handleEditModalClose = (item: DataGroupedFilteredSorted<'whoAmI'>[number]) => {
        refreshItem({
            variables: {
                libraryId: item.libraryId,
                filters: [
                    {
                        condition: RecordFilterCondition.EQUAL,
                        field: 'id',
                        value: item.itemId
                    }
                ]
            }
        });
        setEditingItem(null);
    };

    return {
        editAction: isEnabled ? _editAction : null,
        editModal:
            isEnabled && editingItem !== null ? (
                <EditRecordModal
                    open
                    record={editingItem.value}
                    library={editingItem.libraryId}
                    onClose={() => _handleEditModalClose(editingItem)}
                />
            ) : null
    };
};
