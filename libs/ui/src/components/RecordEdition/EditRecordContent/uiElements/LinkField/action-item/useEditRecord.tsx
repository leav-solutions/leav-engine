// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {EditRecordModal} from '_ui/components/RecordEdition/EditRecordModal';
import {IItemData} from '_ui/components/Explorer/_types';
import {RecordFilterCondition, useExplorerLibraryDataLazyQuery} from '_ui/_gqlTypes';
import {EDIT_RECORD_MODAL_CLASSNAME} from '_ui/components/Explorer/_constants';

export const useEditRecord = () => {
    const [editingItem, setEditingItem] = useState<null | IItemData>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [refreshItem] = useExplorerLibraryDataLazyQuery({fetchPolicy: 'network-only'});

    const openModal = (item: IItemData) => {
        setEditingItem(item);
        setIsModalVisible(true);
    };

    const _handleEditModalClose = (item: IItemData) => {
        refreshItem({
            variables: {
                libraryId: item.libraryId,
                attributeIds: ['id'],
                pagination: {limit: 1},
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
        openModal,
        EditRecordModal:
            isModalVisible && editingItem !== null ? (
                <EditRecordModal
                    className={EDIT_RECORD_MODAL_CLASSNAME}
                    open
                    record={editingItem.whoAmI}
                    library={editingItem.libraryId}
                    onClose={() => _handleEditModalClose(editingItem)}
                />
            ) : null
    };
};
