// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {FaPlus} from 'react-icons/fa';
import {EditRecordModal} from '_ui/components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ActionHook, IPrimaryAction} from './_types';

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
export const useCreateAction = ({
    isEnabled,
    library,
    refetch
}: ActionHook<{
    library: string;
    refetch: () => void;
}>) => {
    const {t} = useSharedTranslation();

    const [isRecordCreationVisible, setRecordCreationVisible] = useState(false);

    const createAction: IPrimaryAction = {
        callback: () => {
            setRecordCreationVisible(true);
        },
        icon: <FaPlus />,
        label: t('explorer.create-one')
    };

    return {
        createAction: isEnabled ? createAction : null,
        createModal: isRecordCreationVisible ? (
            <EditRecordModal
                open
                record={null}
                library={library}
                onClose={() => {
                    setRecordCreationVisible(false);
                }}
                onCreate={() => {
                    refetch();
                    setRecordCreationVisible(false);
                }}
                submitButtons={['create']}
            />
        ) : null
    };
};
