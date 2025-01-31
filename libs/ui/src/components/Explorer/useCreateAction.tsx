// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {useState} from 'react';
import {FaPlus} from 'react-icons/fa';
import {EditRecordModal} from '_ui/components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ActionHook, Entrypoint, IEntrypointLink, IPrimaryAction} from './_types';
import useSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {useExplorerLinkAttributeQuery} from '_ui/_gqlTypes';

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
    entrypoint,
    itemsCount,
    refetch
}: ActionHook<{
    library: string;
    entrypoint: Entrypoint;
    itemsCount: number;
    refetch: () => void;
}>) => {
    const {t} = useSharedTranslation();

    const [isRecordCreationVisible, setRecordCreationVisible] = useState(false);
    const [multipleValues, setIsMultivalues] = useState(false);
    const {saveValues} = useSaveValueBatchMutation();

    useExplorerLinkAttributeQuery({
        skip: entrypoint.type !== 'link',
        variables: {
            id: (entrypoint as IEntrypointLink).linkAttributeId
        },
        onCompleted: data => {
            const attributeData = data?.attributes?.list?.[0];
            if (!attributeData) {
                throw new Error('Unknown link attribute');
            }
            setIsMultivalues(attributeData.multiple_values);
        }
    });

    const canCreateRecord = entrypoint.type === 'library' ? true : multipleValues || itemsCount === 0;

    const createAction: IPrimaryAction = {
        callback: () => {
            setRecordCreationVisible(true);
        },
        icon: <FaPlus />,
        disabled: !canCreateRecord,
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
                onCreate={newRecord => {
                    refetch();
                    setRecordCreationVisible(false);
                    if (entrypoint.type === 'link') {
                        saveValues(
                            {
                                id: entrypoint.parentRecordId,
                                library: {
                                    id: entrypoint.parentLibraryId
                                }
                            },
                            [
                                {
                                    attribute: entrypoint.linkAttributeId,
                                    idValue: null,
                                    value: newRecord.id
                                }
                            ]
                        );
                    }
                }}
                submitButtons={['create']}
            />
        ) : null
    };
};
