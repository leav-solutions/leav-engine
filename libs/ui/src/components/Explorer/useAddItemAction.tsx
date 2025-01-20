// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {FaPlus} from 'react-icons/fa';
import {EditRecordModal} from '_ui/components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ActionHook, Entrypoint, IEntrypointLink, IPrimaryAction} from './_types';
import useSaveValueBatchMutation from '../RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {useExplorerLinkAttributeQuery} from '_ui/_gqlTypes';
import {DisplayExplorerModal} from './display-explorer-modal/DisplayExplorerModal';

/**
 * Hook used to get the action for `<DataView />` component.
 *
 * When the creation is done, we refresh all data even if the new record will not be visible due to some filters.
 *
 * It returns also two parts : one for the call action button - one for displayed the modal required by the action.
 *
 * @param isEnabled - whether the action is present
 * @param library - the library's id to add new item
 * @param refetch - method to call to refresh the list. New item will be visible if it matches filters and sorts
 */
export const useAddItemAction = ({
    isEnabled,
    entrypoint,
    library,
    maxItemsLeft,
    refetch
}: ActionHook<{
    entrypoint: Entrypoint;
    library: string;
    maxItemsLeft: number | null;
    refetch: () => void;
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
            <DisplayExplorerModal
                open
                entrypoint={entrypoint as IEntrypointLink}
                library={library}
                onClose={() => {
                    setIsAddItemModalVisible(false);
                }}
            />
        ) : null
    };
};
