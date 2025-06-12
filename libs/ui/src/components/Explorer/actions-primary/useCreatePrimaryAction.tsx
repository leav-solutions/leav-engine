// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {ReactElement, useState} from 'react';
import {FaPlus} from 'react-icons/fa';
import {useKitNotification} from 'aristid-ds';
import {CreateDirectory, EditRecordModal, UploadFiles} from '_ui/components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import useSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {ISubmitMultipleResult} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {LibraryBehavior, useExplorerLibraryDetailsQuery, useExplorerLinkAttributeQuery} from '_ui/_gqlTypes';
import {FeatureHook, Entrypoint, IEntrypointLink, IPrimaryAction} from '../_types';
import {CREATE_RECORD_MODAL_CLASSNAME} from '../_constants';

/**
 * Hook used to get the action for `<DataView />` component.
 *
 * When the creation is done, we refresh all data even if the new record will not be visible due to some filters.
 *
 * It returns also two parts : one for the call action button - one for displayed the modal required by the action.
 *
 * @param isEnabled - whether the action is present
 * @param libraryId - the library's id to add new item
 * @param entrypoint - represent the current entrypoint
 * @param totalCount - used for display purpose only
 * @param onCreate - callback to let outside world known about creating item (and linking)
 * @param refetch - method to call to refresh the list. New item will be visible if it matches filters and sorts
 */
export const useCreatePrimaryAction = ({
    isEnabled,
    libraryId,
    entrypoint,
    totalCount,
    canCreateAndLinkValue,
    onCreate,
    formId,
    refetch
}: FeatureHook<{
    libraryId: string;
    entrypoint: Entrypoint;
    totalCount: number;
    canCreateAndLinkValue: boolean;
    onCreate?: ({
        recordIdCreated,
        saveValuesResultOnLink
    }: {
        recordIdCreated: string;
        saveValuesResultOnLink?: ISubmitMultipleResult;
    }) => void;
    formId?: string;
    refetch: () => void;
}>) => {
    const {t} = useSharedTranslation();

    const [isModalCreationVisible, setIsModalCreationVisible] = useState(false);
    const [multipleValues, setIsMultivalues] = useState(false);
    const {saveValues} = useSaveValueBatchMutation();
    const {kitNotification} = useKitNotification();

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

    const {data, loading, error} = useExplorerLibraryDetailsQuery({variables: {libraryId}, skip: !isEnabled});

    if (error || loading) {
        return {createPrimaryAction: null, createModal: null};
    }

    let canCreateRecord;
    if (entrypoint.type === 'library') {
        canCreateRecord = true;
    } else {
        canCreateRecord = canCreateAndLinkValue && (multipleValues || totalCount === 0);
    }

    const _createPrimaryAction: IPrimaryAction = {
        callback: () => {
            setIsModalCreationVisible(true);
        },
        icon: <FaPlus />,
        disabled: !canCreateRecord,
        label: t('explorer.create-one')
    };

    const _notifyNewCreation = () => {
        kitNotification.success({
            message: t('items_list.created_in_success.message'),
            description: ''
        });
    };

    let _createModal: ReactElement | null = null;
    switch (data?.libraries?.list[0]?.behavior) {
        case LibraryBehavior.files:
            _createModal = (
                <UploadFiles
                    libraryId={libraryId}
                    multiple
                    onClose={() => setIsModalCreationVisible(false)}
                    onCompleted={() => {
                        refetch();
                        _notifyNewCreation();
                        setIsModalCreationVisible(false);
                    }}
                />
            );
            break;
        case LibraryBehavior.directories:
            _createModal = (
                <CreateDirectory
                    libraryId={libraryId}
                    onClose={() => setIsModalCreationVisible(false)}
                    onCompleted={() => {
                        refetch();
                        _notifyNewCreation();
                        setIsModalCreationVisible(false);
                    }}
                />
            );
            break;
        case LibraryBehavior.standard:
        case LibraryBehavior.join:
            _createModal = (
                <EditRecordModal
                    className={CREATE_RECORD_MODAL_CLASSNAME}
                    open
                    record={null}
                    library={libraryId}
                    creationFormId={formId}
                    onClose={() => {
                        setIsModalCreationVisible(false);
                    }}
                    onCreate={newRecord => {
                        refetch();
                        _notifyNewCreation();
                        setIsModalCreationVisible(false);
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
                            ).then(saveValuesResult => {
                                onCreate?.({recordIdCreated: newRecord.id, saveValuesResultOnLink: saveValuesResult});
                            });
                        } else {
                            onCreate?.({recordIdCreated: newRecord.id});
                        }
                    }}
                    submitButtons={['create']}
                />
            );
            break;
    }

    return {
        createPrimaryAction: isEnabled ? _createPrimaryAction : null,
        createModal: isModalCreationVisible ? _createModal : null
    };
};
