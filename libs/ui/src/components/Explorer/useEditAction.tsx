// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {FaPen} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {EditRecordModal} from '_ui/components/RecordEdition/EditRecordModal';
import {RecordFilterCondition, useExplorerLazyQuery} from '_ui/_gqlTypes';
import {ActionHook, IItemAction, IItemData} from './_types';

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

    const [editingItem, setEditingItem] = useState<null | IItemData>(null);

    const _editAction: IItemAction = {
        label: t('explorer.edit-item'),
        icon: <FaPen />,
        callback: item => {
            setEditingItem(item);
        }
    };

    const _handleEditModalClose = (item: IItemData) => {
        refreshItem({
            variables: {
                libraryId: item.libraryId,
                attributeIds: ['id'],
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
                    record={editingItem.whoAmI}
                    library={editingItem.libraryId}
                    onClose={() => _handleEditModalClose(editingItem)}
                />
            ) : null
    };
};