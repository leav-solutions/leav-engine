import {type ReactElement, useState} from 'react';
import {KitAlert} from 'aristid-ds';
import {CreateDirectory, EditRecordModal, UploadFiles} from '_ui/components';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import useSaveValueBatchMutation from '_ui/components/RecordEdition/EditRecordContent/hooks/useExecuteSaveValueBatchMutation';
import {type ISubmitMultipleResult} from '_ui/components/RecordEdition/EditRecordContent/_types';
import {AttributeType, type JoinLibraryContextFragment, LibraryBehavior} from '_ui/_gqlTypes';
import {type SystemTranslation} from '_ui/types/scalars';
import {type FeatureHook, type Entrypoint, type IPrimaryAction} from '../_types';
import {CREATE_RECORD_MODAL_CLASSNAME} from '../_constants';
import {SUCCESS_ALERT_DURATION} from '_ui/constants';
import {localizedTranslation} from '@leav/utils';
import {useLang} from '_ui/hooks';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPlus} from '@fortawesome/free-solid-svg-icons';

/**
 * Hook used to get the action for the `<DataView />` component.
 *
 * When the creation is done, we refresh all data even if the new record is not visible due to some filters.
 *
 * It returns also two parts: one for the call action button - one for displaying the modal required by the action.
 *
 * @param isEnabled - whether the action is present
 * @param isVisible - whether the button should be visible or not
 * @param libraryId - the library's id to add new item
 * @param libraryLabel - the library's raw (unlocalized) label, used in the creation notification
 * @param libraryBehavior - the library's behavior, picks which creation modal is rendered
 * @param hasCreateRecordPermission - whether the user may create a record in that library
 * @param entrypoint - represent the current entrypoint
 * @param totalCount - used for display purpose only
 * @param onCreate - callback to let outside world known about creating item (and linking)
 * @param refetch - method to call to refresh the list. A new item will be visible if it matches filters and sorts
 * @param refetchCount - method to call to refresh the count of the library. A new item will be visible if it matches filters and sorts
 */
export const useCreatePrimaryAction = ({
    isEnabled,
    isVisible,
    libraryId,
    libraryLabel,
    libraryBehavior,
    hasCreateRecordPermission,
    entrypoint,
    totalCount,
    canCreateAndLinkValue,
    isMultivalue,
    onCreate,
    formId,
    joinLibraryContext,
    refetch,
    refetchCount,
}: FeatureHook<{
    libraryId: string;
    libraryLabel: SystemTranslation | null;
    libraryBehavior: LibraryBehavior | null;
    hasCreateRecordPermission: boolean;
    entrypoint: Entrypoint;
    totalCount: number;
    canCreateAndLinkValue: boolean;
    isMultivalue: boolean;
    onCreate?: ({
        recordIdCreated,
        saveValuesResultOnLink,
    }: {
        recordIdCreated: string;
        saveValuesResultOnLink?: ISubmitMultipleResult;
    }) => void;
    joinLibraryContext?: JoinLibraryContextFragment;
    formId?: string;
    refetch: () => void;
    refetchCount: () => void;
}>) => {
    const {t} = useSharedTranslation();
    const {lang} = useLang();

    const [isModalCreationVisible, setIsModalCreationVisible] = useState(false);
    const {saveValues} = useSaveValueBatchMutation();

    /**
     * On a join library the creation targets the library linked by the mandatory attribute, not the
     * explored one. Its details (label / behavior / create_record) already travel in the form
     * fragment (`RecordFormAttribute`), so that case needs no request either: the hook is entirely
     * request-free, the explored library's details coming down as props from
     * `useExplorerLibraryMetadata`.
     */
    const joinLinkedLibrary =
        joinLibraryContext?.mandatoryAttribute && 'linked_library' in joinLibraryContext.mandatoryAttribute
            ? (joinLibraryContext.mandatoryAttribute.linked_library ?? null)
            : null;

    const targetLibraryId = joinLinkedLibrary?.id ?? libraryId;
    const targetLibraryLabel: SystemTranslation | null = joinLinkedLibrary ? joinLinkedLibrary.label : libraryLabel;
    const targetLibraryBehavior = joinLinkedLibrary ? joinLinkedLibrary.behavior : libraryBehavior;
    const targetCreatePermission = joinLinkedLibrary
        ? (joinLinkedLibrary.permissions?.create_record ?? false)
        : hasCreateRecordPermission;

    // A permission not known yet (metadata query still in flight, or library not found) reads as
    // `false`: no button until the library's details have actually landed.
    if (!isEnabled || !isVisible || !targetCreatePermission) {
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
        icon: <FontAwesomeIcon icon={faPlus} />,
        disabled: !canCreateRecord,
        label: t('explorer.create-one'),
    };

    const _notifyNewCreation = (label?: string | null) => {
        KitAlert.success({
            showIcon: true,
            duration: SUCCESS_ALERT_DURATION,
            message: t('items_list.created_in_success.message', {
                libName: localizedTranslation(targetLibraryLabel, lang) || t('items_list.created_in_success.item'),
            }),
            description: t('items_list.created_in_success.description', {
                libName: localizedTranslation(targetLibraryLabel, lang) || t('items_list.created_in_success.item'),
                itemName: label || t('items_list.created_in_success.item'),
            }),
            closable: true,
        });
    };

    let _createModal: ReactElement | null = null;
    switch (targetLibraryBehavior) {
        case LibraryBehavior.files:
            _createModal = (
                <UploadFiles
                    libraryId={targetLibraryId}
                    multiple
                    onClose={() => setIsModalCreationVisible(false)}
                    onCompleted={() => {
                        refetch();
                        refetchCount();
                        _notifyNewCreation(t('upload.file'));
                        setIsModalCreationVisible(false);
                    }}
                />
            );
            break;
        case LibraryBehavior.directories:
            _createModal = (
                <CreateDirectory
                    libraryId={targetLibraryId}
                    onClose={() => setIsModalCreationVisible(false)}
                    onCompleted={() => {
                        refetch();
                        refetchCount();
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
                    library={targetLibraryId}
                    creationFormId={formId}
                    onClose={() => {
                        setIsModalCreationVisible(false);
                    }}
                    onCreate={async newRecord => {
                        _notifyNewCreation(newRecord.label);
                        setIsModalCreationVisible(false);
                        if (entrypoint.type === 'link') {
                            await saveValues(
                                {
                                    id: entrypoint.parentRecordId,
                                    library: {
                                        id: entrypoint.parentLibraryId,
                                    },
                                },
                                [
                                    {
                                        attribute: entrypoint.linkAttributeId,
                                        idValue: null,
                                        value: newRecord.id,
                                    },
                                ],
                            ).then(async saveValuesResult =>
                                onCreate?.({
                                    recordIdCreated: newRecord.id,
                                    saveValuesResultOnLink: saveValuesResult,
                                }),
                            );
                        } else {
                            await Promise.resolve(onCreate?.({recordIdCreated: newRecord.id}));
                        }
                        refetch();
                        refetchCount();
                    }}
                    submitButtons={['create']}
                />
            );
            break;
    }

    return {
        createPrimaryAction: _createPrimaryAction,
        createModal: isModalCreationVisible ? _createModal : null,
    };
};
