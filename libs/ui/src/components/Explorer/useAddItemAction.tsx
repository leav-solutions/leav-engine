// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {FaPlus} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ActionHook, IPrimaryAction} from './_types';
import {AddLinkModal} from './link-item/AddLinkModal';

/**
 * Hook used to get the action for `<DataView />` component.
 *
 * When items are linked, the view is refreshed
 *
 * It returns also two parts : one for the call action button - one for displaying the modal required by the action.
 *
 * @param isEnabled - whether the action is present
 * @param library - the library's id to add new item
 * @param maxItemsLeft - the number of items that can be added
 */
export const useAddItemAction = ({
    isEnabled,
    library,
    maxItemsLeft
}: ActionHook<{
    library: string;
    maxItemsLeft: number | null;
}>) => {
    const {t} = useSharedTranslation();

    const [isAddItemModalVisible, setIsAddItemModalVisible] = useState(false);

    const canAddItem = !maxItemsLeft || maxItemsLeft > 0;

    const addItemAction: IPrimaryAction = {
        callback: () => {
            setIsAddItemModalVisible(true);
        },
        icon: <FaPlus />,
        disabled: !canAddItem,
        label: t('explorer.add-existing-item')
    };

    return {
        addItemAction: isEnabled ? addItemAction : null,
        addItemModal: isAddItemModalVisible ? (
            <AddLinkModal
                open
                library={library}
                onClose={() => {
                    setIsAddItemModalVisible(false);
                }}
            />
        ) : null
    };
};
