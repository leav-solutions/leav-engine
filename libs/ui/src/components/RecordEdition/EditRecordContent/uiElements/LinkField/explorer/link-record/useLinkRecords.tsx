import {Explorer} from '_ui/components/Explorer';
import {type IExplorerRef} from '_ui/components/Explorer/Explorer';
import {type ComponentProps, type Dispatch, type SetStateAction, useEffect, useState} from 'react';
import {type DeleteMultipleValuesFunc} from '../../../../_types';
import {type JoinLibraryContextFragment, type RecordFormAttributeLinkAttributeFragment} from '_ui/_gqlTypes';
import {type RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import {AntForm, KitButton, KitSpace, KitTooltip} from 'aristid-ds';
import {useExplorerLinkRecords} from './useExplorerLinkRecords';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {useEditRecordModal} from '_ui/components/RecordEdition/EditRecordModal/useEditRecordModal';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faEye, faPlus} from '@fortawesome/free-solid-svg-icons';
import {INPUT_MAX_HEIGHT} from '../../../../formConstants';
import styled from 'styled-components';

interface ILinkRecords {
    libraryId: string;
    recordId: string;
    editionFormId: string;
    isFormCreationMode: boolean;
    attribute: RecordFormAttributeLinkAttributeFragment;
    joinLibraryContext: JoinLibraryContextFragment;
    columnsToDisplay: ComponentProps<typeof Explorer>['defaultViewSettings']['attributesIds'];
    backendValues: RecordFormElementsValueLinkValue[];
    setBackendValues: Dispatch<SetStateAction<RecordFormElementsValueLinkValue[]>>;
    isReadOnly: boolean;
    isFieldInError: boolean;
    hasNoValue: boolean;
    onDeleteMultipleValues: DeleteMultipleValuesFunc;
}

const _shouldUpdateExplorerActions = (ref: IExplorerRef, explorerActions: IExplorerRef) =>
    ref?.createAction?.disabled !== explorerActions?.createAction?.disabled ||
    ref?.linkAction?.disabled !== explorerActions?.linkAction?.disabled ||
    ref?.totalCount !== explorerActions?.totalCount;

const ActionButton = styled(KitButton)<{$hasNoValue: boolean}>`
    margin-top: ${props => (props.$hasNoValue ? 0 : 'calc((var(--general-spacing-xs)) * 1px)')};
`;

export const useLinkRecords = ({
    libraryId,
    recordId,
    editionFormId,
    isFormCreationMode,
    attribute,
    joinLibraryContext,
    columnsToDisplay,
    backendValues,
    setBackendValues,
    isReadOnly,
    hasNoValue,
}: ILinkRecords) => {
    const {t} = useSharedTranslation();
    const form = AntForm.useFormInstance();
    const [explorerActions, setExplorerActions] = useState<IExplorerRef | null>(null);

    const {
        handleExplorerCreateValue,
        handleExplorerLinkValue,
        handleExplorerMassDeactivateValues,
        handleExplorerRemoveValue,
    } = useExplorerLinkRecords({
        attribute,
        backendValues,
        setBackendValues,
    });

    const _handleExplorerRef = (ref: IExplorerRef) => {
        if (_shouldUpdateExplorerActions(ref, explorerActions)) {
            setExplorerActions({
                createAction: ref?.createAction,
                linkAction: ref?.linkAction,
                totalCount: ref?.totalCount,
            });
        }
    };

    const _getExplorerItemActions = (): Array<'remove'> => {
        if (isReadOnly) {
            return [];
        }

        if (
            (!attribute.multiple_values && attribute.required) ||
            (attribute.multiple_values && backendValues.length === 1 && attribute.required)
        ) {
            return [];
        }

        return ['remove'];
    };

    useEffect(() => {
        if (!isFormCreationMode && backendValues.length === 0 && attribute.required) {
            form.setFields([{name: attribute.id, errors: [t('errors.standard_field_required')]}]);
        }
    }, []);

    const {EditRecordModal, openEditRecordModal} = useEditRecordModal();

    return {
        LinkRecordsExplorer: recordId && (
            <>
                <Explorer
                    ref={_handleExplorerRef}
                    defaultViewSettings={{
                        attributesIds: columnsToDisplay,
                    }}
                    entrypoint={{
                        type: 'link',
                        parentLibraryId: libraryId,
                        parentRecordId: recordId,
                        linkAttributeId: attribute.id,
                    }}
                    defaultCallbacks={{
                        item: {
                            remove: handleExplorerRemoveValue,
                        },
                        mass: {
                            deactivate: handleExplorerMassDeactivateValues,
                        },
                        primary: {
                            link: handleExplorerLinkValue,
                            create: handleExplorerCreateValue,
                        },
                    }}
                    showTitle={false}
                    showSearch={false}
                    selectionMode={attribute.multiple_values ? 'multiple' : 'simple'}
                    disableSelection={
                        isReadOnly ||
                        !attribute.multiple_values ||
                        (attribute.required && attribute.multiple_values && backendValues.length === 1)
                    }
                    defaultActionsForItem={_getExplorerItemActions()}
                    itemActions={[
                        {
                            label: t('explorer.edit-item'),
                            icon: <FontAwesomeIcon icon={faEye} />,
                            useItemActionOnRowClick: true,
                            callback: item => {
                                openEditRecordModal({
                                    library: item.libraryId,
                                    record: {
                                        id: item.itemId,
                                        label: item.whoAmI?.label,
                                        subLabel: item.whoAmI?.subLabel,
                                        color: item.whoAmI?.color,
                                        library: {id: item.libraryId},
                                    },
                                    editionFormId,
                                });
                            },
                        },
                    ]}
                    joinLibraryContext={joinLibraryContext}
                    hidePrimaryActions
                    hideTableHeader={!columnsToDisplay?.length}
                    useSmallHeaderSize
                    tableBodyHeight={INPUT_MAX_HEIGHT} // In a form we want the table body height at 320px
                />
                {!isReadOnly && (
                    <KitSpace size="xs" style={{padding: '1rem'}}>
                        <KitTooltip title={explorerActions?.linkAction?.label}>
                            <ActionButton
                                type="secondary"
                                size="m"
                                $hasNoValue={hasNoValue}
                                icon={<FontAwesomeIcon icon={faPlus} />}
                                disabled={
                                    isReadOnly || (attribute.multiple_values && explorerActions?.linkAction?.disabled)
                                }
                                onClick={explorerActions?.linkAction?.callback}
                                aria-label={explorerActions?.linkAction?.label}
                            />
                        </KitTooltip>
                    </KitSpace>
                )}
                {EditRecordModal}
            </>
        ),
    };
};
