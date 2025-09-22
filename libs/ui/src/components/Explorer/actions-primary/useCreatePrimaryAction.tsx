// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {type ReactElement, useState} from 'react';
import {FaPlus} from 'react-icons/fa';
import {KitAlert} from 'aristid-ds';
import {CreateDirectory, EditRecordModal, UploadFiles} from '_ui/components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import useSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {type ISubmitMultipleResult} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {
    AttributeType,
    type JoinLibraryContextFragment,
    LibraryBehavior,
    useExplorerLibraryDetailsQuery
} from '_ui/_gqlTypes';
import {type FeatureHook, type Entrypoint, type IPrimaryAction} from '../_types';
import {CREATE_RECORD_MODAL_CLASSNAME} from '../_constants';
import {SUCCESS_ALERT_DURATION} from '_ui/constants';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';

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
    const {lang} = useLang();

    const [isModalCreationVisible, setIsModalCreationVisible] = useState(false);
    const {saveValues} = useSaveValueBatchMutation();

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
    if (joinLibraryContext?.mandatoryAttribute?.type === AttributeType.tree) {
        canCreateRecord = false;
    } else if (entrypoint.type === 'library') {
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

    const _notifyNewCreation = (label?: string | null) => {
        KitAlert.success({
            showIcon: true,
            duration: SUCCESS_ALERT_DURATION,
            message: t('items_list.created_in_success.message', {
                libName:
                    localizedTranslation(data?.libraries?.list[0]?.label, lang) ||
                    t('items_list.created_in_success.item')
            }),
            description: t('items_list.created_in_success.description', {
                libName:
                    localizedTranslation(data?.libraries?.list[0]?.label, lang) ||
                    t('items_list.created_in_success.item'),
                itemName: label || t('items_list.created_in_success.item')
            }),
            closable: true
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
                        _notifyNewCreation(t('upload.file'));
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
                        _notifyNewCreation(t('upload.folder'));
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
                        _notifyNewCreation(newRecord.label);
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
