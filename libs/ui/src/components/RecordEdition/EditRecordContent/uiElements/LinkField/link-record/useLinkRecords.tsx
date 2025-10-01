// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Explorer} from '_ui/components/Explorer';
import {type IExplorerRef} from '_ui/components/Explorer/Explorer';
import {type ComponentProps, type Dispatch, type SetStateAction, useEffect, useState} from 'react';
import {ExplorerWrapper} from '../shared/ExplorerWrapper';
import {DeleteAllValuesButton} from '../../shared/DeleteAllValuesButton';
import {type DeleteMultipleValuesFunc} from '../../../_types';
import {type JoinLibraryContextFragment, type RecordFormAttributeLinkAttributeFragment} from '_ui/_gqlTypes';
import {type RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import {AntForm, KitSpace} from 'aristid-ds';
import {useExplorerLinkRecords} from './useExplorerLinkRecords';
import {FaList} from 'react-icons/fa';
import {ActionButton} from './ActionButton';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';

interface ILinkRecords {
    libraryId: string;
    recordId: string;
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

export const useLinkRecords = ({
    libraryId,
    recordId,
    isFormCreationMode,
    attribute,
    joinLibraryContext,
    columnsToDisplay,
    backendValues,
    setBackendValues,
    isReadOnly,
    isFieldInError,
    hasNoValue,
    onDeleteMultipleValues
}: ILinkRecords) => {
    const {t} = useSharedTranslation();
    const form = AntForm.useFormInstance();
    const [explorerActions, setExplorerActions] = useState<IExplorerRef | null>(null);

    const {
        handleDeleteAllValues,
        handleExplorerCreateValue,
        handleExplorerLinkValue,
        handleExplorerMassDeactivateValues,
        handleExplorerRemoveValue
    } = useExplorerLinkRecords({
        attribute,
        backendValues,
        setBackendValues,
        onDeleteMultipleValues
    });

    const _handleExplorerRef = (ref: IExplorerRef) => {
        if (_shouldUpdateExplorerActions(ref, explorerActions)) {
            setExplorerActions({
                createAction: ref?.createAction,
                linkAction: ref?.linkAction,
                totalCount: ref?.totalCount
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

    return {
        UnlinkAllRecords: backendValues.length > 1 && attribute.multiple_values && !attribute.required && (
            <DeleteAllValuesButton handleDelete={handleDeleteAllValues} disabled={isReadOnly} danger={isFieldInError} />
        ),
        LinkRecordsExplorer: recordId && (
            <>
                <ExplorerWrapper>
                    <Explorer
                        ref={_handleExplorerRef}
                        defaultViewSettings={{
                            attributesIds: columnsToDisplay
                        }}
                        entrypoint={{
                            type: 'link',
                            parentLibraryId: libraryId,
                            parentRecordId: recordId,
                            linkAttributeId: attribute.id
                        }}
                        defaultCallbacks={{
                            item: {
                                remove: handleExplorerRemoveValue
                            },
                            mass: {
                                deactivate: handleExplorerMassDeactivateValues
                            },
                            primary: {
                                link: handleExplorerLinkValue,
                                create: handleExplorerCreateValue
                            }
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
                        joinLibraryContext={joinLibraryContext}
                        hidePrimaryActions
                        hideTableHeader
                    />
                </ExplorerWrapper>
                <KitSpace size="xs" style={{padding: '1rem'}}>
                    {explorerActions?.createAction && (
                        <ActionButton
                            type="secondary"
                            size="m"
                            $hasNoValue={hasNoValue}
                            icon={explorerActions?.createAction?.icon}
                            disabled={isReadOnly || explorerActions?.createAction?.disabled}
                            onClick={explorerActions?.createAction?.callback}
                        >
                            {explorerActions?.createAction?.label}
                        </ActionButton>
                    )}
                    <ActionButton
                        type="secondary"
                        size="m"
                        $hasNoValue={hasNoValue}
                        icon={<FaList />}
                        disabled={isReadOnly || (attribute.multiple_values && explorerActions?.linkAction?.disabled)}
                        onClick={explorerActions?.linkAction?.callback}
                    >
                        {explorerActions?.linkAction?.label}
                    </ActionButton>
                </KitSpace>
            </>
        )
    };
};
