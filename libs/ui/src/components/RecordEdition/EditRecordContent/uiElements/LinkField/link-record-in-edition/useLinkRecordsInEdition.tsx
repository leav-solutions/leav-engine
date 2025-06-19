// Copyright LEAV Solutions 2017 until 2023/11/05, Copyright Aristid from 2023/11/06
// This file is released under LGPL V3
// License text available at https://www.gnu.org/licenses/lgpl-3.0.txt
import {Explorer} from '_ui/components/Explorer';
import {IExplorerRef} from '_ui/components/Explorer/Explorer';
import {ComponentProps, Dispatch, SetStateAction, useEffect, useState} from 'react';
import {FaList} from 'react-icons/fa';
import {useSharedTranslation} from '_ui/hooks/useSharedTranslation';
import {ExplorerWrapper} from '../shared/ExplorerWrapper';
import {LinkActionsButtons} from '../shared/LinkActionsButtons';
import {DeleteAllValuesButton} from '../../shared/DeleteAllValuesButton';
import {DeleteMultipleValuesFunc} from '../../../_types';
import {JoinLibraryContextFragment, RecordFormAttributeLinkAttributeFragment} from '_ui/_gqlTypes';
import {RecordFormElementsValueLinkValue} from '_ui/hooks/useGetRecordForm';
import {AntForm, KitSelect} from 'aristid-ds';
import {
    EditRecordReducerActionsTypes,
    IEditRecordReducerActions,
    IRecordPropertyWithAttribute
} from '_ui/components/RecordEdition/editRecordReducer/editRecordReducer';
import {useLinkRecords} from './useLinkRecords';
import {useGetRecordValuesQuery} from '_ui/hooks/useGetRecordValuesQuery/useGetRecordValuesQuery';
import {GetRecordColumnsValuesRecord, IRecordColumnValueLink} from '_ui/_queries/records/getRecordColumnsValues';
import {IKitOption} from 'aristid-ds/dist/Kit/DataEntry/Select/types';
import LinkSelect from '_ui/components/LinkSelect';

interface ILinkRecordsInCreationProps {
    libraryId: string;
    recordId: string;
    attribute: RecordFormAttributeLinkAttributeFragment;
    joinLibraryContext: JoinLibraryContextFragment;
    columnsToDisplay: ComponentProps<typeof Explorer>['defaultViewSettings']['attributesIds'];
    backendValues: RecordFormElementsValueLinkValue[];
    setBackendValues: Dispatch<SetStateAction<RecordFormElementsValueLinkValue[]>>;
    activeAttribute: IRecordPropertyWithAttribute | null;
    dispatch: Dispatch<IEditRecordReducerActions>;
    isHookUsed: boolean;
    isReadOnly: boolean;
    isFieldInError: boolean;
    tagDisplayMode: boolean;
    hasNoValue: boolean;
    onDeleteMultipleValues: DeleteMultipleValuesFunc;
}

const _shouldUpdateExplorerActions = (ref: IExplorerRef, explorerActions: IExplorerRef) =>
    ref?.createAction?.disabled !== explorerActions?.createAction?.disabled ||
    ref?.linkAction?.disabled !== explorerActions?.linkAction?.disabled ||
    ref?.totalCount !== explorerActions?.totalCount;

export const useLinkRecordsInEdition = ({
    libraryId,
    recordId,
    attribute,
    joinLibraryContext,
    columnsToDisplay,
    backendValues,
    setBackendValues,
    activeAttribute,
    dispatch,
    isHookUsed,
    isReadOnly,
    isFieldInError,
    tagDisplayMode,
    hasNoValue,
    onDeleteMultipleValues
}: ILinkRecordsInCreationProps) => {
    const {t} = useSharedTranslation();
    const [explorerActions, setExplorerActions] = useState<IExplorerRef | null>(null);
    const form = AntForm.useFormInstance();

    const {
        handleDeleteAllValues,
        handleExplorerCreateValue,
        handleExplorerLinkValue,
        handleExplorerMassDeactivateValues,
        handleExplorerRemoveValue
    } = useLinkRecords({
        attribute,
        backendValues,
        setBackendValues,
        onDeleteMultipleValues
    });

    useEffect(() => {
        if (isHookUsed && backendValues.length === 0 && attribute.required) {
            // Set field in error when LinkField is displayed for the first time. Otherwise, errors will be handled by _removeValues() or _handleExplorerLinkValue()
            form.setFields([
                {
                    name: attribute.id,
                    errors: [t('errors.standard_field_required')]
                }
            ]);
        }
    }, []);

    useEffect(() => {
        if (isHookUsed && activeAttribute?.attribute.id === attribute.id) {
            // Update active value used in the sidebar when backendValues change
            dispatch({
                type: EditRecordReducerActionsTypes.SET_ACTIVE_VALUE,
                values: backendValues
            });
        }
    }, [backendValues]);

    const {data: fieldValues} = useGetRecordValuesQuery(libraryId, [attribute.id], [recordId]);

    const selectOptions = (
        (fieldValues?.[recordId] as GetRecordColumnsValuesRecord<IRecordColumnValueLink>)?.[attribute.id] ?? []
    ).map(
        ({linkValue: record}) =>
            ({
                value: record.id,
                label: record.whoAmI.label ?? record.whoAmI.id,
                idCard: {
                    description: record.whoAmI.label ?? record.whoAmI.id,
                    avatarProps: {
                        size: 'small',
                        shape: 'square',
                        imageFit: 'contain',
                        src: record.whoAmI.preview?.small,
                        label: record.whoAmI.label ?? record.whoAmI.id
                    }
                }
            }) satisfies IKitOption
    );

    const _handleExplorerRef = (ref: IExplorerRef) => {
        if (_shouldUpdateExplorerActions(ref, explorerActions)) {
            setExplorerActions({
                createAction: ref?.createAction,
                linkAction: ref?.linkAction,
                totalCount: ref?.totalCount
            });
        }
    };

    const _getExplorerItemActions = (): Array<'edit' | 'remove'> => {
        if (isReadOnly) {
            return [];
        }

        if (
            (!attribute.multiple_values && attribute.required) ||
            (attribute.multiple_values && backendValues.length === 1 && attribute.required)
        ) {
            return ['edit'];
        }

        return ['edit', 'remove'];
    };

    return {
        UnlinkAllRecordsInEdition: isHookUsed &&
            backendValues.length > 1 &&
            attribute.multiple_values &&
            !attribute.required && (
                <DeleteAllValuesButton
                    handleDelete={handleDeleteAllValues}
                    disabled={isReadOnly}
                    danger={isFieldInError}
                />
            ),
        LinkRecordsInEditionExplorer:
            isHookUsed &&
            recordId &&
            (tagDisplayMode ? (
                <LinkSelect
                    tagDisplay={true}
                    options={selectOptions}
                    defaultValues={selectOptions.map(({value}) => value)}
                    onUpdateSelection={() => null}
                    onCreate={() => null}
                    onAdvanceSearch={() => null}
                ></LinkSelect>
            ) : (
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
                            joinLibraryContext={joinLibraryContext}
                            defaultActionsForItem={_getExplorerItemActions()}
                            hidePrimaryActions
                            hideTableHeader
                            iconsOnlyItemActions
                        />
                    </ExplorerWrapper>
                    <LinkActionsButtons
                        createButtonProps={{
                            icon: explorerActions?.createAction?.icon,
                            label: explorerActions?.createAction?.label,
                            callback: explorerActions?.createAction?.callback,
                            disabled: isReadOnly || explorerActions?.createAction?.disabled
                        }}
                        linkButtonProps={{
                            icon: <FaList />,
                            label: explorerActions?.linkAction?.label,
                            callback: explorerActions?.linkAction?.callback,
                            disabled: isReadOnly || (attribute.multiple_values && explorerActions?.linkAction?.disabled)
                        }}
                        hasNoValue={hasNoValue}
                    />
                    {/* KEEP for dev in progress
                     <LinkSelect
                        tagDisplay={false}
                        options={selectOptions}
                        defaultValues={selectOptions.map(({value}) => value)}
                        onUpdateSelection={() => null}
                        onCreate={() => null}
                        onAdvanceSearch={() => null}
                    ></LinkSelect> */}
                </>
            ))
    };
};
