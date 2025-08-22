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
import {
    JoinLibraryContextFragment,
    LibraryBehavior,
    useExplorerLibraryDetailsQuery
} from '_ui/_gqlTypes';
import {FeatureHook, Entrypoint, IPrimaryAction} from '../_types';
import {CREATE_RECORD_MODAL_CLASSNAME} from '../_constants';

/**
 * Hook used to get the action for `<DataView />` component.
 *
 * When the creation is done, we refresh all data even if the new record will not be visible due to some filters.
 *
 * It returns also two parts : one for the call action button - one for displayed the modal required by the action.
 *
 * @param isEnabled - whether the action is present
 * @param isVisible - wether the button should be visible or not
 * @param libraryId - the library's id to add new item
 * @param entrypoint - represent the current entrypoint
 * @param totalCount - used for display purpose only
 * @param onCreate - callback to let outside world known about creating item (and linking)
 * @param refetch - method to call to refresh the list. New item will be visible if it matches filters and sorts
 */
export const useCreatePrimaryAction = ({
    isEnabled,
    isVisible,
    libraryId,
    entrypoint,
    totalCount,
    canCreateAndLinkValue,
    isMultivalue,
    onCreate,
    formId,
    joinLibraryContext,
    refetch
}: FeatureHook<{
    libraryId: string;
    entrypoint: Entrypoint;
    totalCount: number;
    canCreateAndLinkValue: boolean;
    isMultivalue: boolean;
    onCreate?: ({
        recordIdCreated,
        saveValuesResultOnLink
    }: {
        recordIdCreated: string;
        saveValuesResultOnLink?: ISubmitMultipleResult;
    }) => void;
    joinLibraryContext?: JoinLibraryContextFragment;
    formId?: string;
    refetch: () => void;
}>) => {
    const {t} = useSharedTranslation();

    const [isModalCreationVisible, setIsModalCreationVisible] = useState(false);
    const {saveValues} = useSaveValueBatchMutation();
    const {kitNotification} = useKitNotification();

    const _getLibraryId = () =>
        (joinLibraryContext?.mandatoryAttribute &&
            'linked_library' in joinLibraryContext.mandatoryAttribute &&
            joinLibraryContext.mandatoryAttribute.linked_library?.id) ||
        libraryId;

    const {data, loading, error} = useExplorerLibraryDetailsQuery({
        variables: {libraryId: _getLibraryId()},
        skip: !isEnabled
    });

    if (error || loading || !isVisible) {
        return {createPrimaryAction: null, createModal: null};
    }

    let canCreateRecord;
    if (entrypoint.type === 'library') {
        canCreateRecord = true;
    } else {
        canCreateRecord = canCreateAndLinkValue && (isMultivalue || totalCount === 0);
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
                    libraryId={_getLibraryId()}
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
                    libraryId={_getLibraryId()}
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
                    library={_getLibraryId()}
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
