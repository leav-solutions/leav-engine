// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useMemo, useState} from 'react';
import {FaEye, FaPen} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {EditRecordModal} from '_ui/components/RecordEdition/EditRecordModal';
import {RecordFilterCondition, useExplorerLibraryDataLazyQuery} from '_ui/_gqlTypes';
import {FeatureHook, IItemAction, IItemData} from '../_types';
import {EDIT_RECORD_MODAL_CLASSNAME} from '../_constants';

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
export const useEditItemAction = ({
    isEnabled,
    formId,
    onEdit
}: FeatureHook<{
    onEdit?: IItemAction['callback'];
    formId?: string;
}>) => {
    const {t} = useSharedTranslation();

    const [refreshItem] = useExplorerLibraryDataLazyQuery({fetchPolicy: 'network-only'});

    const [editingItem, setEditingItem] = useState<null | IItemData>(null);

    const _editItemAction: IItemAction = {
        label: t('explorer.edit-item'),
        icon: <FaEye />,
        callback: item => {
            setEditingItem(item);
        }
    };

    const _handleEditModalClose = (item: IItemData) => {
        refreshItem({
            variables: {
                libraryId: item.libraryId,
                attributeIds: ['id'], // TODO: get list of displayed attributes stored in the view
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
        onEdit?.(item);
        setEditingItem(null);
    };

    const editAction = useMemo(
        () => ({
            editItemAction: isEnabled ? _editItemAction : null,
            editItemModal:
                isEnabled && editingItem !== null ? (
                    <EditRecordModal
                        className={EDIT_RECORD_MODAL_CLASSNAME}
                        open
                        editionFormId={formId}
                        record={editingItem.whoAmI}
                        library={editingItem.libraryId}
                        onClose={() => _handleEditModalClose(editingItem)}
                    />
                ) : null
        }),
        [isEnabled, editingItem]
    );

    return editAction;
};
